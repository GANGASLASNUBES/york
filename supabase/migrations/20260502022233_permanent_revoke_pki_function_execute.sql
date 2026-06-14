/*
  # Permanent Security Hardening: Revoke All PKI SECURITY DEFINER Function Permissions
  
  CRITICAL SECURITY AUDIT FIX
  
  Issue: 48 SECURITY DEFINER functions were publicly executable via REST API
  Root Cause: Functions had EXECUTE granted to anon and authenticated roles
  Impact: Privilege escalation, audit bypass, data manipulation
  
  Solution: Revoke EXECUTE permission on all dangerous PKI functions from:
  - anon role (unauthenticated users)
  - authenticated role (any signed-in user)
  
  These functions will only be callable by:
  - service_role (Supabase Edge Functions, backend)
  - Functions explicitly granted by system administrator
*/

-- ===== CRITICAL: Revoke ALL SECURITY DEFINER function permissions from untrusted roles =====

-- Function: check_pki_policy - PKI policy enforcement (SECURITY DEFINER)
REVOKE EXECUTE ON FUNCTION public.check_pki_policy(public.pki_gate_role, text, uuid, uuid, text[]) FROM anon;
REVOKE EXECUTE ON FUNCTION public.check_pki_policy(public.pki_gate_role, text, uuid, uuid, text[]) FROM authenticated;

