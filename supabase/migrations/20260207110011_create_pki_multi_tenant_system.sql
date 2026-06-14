/*
  # PKI Multi-Tenant System

  1. Overview
    - Complete PKI infrastructure for multi-tenant civic-commerce platform
    - Supports tenants: foster-hardware, foster-link, red-ruby-home, bips-public, bips-internal
    - Environments: dev, staging, prod, sandbox-impersonation
    - Integrates with global gate system (Kee admin, Lexi avatar, K/Kwamii impersonation)

  2. New Tables
    - `pki_tenants` - Tenant definitions
    - `pki_environments` - Environment definitions
    - `pki_tenant_environments` - Tenant-environment matrix
    - `pki_certificate_authorities` - Root and intermediate CAs
    - `pki_certificates` - All issued certificates
    - `pki_certificate_claims` - Claims attached to certificates
    - `pki_revocations` - Certificate revocation entries
    - `pki_rotation_schedules` - Rotation policies
    - `pki_rotation_history` - Rotation history
    - `pki_webhook_keys` - Webhook signing keys
    - `pki_policy_rules` - Policy configuration
    - `pki_audit_log` - PKI audit logging

  3. Security
    - RLS enabled on all tables
    - Role-based access: admin (Kee), avatar (Lexi), impersonation (K/Kwamii)
    - No key reuse across environments
*/

