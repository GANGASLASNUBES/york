/*
  # Avatar Keypack and CA Hierarchy

  1. Overview
    - Hierarchical CA model: Root -> Admin/Avatar/Impersonation/Service CAs
    - Multi-purpose avatar keypacks for Lexi (auth, art, edition, campaign, gamewear)
    - Impersonation session tracking for K/Kwamii sandbox
    - Certificate-bound scopes

  2. New Tables
    - `pki_avatar_keypacks` - Multi-purpose key collections for avatars
    - `pki_avatar_keys` - Individual keys within keypacks
    - `pki_impersonation_sessions` - Sandbox impersonation tracking
    - `pki_certificate_scopes` - Granular scope definitions
*/

-- Avatar key purpose enum (new name to avoid conflict)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pki_avatar_key_purpose') THEN
    CREATE TYPE pki_avatar_key_purpose AS ENUM (
      'auth',
      'art',
      'edition',
      'campaign',
      'gamewear',
      'webhook',
      'admin',
      'ops'
    );
  END IF;
END $$;

-- Certificate scope enum (new name)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pki_cert_scope') THEN
    CREATE TYPE pki_cert_scope AS ENUM (
      'art_sign',
      'art_verify',
      'edition_issue',
      'edition_verify',
      'campaign_publish',
      'campaign_verify',
      'gamewear_sign',
      'gamewear_verify',
      'avatar_suggest',
      'avatar_read',
      'avatar_write',
      'sandbox_impersonate',
      'admin_full',
      'admin_audit',
      'webhook_sign',
      'webhook_verify',
      'drop_create',
      'drop_sign',
      'drop_cosign',
      'provenance_append',
      'provenance_verify'
    );
  END IF;
END $$;

-- Avatar keypacks (collection of keys for an avatar)
CREATE TABLE IF NOT EXISTS pki_avatar_keypacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  avatar_id uuid NOT NULL,
  avatar_name text NOT NULL,
  tenant_id uuid NOT NULL REFERENCES pki_tenants(id) ON DELETE CASCADE,
  environment_id uuid NOT NULL REFERENCES pki_environments(id) ON DELETE CASCADE,
  avatar_ca_id uuid REFERENCES pki_certificate_authorities(id),
  is_primary boolean DEFAULT true NOT NULL,
  status text DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'suspended', 'revoked')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(avatar_id, tenant_id, environment_id)
);

-- Individual avatar keys
CREATE TABLE IF NOT EXISTS pki_avatar_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keypack_id uuid NOT NULL REFERENCES pki_avatar_keypacks(id) ON DELETE CASCADE,
  key_purpose pki_avatar_key_purpose NOT NULL,
  certificate_id uuid REFERENCES pki_certificates(id),
  key_name text NOT NULL,
  public_key text NOT NULL,
  private_key_encrypted text NOT NULL,
  fingerprint text NOT NULL UNIQUE,
  serial_number text NOT NULL UNIQUE,
  allowed_scopes pki_cert_scope[] NOT NULL,
  status text DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'suspended', 'revoked', 'rotating')),
  valid_from timestamptz DEFAULT now() NOT NULL,
  valid_until timestamptz NOT NULL,
  rotation_interval_days integer NOT NULL DEFAULT 365,
  last_rotated_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(keypack_id, key_purpose)
);

-- Certificate scopes (junction table for cert-to-scope binding)
CREATE TABLE IF NOT EXISTS pki_certificate_scopes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id uuid NOT NULL REFERENCES pki_certificates(id) ON DELETE CASCADE,
  scope pki_cert_scope NOT NULL,
  granted_by uuid REFERENCES auth.users(id),
  granted_at timestamptz DEFAULT now() NOT NULL,
  expires_at timestamptz,
  is_active boolean DEFAULT true NOT NULL,
  UNIQUE(certificate_id, scope)
);

-- Impersonation sessions
CREATE TABLE IF NOT EXISTS pki_impersonation_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  impersonator_id uuid NOT NULL,
  impersonator_name text NOT NULL,
  target_role text NOT NULL,
  target_avatar_id uuid,
  tenant_id uuid NOT NULL REFERENCES pki_tenants(id) ON DELETE CASCADE,
  environment_id uuid NOT NULL REFERENCES pki_environments(id) ON DELETE CASCADE,
  cert_fingerprint text NOT NULL,
  session_token text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now() NOT NULL,
  expires_at timestamptz NOT NULL,
  ended_at timestamptz,
  end_reason text,
  ip_address inet,
  user_agent text,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- CA hierarchy metadata
CREATE TABLE IF NOT EXISTS pki_ca_hierarchy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ca_id uuid NOT NULL REFERENCES pki_certificate_authorities(id) ON DELETE CASCADE,
  hierarchy_type text NOT NULL CHECK (hierarchy_type IN ('root', 'admin', 'avatar', 'impersonation', 'service')),
  trust_level integer NOT NULL DEFAULT 0,
  can_issue_to text[] DEFAULT '{}',
  max_path_length integer,
  constraints jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(ca_id)
);

