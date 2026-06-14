/*
  # Update admin_events table with missing columns

  1. Changes
    - Add `event_timestamp` (bigint) for unix timestamp in milliseconds
    - Add `scope` (text) for "admin" or "lexi" scoping
    - Add `user_id` (uuid) for the authenticated user reference

  2. Security
    - Enable RLS (if not already)
    - Add policies for authenticated access
    
  3. Indexes
    - Index on scope, actor, event_timestamp
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_events' AND column_name = 'event_timestamp'
  ) THEN
    ALTER TABLE admin_events ADD COLUMN event_timestamp bigint NOT NULL DEFAULT (extract(epoch from now()) * 1000)::bigint;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_events' AND column_name = 'scope'
  ) THEN
    ALTER TABLE admin_events ADD COLUMN scope text NOT NULL DEFAULT 'admin';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_events' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE admin_events ADD COLUMN user_id uuid;
  END IF;
END $$;

ALTER TABLE admin_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'admin_events' AND policyname = 'Users can insert own events'
  ) THEN
    CREATE POLICY "Users can insert own events"
      ON admin_events FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'admin_events' AND policyname = 'Users can read events by scope'
  ) THEN
    CREATE POLICY "Users can read events by scope"
      ON admin_events FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id OR scope = 'admin');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'admin_events' AND policyname = 'Users can update own events'
  ) THEN
    CREATE POLICY "Users can update own events"
      ON admin_events FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_admin_events_scope ON admin_events(scope);
CREATE INDEX IF NOT EXISTS idx_admin_events_actor ON admin_events(actor);
CREATE INDEX IF NOT EXISTS idx_admin_events_timestamp ON admin_events(event_timestamp DESC);
