/*
  # PKI Functions and Views

  1. Functions
    - `validate_certificate_chain` - Validates entire cert chain against CAs
    - `extract_certificate_claims` - Extracts all claims from a certificate
    - `check_pki_policy` - Checks if an action is allowed for a role
    - `log_pki_audit` - Logs PKI audit events

  2. Views
    - `pki_audit_kee_view` - Full audit visibility for Kee admin
    - `pki_audit_lexi_view` - Summarized view for Lexi avatar
    - `pki_audit_k_view` - Sandbox-only view for K/Kwamii
*/

-- Function to validate certificate chain
CREATE OR REPLACE FUNCTION validate_certificate_chain(cert_id uuid)
RETURNS TABLE (
  is_valid boolean,
  chain_depth integer,
  validation_errors text[]
) AS $$
DECLARE
  v_cert RECORD;
  v_ca RECORD;
  v_errors text[] := '{}';
  v_depth integer := 0;
  v_current_ca_id uuid;
BEGIN
  SELECT * INTO v_cert FROM pki_certificates WHERE id = cert_id;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, ARRAY['Certificate not found'];
    RETURN;
  END IF;
  
  IF v_cert.status != 'active' THEN
    v_errors := array_append(v_errors, 'Certificate is not active: ' || v_cert.status::text);
  END IF;
  
  IF v_cert.valid_until < now() THEN
    v_errors := array_append(v_errors, 'Certificate has expired');
  END IF;
  
  IF v_cert.valid_from > now() THEN
    v_errors := array_append(v_errors, 'Certificate is not yet valid');
  END IF;
  
  IF EXISTS (SELECT 1 FROM pki_revocations WHERE certificate_id = cert_id) THEN
    v_errors := array_append(v_errors, 'Certificate has been revoked');
  END IF;
  
  v_current_ca_id := v_cert.issuing_ca_id;
  WHILE v_current_ca_id IS NOT NULL LOOP
    v_depth := v_depth + 1;
    
    SELECT * INTO v_ca FROM pki_certificate_authorities WHERE id = v_current_ca_id;
    
    IF NOT FOUND THEN
      v_errors := array_append(v_errors, 'Issuing CA not found at depth ' || v_depth);
      EXIT;
    END IF;
    
    IF NOT v_ca.is_active THEN
      v_errors := array_append(v_errors, 'CA is not active at depth ' || v_depth);
    END IF;
    
    IF v_ca.valid_until < now() THEN
      v_errors := array_append(v_errors, 'CA has expired at depth ' || v_depth);
    END IF;
    
    v_current_ca_id := v_ca.parent_ca_id;
    
    IF v_depth > 10 THEN
      v_errors := array_append(v_errors, 'Chain depth exceeds maximum');
      EXIT;
    END IF;
  END LOOP;
  
  RETURN QUERY SELECT (array_length(v_errors, 1) IS NULL OR array_length(v_errors, 1) = 0), v_depth, v_errors;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to extract claims from certificate
CREATE OR REPLACE FUNCTION extract_certificate_claims(cert_id uuid)
RETURNS jsonb AS $$
DECLARE
  v_cert RECORD;
  v_claims jsonb := '{}'::jsonb;
  v_additional_claims jsonb;
BEGIN
  SELECT c.*, t.code as tenant_code, e.code as env_code
  INTO v_cert
  FROM pki_certificates c
  JOIN pki_tenants t ON c.tenant_id = t.id
  JOIN pki_environments e ON c.environment_id = e.id
  WHERE c.id = cert_id;
  
  IF NOT FOUND THEN
    RETURN '{}'::jsonb;
  END IF;
  
  v_claims := jsonb_build_object(
    'cert_id', v_cert.id,
    'tenant', v_cert.tenant_code,
    'environment', v_cert.env_code,
    'cert_type', v_cert.cert_type,
    'subject_cn', v_cert.subject_cn,
    'service_name', v_cert.service_name,
    'avatar_id', v_cert.avatar_id,
    'device_id', v_cert.device_id,
    'valid_from', v_cert.valid_from,
    'valid_until', v_cert.valid_until
  );
  
  SELECT jsonb_object_agg(claim_type, claim_value)
  INTO v_additional_claims
  FROM pki_certificate_claims
  WHERE certificate_id = cert_id;
  
  IF v_additional_claims IS NOT NULL THEN
    v_claims := v_claims || v_additional_claims;
  END IF;
  
  RETURN v_claims;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check policy for action
CREATE OR REPLACE FUNCTION check_pki_policy(
  p_role pki_gate_role,
  p_action text,
  p_tenant_id uuid DEFAULT NULL,
  p_environment_id uuid DEFAULT NULL,
  p_scopes text[] DEFAULT '{}'
)
RETURNS TABLE (
  is_allowed boolean,
  matched_policy_id uuid,
  matched_policy_name text,
  denial_reason text
) AS $$
DECLARE
  v_policy RECORD;
  v_env RECORD;