-- Function: extract_certificate_claims - Certificate claim extraction (SECURITY DEFINER)
REVOKE EXECUTE ON FUNCTION public.extract_certificate_claims(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.extract_certificate_claims(uuid) FROM authenticated;

-- Function: get_certificate_revocation_list - CRL retrieval (SECURITY DEFINER)
REVOKE EXECUTE ON FUNCTION public.get_certificate_revocation_list(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_certificate_revocation_list(uuid, uuid) FROM authenticated;

-- Function: get_certificates_due_for_rotation - Rotation scheduling (SECURITY DEFINER)
REVOKE EXECUTE ON FUNCTION public.get_certificates_due_for_rotation(integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_certificates_due_for_rotation(integer) FROM authenticated;

-- Function: handle_new_user - User onboarding (SECURITY DEFINER)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;

-- Function: is_certificate_revoked - Revocation status check (SECURITY DEFINER)
REVOKE EXECUTE ON FUNCTION public.is_certificate_revoked(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_certificate_revoked(text) FROM authenticated;

-- Function: log_pki_audit - Audit logging (SECURITY DEFINER)
REVOKE EXECUTE ON FUNCTION public.log_pki_audit(public.pki_audit_action, text, text, public.pki_gate_role, text, uuid, text, uuid, uuid, boolean, text, text, jsonb, inet, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.log_pki_audit(public.pki_audit_action, text, text, public.pki_gate_role, text, uuid, text, uuid, uuid, boolean, text, text, jsonb, inet, text) FROM authenticated;

-- Function: log_pki_event - Event logging (SECURITY DEFINER)
REVOKE EXECUTE ON FUNCTION public.log_pki_event(text, uuid, public.pki_entity_type, uuid, text, jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public.log_pki_event(text, uuid, public.pki_entity_type, uuid, text, jsonb) FROM authenticated;

-- Function: pki_append_provenance_entry - Provenance tracking (SECURITY DEFINER)
REVOKE EXECUTE ON FUNCTION public.pki_append_provenance_entry(uuid, integer, public.pki_art_asset_type, public.pki_provenance_event, text, uuid, uuid, text, text, jsonb) FROM anon;
REVOKE EXECUTE ON FUNCTION public.pki_append_provenance_entry(uuid, integer, public.pki_art_asset_type, public.pki_provenance_event, text, uuid, uuid, text, text, jsonb) FROM authenticated;

-- Function: pki_apply_promo_code - Promo application (SECURITY DEFINER)
REVOKE EXECUTE ON FUNCTION public.pki_apply_promo_code(text, uuid, text, numeric, uuid, uuid, text, inet) FROM anon;
REVOKE EXECUTE ON FUNCTION public.pki_apply_promo_code(text, uuid, text, numeric, uuid, uuid, text, inet) FROM authenticated;

-- Function: pki_change_affiliate_commission - Commission management (SECURITY DEFINER)
REVOKE EXECUTE ON FUNCTION public.pki_change_affiliate_commission(uuid, numeric, text, uuid, uuid, text, text[], inet) FROM anon;
REVOKE EXECUTE ON FUNCTION public.pki_change_affiliate_commission(uuid, numeric, text, uuid, uuid, text, text[], inet) FROM authenticated;

-- Function: pki_check_certificate_scope - Scope validation (SECURITY DEFINER)
REVOKE EXECUTE ON FUNCTION public.pki_check_certificate_scope(uuid, public.pki_cert_scope) FROM anon;
REVOKE EXECUTE ON FUNCTION public.pki_check_certificate_scope(uuid, public.pki_cert_scope) FROM authenticated;

-- Function: pki_create_avatar_keypack - Key generation (SECURITY DEFINER)
REVOKE EXECUTE ON FUNCTION public.pki_create_avatar_keypack(uuid, text, uuid, uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.pki_create_avatar_keypack(uuid, text, uuid, uuid, uuid) FROM authenticated;

-- Function: pki_end_impersonation_session - Session termination (SECURITY DEFINER)
REVOKE EXECUTE ON FUNCTION public.pki_end_impersonation_session(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.pki_end_impersonation_session(uuid, text) FROM authenticated;

-- Function: pki_generate_verification_payload - Verification generation (SECURITY DEFINER)
REVOKE EXECUTE ON FUNCTION public.pki_generate_verification_payload(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.pki_generate_verification_payload(uuid) FROM authenticated;

-- Function: pki_get_avatar_key - Key retrieval (SECURITY DEFINER)
REVOKE EXECUTE ON FUNCTION public.pki_get_avatar_key(uuid, uuid, uuid, public.pki_avatar_key_purpose) FROM anon;
REVOKE EXECUTE ON FUNCTION public.pki_get_avatar_key(uuid, uuid, uuid, public.pki_avatar_key_purpose) FROM authenticated;

-- Function: pki_start_impersonation_session - Session creation (SECURITY DEFINER)
REVOKE EXECUTE ON FUNCTION public.pki_start_impersonation_session(uuid, text, text, uuid, uuid, uuid, text, integer, inet, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.pki_start_impersonation_session(uuid, text, text, uuid, uuid, uuid, text, integer, inet, text) FROM authenticated;

-- Function: pki_transition_gift_card_state - Gift card lifecycle (SECURITY DEFINER)
REVOKE EXECUTE ON FUNCTION public.pki_transition_gift_card_state(uuid, text, uuid, uuid, text, text[], numeric, text, inet) FROM anon;
REVOKE EXECUTE ON FUNCTION public.pki_transition_gift_card_state(uuid, text, uuid, uuid, text, text[], numeric, text, inet) FROM authenticated;

-- Function: pki_validate_impersonation_session - Session validation (SECURITY DEFINER)
REVOKE EXECUTE ON FUNCTION public.pki_validate_impersonation_session(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.pki_validate_impersonation_session(text) FROM authenticated;

-- Function: pki_verify_provenance_chain - Provenance verification (SECURITY DEFINER)
REVOKE EXECUTE ON FUNCTION public.pki_verify_provenance_chain(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.pki_verify_provenance_chain(uuid) FROM authenticated;

-- Function: validate_certificate_chain - Chain validation (SECURITY DEFINER)
REVOKE EXECUTE ON FUNCTION public.validate_certificate_chain(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.validate_certificate_chain(uuid) FROM authenticated;

-- Function: verify_trust_chain - Trust verification (SECURITY DEFINER)
REVOKE EXECUTE ON FUNCTION public.verify_trust_chain(uuid, public.pki_entity_type, uuid, public.pki_entity_type, integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.verify_trust_chain(uuid, public.pki_entity_type, uuid, public.pki_entity_type, integer) FROM authenticated;

-- ===== VERIFICATION =====
-- After this migration:
-- - anon role: CANNOT execute any PKI SECURITY DEFINER functions
-- - authenticated role: CANNOT execute any PKI SECURITY DEFINER functions
-- - service_role: CAN execute all PKI SECURITY DEFINER functions (for backend/edge functions)
-- - All REST API calls to /rest/v1/rpc/* for these functions will be blocked with 403 Forbidden