-- Rotation policies per key type
CREATE TABLE IF NOT EXISTS pki_rotation_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  key_purpose pki_avatar_key_purpose NOT NULL,
  rotation_interval_days integer NOT NULL,
  overlap_hours integer DEFAULT 24 NOT NULL,
  auto_rotate boolean DEFAULT true NOT NULL,
  notify_days_before integer DEFAULT 7 NOT NULL,
  require_admin_approval boolean DEFAULT false NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Trigger function to enforce sandbox-only impersonation
CREATE OR REPLACE FUNCTION enforce_sandbox_impersonation()
RETURNS TRIGGER AS $$
DECLARE
  v_env RECORD;
BEGIN
  SELECT * INTO v_env FROM pki_environments WHERE id = NEW.environment_id;
  
  IF NOT v_env.allows_impersonation THEN
    RAISE EXCEPTION 'Impersonation sessions can only be created in sandbox-impersonation environment';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_sandbox_impersonation ON pki_impersonation_sessions;
CREATE TRIGGER trg_enforce_sandbox_impersonation
  BEFORE INSERT ON pki_impersonation_sessions
  FOR EACH ROW
  EXECUTE FUNCTION enforce_sandbox_impersonation();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_avatar_keypacks_avatar ON pki_avatar_keypacks(avatar_id);
CREATE INDEX IF NOT EXISTS idx_avatar_keypacks_tenant ON pki_avatar_keypacks(tenant_id, environment_id);
CREATE INDEX IF NOT EXISTS idx_avatar_keys_keypack ON pki_avatar_keys(keypack_id);
CREATE INDEX IF NOT EXISTS idx_avatar_keys_purpose ON pki_avatar_keys(key_purpose);
CREATE INDEX IF NOT EXISTS idx_avatar_keys_fingerprint ON pki_avatar_keys(fingerprint);
CREATE INDEX IF NOT EXISTS idx_avatar_keys_expiry ON pki_avatar_keys(valid_until) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_cert_scopes_cert ON pki_certificate_scopes(certificate_id);
CREATE INDEX IF NOT EXISTS idx_cert_scopes_scope ON pki_certificate_scopes(scope);
CREATE INDEX IF NOT EXISTS idx_impersonation_sessions_actor ON pki_impersonation_sessions(impersonator_id);
CREATE INDEX IF NOT EXISTS idx_impersonation_sessions_active ON pki_impersonation_sessions(expires_at) WHERE ended_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ca_hierarchy_ca ON pki_ca_hierarchy(ca_id);
CREATE INDEX IF NOT EXISTS idx_ca_hierarchy_type ON pki_ca_hierarchy(hierarchy_type);

-- Enable RLS
ALTER TABLE pki_avatar_keypacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE pki_avatar_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE pki_certificate_scopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pki_impersonation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pki_ca_hierarchy ENABLE ROW LEVEL SECURITY;
ALTER TABLE pki_rotation_policies ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Service role can manage avatar keypacks"
  ON pki_avatar_keypacks FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view active keypacks"
  ON pki_avatar_keypacks FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Service role can manage avatar keys"
  ON pki_avatar_keys FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view active keys"
  ON pki_avatar_keys FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Service role can manage certificate scopes"
  ON pki_certificate_scopes FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view active scopes"
  ON pki_certificate_scopes FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Service role can manage impersonation sessions"
  ON pki_impersonation_sessions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view their own impersonation sessions"
  ON pki_impersonation_sessions FOR SELECT
  TO authenticated
  USING (impersonator_id = auth.uid());

CREATE POLICY "Service role can manage CA hierarchy"
  ON pki_ca_hierarchy FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view CA hierarchy"
  ON pki_ca_hierarchy FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage rotation policies"
  ON pki_rotation_policies FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view rotation policies"
  ON pki_rotation_policies FOR SELECT
  TO authenticated
  USING (true);

-- Insert default rotation policies
INSERT INTO pki_rotation_policies (name, key_purpose, rotation_interval_days, overlap_hours, auto_rotate, notify_days_before, require_admin_approval) VALUES
  ('Avatar Auth Rotation', 'auth', 180, 48, true, 30, false),
  ('Art Signing Key Rotation', 'art', 365, 72, false, 60, true),
  ('Edition Signing Key Rotation', 'edition', 365, 72, false, 60, true),
  ('Campaign Key Rotation', 'campaign', 180, 24, true, 30, false),
  ('GameWear Key Rotation', 'gamewear', 365, 48, true, 30, false),
  ('Admin Key Rotation', 'admin', 180, 48, false, 30, true),
  ('Webhook Key Rotation', 'webhook', 90, 24, true, 14, false),
  ('Ops Key Rotation', 'ops', 90, 24, true, 14, false)
ON CONFLICT (name) DO NOTHING;