BEGIN
  IF p_role = 'k-kwamii' AND p_environment_id IS NOT NULL THEN
    SELECT * INTO v_env FROM pki_environments WHERE id = p_environment_id;
    IF NOT v_env.allows_impersonation THEN
      RETURN QUERY SELECT false, NULL::uuid, NULL::text, 'K/Kwamii restricted to sandbox-impersonation environment';
      RETURN;
    END IF;
  END IF;
  
  FOR v_policy IN
    SELECT * FROM pki_policy_rules
    WHERE is_active = true
    AND gate_role = p_role
    AND (tenant_id IS NULL OR tenant_id = p_tenant_id)
    AND (environment_id IS NULL OR environment_id = p_environment_id)
    ORDER BY priority ASC
  LOOP
    IF p_action = ANY(v_policy.denied_actions) THEN
      RETURN QUERY SELECT false, v_policy.id, v_policy.name, 'Action explicitly denied by policy';
      RETURN;
    END IF;
    
    IF array_length(v_policy.required_scopes, 1) > 0 THEN
      IF NOT v_policy.required_scopes <@ p_scopes THEN
        CONTINUE;
      END IF;
    END IF;
    
    IF '*' = ANY(v_policy.allowed_actions) OR p_action = ANY(v_policy.allowed_actions) THEN
      RETURN QUERY SELECT true, v_policy.id, v_policy.name, NULL::text;
      RETURN;
    END IF;
  END LOOP;
  
  RETURN QUERY SELECT false, NULL::uuid, NULL::text, 'No matching policy found';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log PKI audit event
CREATE OR REPLACE FUNCTION log_pki_audit(
  p_action pki_audit_action,
  p_actor_type text,
  p_actor_id text,
  p_actor_role pki_gate_role,
  p_resource_type text,
  p_resource_id uuid DEFAULT NULL,
  p_resource_name text DEFAULT NULL,
  p_tenant_id uuid DEFAULT NULL,
  p_environment_id uuid DEFAULT NULL,
  p_success boolean DEFAULT true,
  p_error_code text DEFAULT NULL,
  p_error_message text DEFAULT NULL,
  p_details jsonb DEFAULT '{}'::jsonb,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_audit_id uuid;
BEGIN
  INSERT INTO pki_audit_log (
    action, actor_type, actor_id, actor_role,
    resource_type, resource_id, resource_name,
    tenant_id, environment_id,
    success, error_code, error_message,
    details, ip_address, user_agent
  ) VALUES (
    p_action, p_actor_type, p_actor_id, p_actor_role,
    p_resource_type, p_resource_id, p_resource_name,
    p_tenant_id, p_environment_id,
    p_success, p_error_code, p_error_message,
    p_details, p_ip_address, p_user_agent
  ) RETURNING id INTO v_audit_id;
  
  RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View for Kee (full audit visibility)
CREATE OR REPLACE VIEW pki_audit_kee_view AS
SELECT * FROM pki_audit_log
ORDER BY created_at DESC;

-- View for Lexi (summarized, relevant to avatar operations)
CREATE OR REPLACE VIEW pki_audit_lexi_view AS
SELECT 
  al.id, al.action, al.actor_role, al.resource_type, al.resource_name,
  al.success, al.created_at,
  CASE WHEN al.success THEN NULL ELSE al.error_message END as error_summary
FROM pki_audit_log al
WHERE al.actor_role IN ('lexi', 'client')
   OR al.resource_type IN ('avatar', 'certificate')
ORDER BY al.created_at DESC;

-- View for K (sandbox-only visibility)
CREATE OR REPLACE VIEW pki_audit_k_view AS
SELECT 
  al.id, al.action, al.resource_type, al.success, al.created_at
FROM pki_audit_log al
JOIN pki_environments e ON al.environment_id = e.id
WHERE e.code = 'sandbox-impersonation'
ORDER BY al.created_at DESC;

-- Grant access to views
GRANT SELECT ON pki_audit_kee_view TO service_role;
GRANT SELECT ON pki_audit_lexi_view TO authenticated;
GRANT SELECT ON pki_audit_k_view TO authenticated;

-- Function to get current CRL (Certificate Revocation List)
CREATE OR REPLACE FUNCTION get_certificate_revocation_list(
  p_tenant_id uuid DEFAULT NULL,
  p_environment_id uuid DEFAULT NULL
)
RETURNS TABLE (
  serial_number text,
  fingerprint text,
  revoked_at timestamptz,
  reason text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.serial_number,
    c.fingerprint,
    r.revoked_at,
    r.reason
  FROM pki_revocations r
  JOIN pki_certificates c ON r.certificate_id = c.id
  WHERE (p_tenant_id IS NULL OR c.tenant_id = p_tenant_id)
    AND (p_environment_id IS NULL OR c.environment_id = p_environment_id)
  ORDER BY r.revoked_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if certificate is revoked
CREATE OR REPLACE FUNCTION is_certificate_revoked(p_fingerprint text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM pki_revocations r
    JOIN pki_certificates c ON r.certificate_id = c.id
    WHERE c.fingerprint = p_fingerprint
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get certificates due for rotation
CREATE OR REPLACE FUNCTION get_certificates_due_for_rotation(p_days_ahead integer DEFAULT 7)
RETURNS TABLE (
  certificate_id uuid,
  subject_cn text,
  cert_type pki_cert_type,
  valid_until timestamptz,
  days_remaining integer,
  tenant_code pki_tenant_type,
  environment_code pki_environment_type
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.subject_cn,
    c.cert_type,
    c.valid_until,
    EXTRACT(DAY FROM (c.valid_until - now()))::integer as days_remaining,
    t.code,
    e.code
  FROM pki_certificates c
  JOIN pki_tenants t ON c.tenant_id = t.id
  JOIN pki_environments e ON c.environment_id = e.id
  WHERE c.status = 'active'
    AND c.valid_until <= (now() + (p_days_ahead || ' days')::interval)
    AND NOT EXISTS (SELECT 1 FROM pki_revocations r WHERE r.certificate_id = c.id)
  ORDER BY c.valid_until ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
