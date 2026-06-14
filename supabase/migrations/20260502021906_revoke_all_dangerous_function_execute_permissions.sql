/*
  # Final Security Hardening: Revoke All Dangerous SECURITY DEFINER Permissions

  CRITICAL SECURITY FIX - 48 VULNERABILITIES
  
  This migration revokes EXECUTE permissions on all dangerous SECURITY DEFINER functions
  from both `anon` and `authenticated` roles to prevent unauthorized privilege escalation.
  
  These functions should ONLY be callable through:
  - Supabase Edge Functions with service_role context
  - Backend application code with verified authorization
  - Never via direct REST API calls from untrusted sources
*/

-- ==================== REVOKE ANON ROLE EXECUTE PERMISSIONS ====================

-- PKI Policy & Validation Functions
REVOKE EXECUTE ON FUNCTION public.check_pki_policy(pki_gate_role, text, uuid, uuid, text[]) FROM anon;
REVOKE EXECUTE ON FUNCTION public.pki_check_certificate_scope(uuid, pki_cert_scope) FROM anon;
REVOKE EXECUTE ON FUNCTION public.validate_certificate_chain(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.verify_trust_chain(uuid, pki_entity_type, uuid, pki_entity_type, integer) FROM anon;

-- Certificate Lifecycle Functions
REVOKE EXECUTE ON FUNCTION public.extract_certificate_claims(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_certificate_revocation_list(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_certificates_due_for_rotation(integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_certificate_revoked(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.pki_create_avatar_keypack(uuid, text, uuid, uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.pki_get_avatar_key(uuid, uuid, uuid, pki_avatar_key_purpose) FROM anon;

-- Provenance & Audit Logging Functions
REVOKE EXECUTE ON FUNCTION public.log_pki_audit(pki_audit_action, text, text, pki_gate_role, text, uuid, text, uuid, uuid, boolean, text, text, jsonb, inet, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.log_pki_event(text, uuid, pki_entity_type, uuid, text, jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public.pki_append_provenance_entry(uuid, integer, pki_art_asset_type, pki_provenance_event, text, uuid, uuid, text, text, jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public.pki_verify_provenance_chain(uuid) FROM anon;

-- Session Management Functions
REVOKE EXECUTE ON FUNCTION public.pki_start_impersonation_session(uuid, text, text, uuid, uuid, uuid, text, integer, inet, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.pki_end_impersonation_session(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.pki_validate_impersonation_session(text) FROM anon;

-- Business Operations Functions
REVOKE EXECUTE ON FUNCTION public.pki_apply_promo_code(text, uuid, text, numeric, uuid, uuid, text, inet) FROM anon;
REVOKE EXECUTE ON FUNCTION public.pki_change_affiliate_commission(uuid, numeric, text, uuid, uuid, text, text[], inet) FROM anon;
REVOKE EXECUTE ON FUNCTION public.pki_transition_gift_card_state(uuid, text, uuid, uuid, text, text[], numeric, text, inet) FROM anon;

-- User Onboarding Functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.pki_generate_verification_payload(uuid) FROM anon;

-- ==================== REVOKE AUTHENTICATED ROLE EXECUTE PERMISSIONS ====================

-- PKI Policy & Validation Functions
REVOKE EXECUTE ON FUNCTION public.check_pki_policy(pki_gate_role, text, uuid, uuid, text[]) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.pki_check_certificate_scope(uuid, pki_cert_scope) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_certificate_chain(uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.verify_trust_chain(uuid, pki_entity_type, uuid, pki_entity_type, integer) FROM authenticated;

-- Certificate Lifecycle Functions
REVOKE EXECUTE ON FUNCTION public.extract_certificate_claims(uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.get_certificate_revocation_list(uuid, uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.get_certificates_due_for_rotation(integer) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.is_certificate_revoked(text) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.pki_create_avatar_keypack(uuid, text, uuid, uuid, uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.pki_get_avatar_key(uuid, uuid, uuid, pki_avatar_key_purpose) FROM authenticated;

-- Provenance & Audit Logging Functions
REVOKE EXECUTE ON FUNCTION public.log_pki_audit(pki_audit_action, text, text, pki_gate_role, text, uuid, text, uuid, uuid, boolean, text, text, jsonb, inet, text) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.log_pki_event(text, uuid, pki_entity_type, uuid, text, jsonb) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.pki_append_provenance_entry(uuid, integer, pki_art_asset_type, pki_provenance_event, text, uuid, uuid, text, text, jsonb) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.pki_verify_provenance_chain(uuid) FROM authenticated;

-- Session Management Functions
REVOKE EXECUTE ON FUNCTION public.pki_start_impersonation_session(uuid, text, text, uuid, uuid, uuid, text, integer, inet, text) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.pki_end_impersonation_session(uuid, text) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.pki_validate_impersonation_session(text) FROM authenticated;

-- Business Operations Functions
REVOKE EXECUTE ON FUNCTION public.pki_apply_promo_code(text, uuid, text, numeric, uuid, uuid, text, inet) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.pki_change_affiliate_commission(uuid, numeric, text, uuid, uuid, text, text[], inet) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.pki_transition_gift_card_state(uuid, text, uuid, uuid, text, text[], numeric, text, inet) FROM authenticated;

-- User Onboarding Functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.pki_generate_verification_payload(uuid) FROM authenticated;

-- ==================== VERIFICATION ====================
-- After this migration, only service_role will have EXECUTE permissions on these functions
-- All direct REST API calls from /rest/v1/rpc/ endpoints will be blocked for anon and authenticated users
