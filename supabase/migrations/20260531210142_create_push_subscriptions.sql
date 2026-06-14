/*
  # Create push notification subscriptions table

  ## Summary
  Stores Web Push API subscriptions per user + domain channel.
  Used by the push-relay edge function to fan out push notifications.

  ## New Tables
  - `push_subscriptions`
    - `id` (uuid, pk)
    - `user_id` (uuid, references auth.users)
    - `endpoint` (text, unique — the push service URL)
    - `p256dh` (text — ECDH public key)
    - `auth_key` (text — HMAC auth secret)
    - `channel` (text — 'LEXI_SITE' | 'BIPS_SITE' | 'GEAR_SITE' | 'ALL')
    - `user_agent` (text, optional — device hint)
    - `created_at` (timestamptz)
    - `last_used_at` (timestamptz)

  ## Security
  - RLS enabled, authenticated users can only manage own subscriptions
  - Service role used by edge function for fan-out reads
*/

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth_key text NOT NULL,
  channel text NOT NULL DEFAULT 'ALL',
  user_agent text,
  created_at timestamptz DEFAULT now(),
  last_used_at timestamptz DEFAULT now()
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own push subscriptions"
  ON push_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own push subscriptions"
  ON push_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own push subscriptions"
  ON push_subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own push subscriptions"
  ON push_subscriptions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS push_subscriptions_user_id_idx ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS push_subscriptions_channel_idx ON push_subscriptions(channel);
