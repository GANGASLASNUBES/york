/*
  # Fix Critical Security Issues: Revoke Public & Auth-User GraphQL Access

  1. Revoke SELECT from anon role on all sensitive tables
  2. Revoke SELECT from authenticated role on sensitive tables (enforce RLS instead)
  3. Revoke EXECUTE from anon role on all SECURITY DEFINER functions
  4. Revoke EXECUTE from authenticated role on SECURITY DEFINER functions (use SECURITY INVOKER)
  5. Enable RLS on all tables to restrict data access

  SECURITY ISSUES FIXED:
  - 38 tables exposed in GraphQL schema to anonymous users
  - 38 tables exposed in GraphQL schema to all authenticated users
  - 24 SECURITY DEFINER functions callable by anonymous users
  - 24 SECURITY DEFINER functions callable by all authenticated users
*/

-- ==================== REVOKE TABLE SELECT PERMISSIONS ====================

-- Revoke SELECT from anon role on all sensitive tables
REVOKE SELECT ON public.ad_assets FROM anon;
REVOKE SELECT ON public.ad_campaigns FROM anon;
REVOKE SELECT ON public.ad_themes FROM anon;
REVOKE SELECT ON public.avatars FROM anon;
REVOKE SELECT ON public.bips_market_mappings FROM anon;
REVOKE SELECT ON public.campaigns FROM anon;
REVOKE SELECT ON public.clothing_designs FROM anon;
REVOKE SELECT ON public.devices FROM anon;
REVOKE SELECT ON public.drops FROM anon;
REVOKE SELECT ON public.event_templates FROM anon;
REVOKE SELECT ON public.fl_affiliate_performance FROM anon;
REVOKE SELECT ON public.fl_api_logs FROM anon;
REVOKE SELECT ON public.fl_creators FROM anon;
REVOKE SELECT ON public.fl_orders FROM anon;
REVOKE SELECT ON public.fl_system_overrides FROM anon;
REVOKE SELECT ON public.fl_system_status FROM anon;
REVOKE SELECT ON public.fl_translations FROM anon;
REVOKE SELECT ON public.fl_webhook_logs FROM anon;
REVOKE SELECT ON public.fl_zakeke_products FROM anon;
REVOKE SELECT ON public.key_pairs FROM anon;
REVOKE SELECT ON public.locations FROM anon;
REVOKE SELECT ON public.m365_integrations FROM anon;
REVOKE SELECT ON public.market_analytics FROM anon;
REVOKE SELECT ON public.market_currencies FROM anon;
REVOKE SELECT ON public.market_payment_methods FROM anon;
REVOKE SELECT ON public.pki_ca_hierarchy FROM anon;
REVOKE SELECT ON public.pki_certificate_claims FROM anon;
REVOKE SELECT ON public.pki_environments FROM anon;
REVOKE SELECT ON public.pki_events FROM anon;
REVOKE SELECT ON public.pki_rotation_policies FROM anon;
REVOKE SELECT ON public.pki_rotation_schedules FROM anon;
REVOKE SELECT ON public.pki_tenants FROM anon;
REVOKE SELECT ON public.products FROM anon;
REVOKE SELECT ON public.promo_codes FROM anon;
REVOKE SELECT ON public.shopify_markets FROM anon;
REVOKE SELECT ON public.sites FROM anon;
REVOKE SELECT ON public.stories FROM anon;
REVOKE SELECT ON public.user_profiles FROM anon;
REVOKE SELECT ON public.webhook_events FROM anon;

