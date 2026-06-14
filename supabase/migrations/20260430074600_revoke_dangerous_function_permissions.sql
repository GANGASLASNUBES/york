/*
  # Revoke Dangerous SECURITY DEFINER Function Permissions

  1. Revoke EXECUTE on all SECURITY DEFINER PKI functions from anon role
  2. Revoke EXECUTE on all SECURITY DEFINER PKI functions from authenticated role
  
  SECURITY CONTEXT:
  These functions use SECURITY DEFINER to run with elevated privileges. Allowing
  direct execution by untrusted roles (anon or any authenticated user) creates
  privilege escalation risks. These functions should only be callable through:
  - Supabase Edge Functions with proper authorization checks
  - Backend application code with verified permissions
  - Server-side RPC calls with role validation
  
  FUNCTIONS SECURED (24 total):
  - PKI policy checking and validation
  - Certificate lifecycle management
  - Provenance and audit logging
  - Impersonation session management
  - Affiliate and promo code operations
  - Avatar key management
*/

-- ==================== REVOKE FROM ANON ROLE ====================

REVOKE EXECUTE ON FUNCTION public.check_pki_policy(pki_gate_role, text, uuid, uuid, text[]) FROM anon;
REVOKE EXECUTE ON FUNCTION public.extract_certificate_claims(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_certificate_revocation_list(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_certificates_due_for_rotation(integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_certificate_revoked(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.log_pki_audit(pki_audit_action, text, text, pki_gate_role, text, uuid, text, uuid, uuid, boolean, text, text, jsonb, inet, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.log_pki_event(text, uuid, pki_entity_type, uuid, text, jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public.pki_append_provenance_entry(uuid, integer, pki_art_asset_type, pki_provenance_event, text, uuid, uuid, text, text, jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public.pki_apply_promo_code(text, uuid, text, numeric, uuid, uuid, text, inet) FROM anon;
REVOKE EXECUTE ON FUNCTION public.pki_change_affiliate_commission(uuid, numeric, text, uuid, uuid, text, text[], inet) FROM anon;
REVOKE EXECUTE ON FUNCTION public.pki_check_certificate_scope(uuid, pki_cert_scope) FROM anon;
REVOKE EXECUTE ON FUNCTION public.pki_create_avatar_keypack(uuid, text, uuid, uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.pki_end_impersonation_session(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.pki_generate_verification_payload(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.pki_get_avatar_key(uuid, uuid, uuid, pki_avatar_key_purpose) FROM anon;
REVOKE EXECUTE ON FUNCTION public.pki_start_impersonation_session(uuid, text, text, uuid, uuid, uuid, text, integer, inet, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.pki_transition_gift_card_state(uuid, text, uuid, uuid, text, text[], numeric, text, inet) FROM anon;
REVOKE EXECUTE ON FUNCTION public.pki_validate_impersonation_session(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.pki_verify_provenance_chain(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.validate_certificate_chain(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.verify_trust_chain(uuid, pki_entity_type, uuid, pki_entity_type, integer) FROM anon;

-- ==================== REVOKE FROM AUTHENTICATED ROLE ====================
-- Prevent privilege escalation by requiring role-specific authorization
-- All calls to these functions must go through authorized backend code/edge functions

REVOKE EXECUTE ON FUNCTION public.check_pki_policy(pki_gate_role, text, uuid, uuid, text[]) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.extract_certificate_claims(uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.get_certificate_revocation_list(uuid, uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.get_certificates_due_for_rotation(integer) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.is_certificate_revoked(text) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.log_pki_audit(pki_audit_action, text, text, pki_gate_role, text, uuid, text, uuid, uuid, boolean, text, text, jsonb, inet, text) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.log_pki_event(text, uuid, pki_entity_type, uuid, text, jsonb) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.pki_append_provenance_entry(uuid, integer, pki_art_asset_type, pki_provenance_event, text, uuid, uuid, text, text, jsonb) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.pki_apply_promo_code(text, uuid, text, numeric, uuid, uuid, text, inet) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.pki_change_affiliate_commission(uuid, numeric, text, uuid, uuid, text, text[], inet) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.pki_check_certificate_scope(uuid, pki_cert_scope) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.pki_create_avatar_keypack(uuid, text, uuid, uuid, uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.pki_end_impersonation_session(uuid, text) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.pki_generate_verification_payload(uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.pki_get_avatar_key(uuid, uuid, uuid, pki_avatar_key_purpose) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.pki_start_impersonation_session(uuid, text, text, uuid, uuid, uuid, text, integer, inet, text) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.pki_transition_gift_card_state(uuid, text, uuid, uuid, text, text[], numeric, text, inet) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.pki_validate_impersonation_session(text) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.pki_verify_provenance_chain(uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_certificate_chain(uuid) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.verify_trust_chain(uuid, pki_entity_type, uuid, pki_entity_type, integer) FROM authenticated;

-- ==================== GRANT TO SERVICE_ROLE (Backend Only) ====================
-- Allow Supabase service role (for edge functions, cron jobs, admin operations)
-- to call these functions with proper context

GRANT EXECUTE ON FUNCTION public.check_pki_policy(pki_gate_role, text, uuid, uuid, text[]) TO service_role;
GRANT EXECUTE ON FUNCTION public.extract_certificate_claims(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_certificate_revocation_list(uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_certificates_due_for_rotation(integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.is_certificate_revoked(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.log_pki_audit(pki_audit_action, text, text, pki_gate_role, text, uuid, text, uuid, uuid, boolean, text, text, jsonb, inet, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.log_pki_event(text, uuid, pki_entity_type, uuid, text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.pki_append_provenance_entry(uuid, integer, pki_art_asset_type, pki_provenance_event, text, uuid, uuid, text, text, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.pki_apply_promo_code(text, uuid, text, numeric, uuid, uuid, text, inet) TO service_role;
GRANT EXECUTE ON FUNCTION public.pki_change_affiliate_commission(uuid, numeric, text, uuid, uuid, text, text[], inet) TO service_role;
GRANT EXECUTE ON FUNCTION public.pki_check_certificate_scope(uuid, pki_cert_scope) TO service_role;
GRANT EXECUTE ON FUNCTION public.pki_create_avatar_keypack(uuid, text, uuid, uuid, uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.pki_end_impersonation_session(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.pki_generate_verification_payload(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.pki_get_avatar_key(uuid, uuid, uuid, pki_avatar_key_purpose) TO service_role;
GRANT EXECUTE ON FUNCTION public.pki_start_impersonation_session(uuid, text, text, uuid, uuid, uuid, text, integer, inet, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.pki_transition_gift_card_state(uuid, text, uuid, uuid, text, text[], numeric, text, inet) TO service_role;
GRANT EXECUTE ON FUNCTION public.pki_validate_impersonation_session(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.pki_verify_provenance_chain(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.validate_certificate_chain(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.verify_trust_chain(uuid, pki_entity_type, uuid, pki_entity_type, integer) TO service_role;