-- Function to create avatar keypack
CREATE OR REPLACE FUNCTION pki_create_avatar_keypack(
  p_avatar_id uuid,
  p_avatar_name text,
  p_tenant_id uuid,
  p_environment_id uuid,
  p_avatar_ca_id uuid DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_keypack_id uuid;
BEGIN
  INSERT INTO pki_avatar_keypacks (avatar_id, avatar_name, tenant_id, environment_id, avatar_ca_id)
  VALUES (p_avatar_id, p_avatar_name, p_tenant_id, p_environment_id, p_avatar_ca_id)
  RETURNING id INTO v_keypack_id;
  
  RETURN v_keypack_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if scope is allowed for certificate
CREATE OR REPLACE FUNCTION pki_check_certificate_scope(
  p_cert_id uuid,
  p_scope pki_cert_scope
)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM pki_certificate_scopes
    WHERE certificate_id = p_cert_id
    AND scope = p_scope
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get avatar key for specific purpose
CREATE OR REPLACE FUNCTION pki_get_avatar_key(
  p_avatar_id uuid,
  p_tenant_id uuid,
  p_environment_id uuid,
  p_purpose pki_avatar_key_purpose
)
RETURNS TABLE (
  key_id uuid,
  fingerprint text,
  public_key text,
  allowed_scopes pki_cert_scope[],
  valid_until timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ak.id,
    ak.fingerprint,
    ak.public_key,
    ak.allowed_scopes,
    ak.valid_until
  FROM pki_avatar_keys ak
  JOIN pki_avatar_keypacks kp ON ak.keypack_id = kp.id
  WHERE kp.avatar_id = p_avatar_id
    AND kp.tenant_id = p_tenant_id
    AND kp.environment_id = p_environment_id
    AND ak.key_purpose = p_purpose
    AND ak.status = 'active'
    AND kp.status = 'active'
    AND ak.valid_until > now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to start impersonation session
CREATE OR REPLACE FUNCTION pki_start_impersonation_session(
  p_impersonator_id uuid,
  p_impersonator_name text,
  p_target_role text,
  p_target_avatar_id uuid,
  p_tenant_id uuid,
  p_environment_id uuid,
  p_cert_fingerprint text,
  p_duration_minutes integer DEFAULT 60,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_session_id uuid;
  v_session_token text;
BEGIN
  v_session_token := ENCODE(gen_random_bytes(32), 'hex');
  
  INSERT INTO pki_impersonation_sessions (
    impersonator_id, impersonator_name, target_role, target_avatar_id,
    tenant_id, environment_id, cert_fingerprint, session_token,
    expires_at, ip_address, user_agent
  ) VALUES (
    p_impersonator_id, p_impersonator_name, p_target_role, p_target_avatar_id,
    p_tenant_id, p_environment_id, p_cert_fingerprint, v_session_token,
    now() + (p_duration_minutes || ' minutes')::interval,
    p_ip_address, p_user_agent
  ) RETURNING id INTO v_session_id;
  
  PERFORM log_pki_audit(
    'cert_issued'::pki_audit_action,
    'avatar',
    p_impersonator_id::text,
    'k-kwamii'::pki_gate_role,
    'impersonation_session',
    v_session_id,
    p_target_role,
    p_tenant_id,
    p_environment_id,
    true,
    NULL,
    NULL,
    jsonb_build_object('target_avatar_id', p_target_avatar_id, 'duration_minutes', p_duration_minutes),
    p_ip_address
  );
  
  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to end impersonation session
CREATE OR REPLACE FUNCTION pki_end_impersonation_session(
  p_session_id uuid,
  p_reason text DEFAULT 'manual'
)
RETURNS boolean AS $$
BEGIN
  UPDATE pki_impersonation_sessions
  SET ended_at = now(), end_reason = p_reason
  WHERE id = p_session_id AND ended_at IS NULL;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate impersonation session
CREATE OR REPLACE FUNCTION pki_validate_impersonation_session(p_session_token text)
RETURNS TABLE (
  is_valid boolean,
  session_id uuid,
  impersonator_name text,
  target_role text,
  target_avatar_id uuid,
  minutes_remaining integer
) AS $$
DECLARE
  v_session RECORD;
BEGIN
  SELECT * INTO v_session
  FROM pki_impersonation_sessions
  WHERE session_token = p_session_token
    AND ended_at IS NULL
    AND expires_at > now();
  
  IF FOUND THEN
    RETURN QUERY SELECT 
      true,
      v_session.id,
      v_session.impersonator_name,
      v_session.target_role,
      v_session.target_avatar_id,
      EXTRACT(EPOCH FROM (v_session.expires_at - now()) / 60)::integer;
  ELSE
    RETURN QUERY SELECT 
      false,
      NULL::uuid,
      NULL::text,
      NULL::text,
      NULL::uuid,
      0;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View for avatar keypack summary
CREATE OR REPLACE VIEW pki_avatar_keypack_summary AS
SELECT 
  kp.*,
  t.name as tenant_name,
  e.name as environment_name,
  (SELECT COUNT(*) FROM pki_avatar_keys ak WHERE ak.keypack_id = kp.id AND ak.status = 'active') as active_keys,
  (SELECT MIN(valid_until) FROM pki_avatar_keys ak WHERE ak.keypack_id = kp.id AND ak.status = 'active') as earliest_expiry
FROM pki_avatar_keypacks kp
JOIN pki_tenants t ON kp.tenant_id = t.id
JOIN pki_environments e ON kp.environment_id = e.id;

GRANT SELECT ON pki_avatar_keypack_summary TO authenticated;
