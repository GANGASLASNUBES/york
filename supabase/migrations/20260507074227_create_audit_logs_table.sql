/*
  # Create Audit Logs Table

  1. New Tables
    - `audit_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `action` (text, the action performed)
      - `resource_type` (text, e.g. pin, alert, map, trail, source)
      - `resource_id` (text, nullable, the ID of the affected resource)
      - `metadata` (jsonb, additional context)
      - `ip_address` (text, nullable)
      - `created_at` (timestamptz)

  2. Security
    - RLS enabled
    - Only admin users (via app_metadata.role = 'admin') can SELECT
    - Insert allowed for authenticated users (to log their own actions)

  3. Indexes
    - user_id for filtering by user
    - action for filtering by action type
    - created_at DESC for chronological queries
*/

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  action text NOT NULL,
  resource_type text NOT NULL DEFAULT '',
  resource_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read audit logs
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audit_logs' AND policyname = 'Admins can view all audit logs') THEN
    CREATE POLICY "Admins can view all audit logs"
      ON audit_logs FOR SELECT TO authenticated
      USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
  END IF;
END $$;

-- Authenticated users can insert their own audit logs
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audit_logs' AND policyname = 'Users can insert own audit logs') THEN
    CREATE POLICY "Users can insert own audit logs"
      ON audit_logs FOR INSERT TO authenticated
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- Revoke anon access
REVOKE ALL ON audit_logs FROM anon;

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