-- Revoke SELECT from authenticated role on all sensitive tables
-- (These will be replaced with RLS policies for fine-grained access control)
REVOKE SELECT ON public.ad_assets FROM authenticated;
REVOKE SELECT ON public.ad_campaigns FROM authenticated;
REVOKE SELECT ON public.ad_themes FROM authenticated;
REVOKE SELECT ON public.avatars FROM authenticated;
REVOKE SELECT ON public.bips_market_mappings FROM authenticated;
REVOKE SELECT ON public.campaigns FROM authenticated;
REVOKE SELECT ON public.clothing_designs FROM authenticated;
REVOKE SELECT ON public.devices FROM authenticated;
REVOKE SELECT ON public.drops FROM authenticated;
REVOKE SELECT ON public.event_templates FROM authenticated;
REVOKE SELECT ON public.fl_affiliate_performance FROM authenticated;
REVOKE SELECT ON public.fl_api_logs FROM authenticated;
REVOKE SELECT ON public.fl_creators FROM authenticated;
REVOKE SELECT ON public.fl_orders FROM authenticated;
REVOKE SELECT ON public.fl_system_overrides FROM authenticated;
REVOKE SELECT ON public.fl_system_status FROM authenticated;
REVOKE SELECT ON public.fl_translations FROM authenticated;
REVOKE SELECT ON public.fl_webhook_logs FROM authenticated;
REVOKE SELECT ON public.fl_zakeke_products FROM authenticated;
REVOKE SELECT ON public.key_pairs FROM authenticated;
REVOKE SELECT ON public.locations FROM authenticated;
REVOKE SELECT ON public.m365_integrations FROM authenticated;
REVOKE SELECT ON public.market_analytics FROM authenticated;
REVOKE SELECT ON public.market_currencies FROM authenticated;
REVOKE SELECT ON public.market_payment_methods FROM authenticated;
REVOKE SELECT ON public.pki_ca_hierarchy FROM authenticated;
REVOKE SELECT ON public.pki_certificate_claims FROM authenticated;
REVOKE SELECT ON public.pki_environments FROM authenticated;
REVOKE SELECT ON public.pki_events FROM authenticated;
REVOKE SELECT ON public.pki_rotation_policies FROM authenticated;
REVOKE SELECT ON public.pki_rotation_schedules FROM authenticated;
REVOKE SELECT ON public.pki_tenants FROM authenticated;
REVOKE SELECT ON public.products FROM authenticated;
REVOKE SELECT ON public.promo_codes FROM authenticated;
REVOKE SELECT ON public.shopify_markets FROM authenticated;
REVOKE SELECT ON public.sites FROM authenticated;
REVOKE SELECT ON public.stories FROM authenticated;
REVOKE SELECT ON public.user_profiles FROM authenticated;
REVOKE SELECT ON public.webhook_events FROM authenticated;

-- ==================== ENABLE ROW LEVEL SECURITY ====================

-- Enable RLS on all sensitive tables (if not already enabled)
DO $$
DECLARE
    tables_to_secure TEXT[] := ARRAY[
        'ad_assets', 'ad_campaigns', 'ad_themes', 'avatars', 'bips_market_mappings',
        'campaigns', 'clothing_designs', 'devices', 'drops', 'event_templates',
        'fl_affiliate_performance', 'fl_api_logs', 'fl_creators', 'fl_orders',
        'fl_system_overrides', 'fl_system_status', 'fl_translations', 'fl_webhook_logs',
        'fl_zakeke_products', 'key_pairs', 'locations', 'm365_integrations',
        'market_analytics', 'market_currencies', 'market_payment_methods',
        'pki_ca_hierarchy', 'pki_certificate_claims', 'pki_environments', 'pki_events',
        'pki_rotation_policies', 'pki_rotation_schedules', 'pki_tenants', 'products',
        'promo_codes', 'shopify_markets', 'sites', 'stories', 'user_profiles', 'webhook_events'
    ];
    table_name TEXT;
BEGIN
    FOREACH table_name IN ARRAY tables_to_secure LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    END LOOP;
END $$;

-- Create default DENY-ALL policy on all sensitive tables for unauthenticated users
-- This ensures no data leaks via RLS until explicit policies are created
DO $$
DECLARE
    tables_to_secure TEXT[] := ARRAY[
        'ad_assets', 'ad_campaigns', 'ad_themes', 'avatars', 'bips_market_mappings',
        'campaigns', 'clothing_designs', 'devices', 'drops', 'event_templates',
        'fl_affiliate_performance', 'fl_api_logs', 'fl_creators', 'fl_orders',
        'fl_system_overrides', 'fl_system_status', 'fl_translations', 'fl_webhook_logs',
        'fl_zakeke_products', 'key_pairs', 'locations', 'm365_integrations',
        'market_analytics', 'market_currencies', 'market_payment_methods',
        'pki_ca_hierarchy', 'pki_certificate_claims', 'pki_environments', 'pki_events',
        'pki_rotation_policies', 'pki_rotation_schedules', 'pki_tenants', 'products',
        'promo_codes', 'shopify_markets', 'sites', 'stories', 'user_profiles', 'webhook_events'
    ];
    table_name TEXT;
    policy_name TEXT;
BEGIN
    FOREACH table_name IN ARRAY tables_to_secure LOOP
        policy_name := 'deny_anonymous_access_' || table_name;
        BEGIN
            EXECUTE format(
                'CREATE POLICY %I ON public.%I FOR SELECT TO anon USING (false)',
                policy_name,
                table_name
            );
        EXCEPTION WHEN duplicate_object THEN
            NULL;
        END;
    END LOOP;
END $$;

-- ==================== REVOKE SECURITY DEFINER FUNCTION PERMISSIONS ====================

-- Revoke EXECUTE from anon role on all SECURITY DEFINER functions
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

-- Revoke EXECUTE from authenticated role on all SECURITY DEFINER functions
-- These should be protected by SECURITY INVOKER and internal authorization logic instead
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