-- Enum types for PKI system
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pki_tenant_type') THEN
    CREATE TYPE pki_tenant_type AS ENUM (
      'foster-hardware',
      'foster-link', 
      'red-ruby-home',
      'bips-public',
      'bips-internal'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pki_environment_type') THEN
    CREATE TYPE pki_environment_type AS ENUM (
      'dev',
      'staging',
      'prod',
      'sandbox-impersonation'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pki_ca_type') THEN
    CREATE TYPE pki_ca_type AS ENUM (
      'root',
      'intermediate-api',
      'intermediate-client',
      'intermediate-avatar',
      'intermediate-ops'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pki_cert_type') THEN
    CREATE TYPE pki_cert_type AS ENUM (
      'service',
      'client',
      'avatar',
      'ops',
      'webhook-relay',
      'cdn-edge',
      'mobile-app',
      'field-device'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pki_cert_status') THEN
    CREATE TYPE pki_cert_status AS ENUM (
      'pending',
      'active',
      'suspended',
      'revoked',
      'expired',
      'rotating'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pki_gate_role') THEN
    CREATE TYPE pki_gate_role AS ENUM (
      'kee',
      'lexi',
      'k-kwamii',
      'service',
      'client',
      'anonymous'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pki_audit_action') THEN
    CREATE TYPE pki_audit_action AS ENUM (
      'cert_issued',
      'cert_renewed',
      'cert_revoked',
      'cert_rotated',
      'cert_suspended',
      'ca_created',
      'ca_rotated',
      'validation_success',
      'validation_failure',
      'policy_allowed',
      'policy_denied',
      'key_generated',
      'key_rotated',
      'webhook_signed',
      'webhook_verified',
      'webhook_verification_failed',
      'claim_added',
      'claim_removed',
      'rotation_scheduled',
      'rotation_executed'
    );
  END IF;
END $$;

-- Tenants table
CREATE TABLE IF NOT EXISTS pki_tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code pki_tenant_type NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  contact_email text,
  is_active boolean DEFAULT true NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Environments table
CREATE TABLE IF NOT EXISTS pki_environments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code pki_environment_type NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  is_production boolean DEFAULT false NOT NULL,
  allows_impersonation boolean DEFAULT false NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Tenant-Environment matrix
CREATE TABLE IF NOT EXISTS pki_tenant_environments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES pki_tenants(id) ON DELETE CASCADE,
  environment_id uuid NOT NULL REFERENCES pki_environments(id) ON DELETE CASCADE,
  is_enabled boolean DEFAULT true NOT NULL,
  isolation_level text DEFAULT 'strict' NOT NULL CHECK (isolation_level IN ('strict', 'shared', 'none')),
  key_derivation_salt text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(tenant_id, environment_id)
);

-- Certificate Authorities
CREATE TABLE IF NOT EXISTS pki_certificate_authorities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES pki_tenants(id) ON DELETE CASCADE,
  environment_id uuid REFERENCES pki_environments(id) ON DELETE CASCADE,
  ca_type pki_ca_type NOT NULL,
  name text NOT NULL,
  subject_dn text NOT NULL,
  public_key text NOT NULL,
  private_key_encrypted text NOT NULL,
  fingerprint text NOT NULL,
  serial_number text NOT NULL UNIQUE,
  parent_ca_id uuid REFERENCES pki_certificate_authorities(id),
  valid_from timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz NOT NULL,
  key_algorithm text DEFAULT 'ed25519' NOT NULL,
  signature_algorithm text DEFAULT 'ed25519' NOT NULL,
  path_length_constraint integer,
  is_active boolean DEFAULT true NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT unique_ca_per_tenant_env_type UNIQUE (tenant_id, environment_id, ca_type),
  CONSTRAINT no_key_reuse_across_envs UNIQUE (fingerprint, environment_id)
);

-- Certificates
CREATE TABLE IF NOT EXISTS pki_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES pki_tenants(id) ON DELETE CASCADE,
  environment_id uuid NOT NULL REFERENCES pki_environments(id) ON DELETE CASCADE,
  issuing_ca_id uuid NOT NULL REFERENCES pki_certificate_authorities(id),
  cert_type pki_cert_type NOT NULL,
  subject_cn text NOT NULL,
  subject_dn text NOT NULL,
  public_key text NOT NULL,
  private_key_encrypted text,
  fingerprint text NOT NULL,
  serial_number text NOT NULL UNIQUE,
  status pki_cert_status DEFAULT 'pending' NOT NULL,
  valid_from timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz NOT NULL,
  key_algorithm text DEFAULT 'ed25519' NOT NULL,
  service_name text,
  avatar_id uuid,
  device_id text,
  mobile_app_id text,
  is_mtls_enabled boolean DEFAULT false NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  CONSTRAINT no_cert_key_reuse_across_envs UNIQUE (fingerprint, environment_id)
);

-- Certificate Claims
CREATE TABLE IF NOT EXISTS pki_certificate_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id uuid NOT NULL REFERENCES pki_certificates(id) ON DELETE CASCADE,
  claim_type text NOT NULL,
  claim_value text NOT NULL,
  is_critical boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(certificate_id, claim_type, claim_value)
);

-- Revocations
CREATE TABLE IF NOT EXISTS pki_revocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id uuid NOT NULL REFERENCES pki_certificates(id) ON DELETE CASCADE UNIQUE,
  revoked_at timestamptz DEFAULT now() NOT NULL,
  reason text NOT NULL CHECK (reason IN (
    'key_compromise',
    'ca_compromise', 
    'affiliation_changed',
    'superseded',
    'cessation_of_operation',
    'certificate_hold',
    'privilege_withdrawn',
    'aa_compromise',
    'administrative'
  )),
  revoked_by uuid REFERENCES auth.users(id),
  notes text,
  crl_entry_number bigint,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Rotation Schedules
CREATE TABLE IF NOT EXISTS pki_rotation_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  target_type text NOT NULL CHECK (target_type IN ('ca', 'certificate', 'webhook_key')),
  target_id uuid NOT NULL,
  rotation_type text NOT NULL CHECK (rotation_type IN ('time_based', 'event_based', 'manual')),
  interval_days integer,
  trigger_event text,
  next_rotation_at timestamptz,
  last_rotation_at timestamptz,
  overlap_period_hours integer DEFAULT 24 NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  notify_before_days integer DEFAULT 7,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Rotation History
CREATE TABLE IF NOT EXISTS pki_rotation_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid REFERENCES pki_rotation_schedules(id) ON DELETE SET NULL,
  target_type text NOT NULL,
  old_target_id uuid NOT NULL,
  new_target_id uuid NOT NULL,
  rotation_reason text NOT NULL,
  rotated_at timestamptz DEFAULT now() NOT NULL,
  rotated_by uuid REFERENCES auth.users(id),
  was_successful boolean DEFAULT true NOT NULL,
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Webhook Keys
CREATE TABLE IF NOT EXISTS pki_webhook_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES pki_tenants(id) ON DELETE CASCADE,
  environment_id uuid NOT NULL REFERENCES pki_environments(id) ON DELETE CASCADE,
  provider text NOT NULL,
  key_type text NOT NULL CHECK (key_type IN ('signing', 'verification', 'shared_secret')),
  key_value_encrypted text NOT NULL,
  fingerprint text,
  is_pinned boolean DEFAULT false NOT NULL,
  valid_from timestamptz DEFAULT now() NOT NULL,
  valid_until timestamptz,
  is_active boolean DEFAULT true NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(tenant_id, environment_id, provider, key_type, fingerprint)
);

-- Policy Rules
CREATE TABLE IF NOT EXISTS pki_policy_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  gate_role pki_gate_role NOT NULL,
  tenant_id uuid REFERENCES pki_tenants(id) ON DELETE CASCADE,
  environment_id uuid REFERENCES pki_environments(id) ON DELETE CASCADE,
  required_scopes text[] DEFAULT '{}' NOT NULL,
  allowed_actions text[] NOT NULL,
  denied_actions text[] DEFAULT '{}' NOT NULL,
  conditions jsonb DEFAULT '{}'::jsonb,
  priority integer DEFAULT 100 NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- PKI Audit Log
CREATE TABLE IF NOT EXISTS pki_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES pki_tenants(id) ON DELETE SET NULL,
  environment_id uuid REFERENCES pki_environments(id) ON DELETE SET NULL,
  action pki_audit_action NOT NULL,
  actor_type text NOT NULL CHECK (actor_type IN ('user', 'service', 'avatar', 'system')),
  actor_id text,
  actor_role pki_gate_role,
  resource_type text NOT NULL,
  resource_id uuid,
  resource_name text,
  certificate_fingerprint text,
  request_id text,
  ip_address inet,
  user_agent text,
  success boolean DEFAULT true NOT NULL,
  error_code text,
  error_message text,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pki_certs_tenant_env ON pki_certificates(tenant_id, environment_id);
CREATE INDEX IF NOT EXISTS idx_pki_certs_status ON pki_certificates(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_pki_certs_fingerprint ON pki_certificates(fingerprint);
CREATE INDEX IF NOT EXISTS idx_pki_certs_service ON pki_certificates(service_name) WHERE service_name IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pki_certs_avatar ON pki_certificates(avatar_id) WHERE avatar_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pki_certs_expiry ON pki_certificates(valid_until) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_pki_ca_tenant_env ON pki_certificate_authorities(tenant_id, environment_id);
CREATE INDEX IF NOT EXISTS idx_pki_ca_fingerprint ON pki_certificate_authorities(fingerprint);
CREATE INDEX IF NOT EXISTS idx_pki_revocations_cert ON pki_revocations(certificate_id);
CREATE INDEX IF NOT EXISTS idx_pki_audit_tenant_env ON pki_audit_log(tenant_id, environment_id);
CREATE INDEX IF NOT EXISTS idx_pki_audit_action ON pki_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_pki_audit_actor ON pki_audit_log(actor_type, actor_id);
CREATE INDEX IF NOT EXISTS idx_pki_audit_created ON pki_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pki_audit_resource ON pki_audit_log(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_pki_webhook_keys_provider ON pki_webhook_keys(provider);
CREATE INDEX IF NOT EXISTS idx_pki_policy_role ON pki_policy_rules(gate_role);
CREATE INDEX IF NOT EXISTS idx_pki_rotation_next ON pki_rotation_schedules(next_rotation_at) WHERE is_active = true;

-- Enable RLS on all tables
ALTER TABLE pki_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE pki_environments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pki_tenant_environments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pki_certificate_authorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE pki_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE pki_certificate_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE pki_revocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE pki_rotation_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE pki_rotation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE pki_webhook_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE pki_policy_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE pki_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view tenants"
  ON pki_tenants FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Service role can manage tenants"
  ON pki_tenants FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view environments"
  ON pki_environments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage environments"
  ON pki_environments FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view tenant environments"
  ON pki_tenant_environments FOR SELECT
  TO authenticated
  USING (is_enabled = true);

CREATE POLICY "Service role can manage tenant environments"
  ON pki_tenant_environments FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view active CAs"
  ON pki_certificate_authorities FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Service role can manage CAs"
  ON pki_certificate_authorities FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can view their own certificates"
  ON pki_certificates FOR SELECT
  TO authenticated
  USING (created_by = auth.uid() OR status = 'active');

CREATE POLICY "Service role can manage certificates"
  ON pki_certificates FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view certificate claims"
  ON pki_certificate_claims FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pki_certificates c
      WHERE c.id = certificate_id
      AND (c.created_by = auth.uid() OR c.status = 'active')
    )
  );

CREATE POLICY "Service role can manage certificate claims"
  ON pki_certificate_claims FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view revocations"
  ON pki_revocations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage revocations"
  ON pki_revocations FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view rotation schedules"
  ON pki_rotation_schedules FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Service role can manage rotation schedules"
  ON pki_rotation_schedules FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view rotation history"
  ON pki_rotation_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage rotation history"
  ON pki_rotation_history FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can manage webhook keys"
  ON pki_webhook_keys FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view active policies"
  ON pki_policy_rules FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Service role can manage policy rules"
  ON pki_policy_rules FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full audit access"
  ON pki_audit_log FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view own audit entries"
  ON pki_audit_log FOR SELECT
  TO authenticated
  USING (actor_id = auth.uid()::text);

-- Insert default tenants
INSERT INTO pki_tenants (code, name, description) VALUES
  ('foster-hardware', 'Foster Hardware', 'Hardware and equipment tenant'),
  ('foster-link', 'Foster Link', 'Connectivity and integration tenant'),
  ('red-ruby-home', 'Red Ruby Home', 'Home goods and lifestyle tenant'),
  ('bips-public', 'BIPS Public', 'Public-facing BIPS services'),
  ('bips-internal', 'BIPS Internal', 'Internal BIPS administration')
ON CONFLICT (code) DO NOTHING;

-- Insert default environments
INSERT INTO pki_environments (code, name, description, is_production, allows_impersonation) VALUES
  ('dev', 'Development', 'Development environment', false, false),
  ('staging', 'Staging', 'Staging/QA environment', false, false),
  ('prod', 'Production', 'Production environment', true, false),
  ('sandbox-impersonation', 'Sandbox Impersonation', 'Sandbox for K/Kwamii impersonation testing', false, true)
ON CONFLICT (code) DO NOTHING;

-- Insert default policy rules for gate system
INSERT INTO pki_policy_rules (name, description, gate_role, required_scopes, allowed_actions, conditions, priority) VALUES
  (
    'Kee Admin Full Access',
    'Kee has full administrative access with complete audit logging',
    'kee',
    '{}',
    ARRAY['*'],
    '{"audit_all_actions": true}'::jsonb,
    1
  ),
  (
    'Lexi Avatar Access',
    'Lexi can access avatar-scoped resources with suggest edits but not publish',
    'lexi',
    ARRAY['avatar:read', 'avatar:suggest'],
    ARRAY['read', 'suggest_edit', 'comment', 'preview'],
    '{"cannot_publish": true, "avatar_scoped": true}'::jsonb,
    10
  ),
  (
    'K/Kwamii Sandbox Access',
    'K/Kwamii can only access sandbox-impersonation environment',
    'k-kwamii',
    ARRAY['sandbox:access'],
    ARRAY['read', 'write', 'impersonate'],
    '{"environment_restricted": ["sandbox-impersonation"]}'::jsonb,
    20
  ),
  (
    'Service Default Access',
    'Default access for service certificates',
    'service',
    '{}',
    ARRAY['read', 'write'],
    '{}'::jsonb,
    100
  ),
  (
    'Client Default Access',
    'Default access for client certificates',
    'client',
    '{}',
    ARRAY['read'],
    '{}'::jsonb,
    100
  )
ON CONFLICT DO NOTHING;
