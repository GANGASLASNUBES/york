/*
  # Clean Up Legacy Supabase Tables

  1. Overview
    - Remove all legacy Supabase tables that are no longer used
    - The BIPS project now uses Convex.dev as the primary backend
    - This migration removes orphaned tables, indexes, and SECURITY DEFINER views
    - Preserves auth tables and any necessary Supabase system tables

  2. Tables Being Removed
    - Advertising System: ad_analytics, ad_audit_log, ad_telemetry
    - Affiliate System: affiliates, avatar_affiliates, commission_ledger
    - Art System: art_assets, pki_art_editions, pki_art_provenance
    - Avatar System: avatar_drops, avatar_products, avatar_sites, avatar_stories
    - Certificate System: certificate_authorities, pki_certificate_authorities, etc.
    - Location System: civic_nodes, device_locations, location_sites
    - Game System: games, gameware_assets, gamewear, gamewear_assets, partner_stores
    - Fulfillment System: fl_* tables (all)
    - PKI System: pki_* tables (all)
    - Additional: digital_signatures, drop_sites, gifting_requests, identity_verifications, etc.

  3. Views Being Removed
    - pki_audit_kee_view
    - pki_audit_k_view
    - pki_avatar_keypack_summary
    - pki_audit_lexi_view

  4. Security Changes
    - Removes all SECURITY DEFINER views that posed potential risks
    - Eliminates unused indexes that were impacting performance

  5. Important Notes
    - Auth tables remain intact for user authentication
    - Only removes tables specific to legacy features
    - Convex replaces all data persistence for BIPS features
*/

-- Drop legacy views with SECURITY DEFINER
DROP VIEW IF EXISTS public.pki_audit_kee_view CASCADE;
DROP VIEW IF EXISTS public.pki_audit_k_view CASCADE;
DROP VIEW IF EXISTS public.pki_avatar_keypack_summary CASCADE;
DROP VIEW IF EXISTS public.pki_audit_lexi_view CASCADE;

-- Drop PKI/Certificate system tables
DROP TABLE IF EXISTS public.pki_rotation_history CASCADE;
DROP TABLE IF EXISTS public.pki_revocations CASCADE;
DROP TABLE IF EXISTS public.pki_promo_usage CASCADE;
DROP TABLE IF EXISTS public.pki_policy_rules CASCADE;
DROP TABLE IF EXISTS public.pki_impersonation_sessions CASCADE;
DROP TABLE IF EXISTS public.pki_gift_cards CASCADE;
DROP TABLE IF EXISTS public.pki_gift_card_transitions CASCADE;
DROP TABLE IF EXISTS public.pki_edition_verifications CASCADE;
DROP TABLE IF EXISTS public.pki_drop_certificates CASCADE;
DROP TABLE IF EXISTS public.pki_avatar_keys CASCADE;
DROP TABLE IF EXISTS public.pki_avatar_keypacks CASCADE;
DROP TABLE IF EXISTS public.pki_certificate_scopes CASCADE;
DROP TABLE IF EXISTS public.pki_certificates CASCADE;
DROP TABLE IF EXISTS public.pki_certificate_authorities CASCADE;
DROP TABLE IF EXISTS public.pki_art_provenance CASCADE;
DROP TABLE IF EXISTS public.pki_art_editions CASCADE;
DROP TABLE IF EXISTS public.pki_affiliate_commission_changes CASCADE;
DROP TABLE IF EXISTS public.pki_affiliate_registry CASCADE;
DROP TABLE IF EXISTS public.pki_audit_log CASCADE;
DROP TABLE IF EXISTS public.pki_tenant_environments CASCADE;
DROP TABLE IF EXISTS public.pki_webhook_keys CASCADE;

-- Drop Fulfillment System tables
DROP TABLE IF EXISTS public.fl_zakeke_customizations CASCADE;
DROP TABLE IF EXISTS public.fl_zakeke_ar_events CASCADE;
DROP TABLE IF EXISTS public.fl_runtime_story_assets CASCADE;
DROP TABLE IF EXISTS public.fl_promo_usage_logs CASCADE;
DROP TABLE IF EXISTS public.fl_promo_restrictions CASCADE;
DROP TABLE IF EXISTS public.fl_promo_codes CASCADE;
DROP TABLE IF EXISTS public.fl_product_variants CASCADE;
DROP TABLE IF EXISTS public.fl_gift_shipments CASCADE;
DROP TABLE IF EXISTS public.fl_gift_requests CASCADE;
DROP TABLE IF EXISTS public.fl_gift_progression CASCADE;
DROP TABLE IF EXISTS public.fl_gift_approval_gates CASCADE;
DROP TABLE IF EXISTS public.fl_fulfillment_events CASCADE;
DROP TABLE IF EXISTS public.fl_avatar_gear CASCADE;
DROP TABLE IF EXISTS public.fl_affiliate_sku_mappings CASCADE;

-- Drop advertising system tables
DROP TABLE IF EXISTS public.ad_telemetry CASCADE;
DROP TABLE IF EXISTS public.ad_audit_log CASCADE;
DROP TABLE IF EXISTS public.ad_analytics CASCADE;

-- Drop art/asset system tables
DROP TABLE IF EXISTS public.art_assets CASCADE;

-- Drop avatar/product system tables
DROP TABLE IF EXISTS public.avatar_affiliates CASCADE;
DROP TABLE IF EXISTS public.avatar_drops CASCADE;
DROP TABLE IF EXISTS public.avatar_products CASCADE;
DROP TABLE IF EXISTS public.avatar_sites CASCADE;
DROP TABLE IF EXISTS public.avatar_stories CASCADE;

-- Drop affiliate system tables
DROP TABLE IF EXISTS public.commission_ledger CASCADE;
DROP TABLE IF EXISTS public.affiliates CASCADE;

-- Drop location system tables
DROP TABLE IF EXISTS public.location_sites CASCADE;
DROP TABLE IF EXISTS public.device_locations CASCADE;
DROP TABLE IF EXISTS public.civic_nodes CASCADE;

-- Drop game/gameware system tables
DROP TABLE IF EXISTS public.gameware_assets CASCADE;
DROP TABLE IF EXISTS public.gamewear_assets CASCADE;
DROP TABLE IF EXISTS public.gamewear CASCADE;
DROP TABLE IF EXISTS public.partner_stores CASCADE;
DROP TABLE IF EXISTS public.games CASCADE;

-- Drop certificate/key system tables
DROP TABLE IF EXISTS public.digital_signatures CASCADE;
DROP TABLE IF EXISTS public.certificate_authorities CASCADE;

-- Drop other legacy tables
DROP TABLE IF EXISTS public.trust_relationships CASCADE;
DROP TABLE IF EXISTS public.identity_verifications CASCADE;
DROP TABLE IF EXISTS public.gifting_requests CASCADE;
DROP TABLE IF EXISTS public.fx_discrepancies CASCADE;
DROP TABLE IF EXISTS public.market_sync_logs CASCADE;
DROP TABLE IF EXISTS public.onenote_logs CASCADE;
DROP TABLE IF EXISTS public.operational_commands CASCADE;
DROP TABLE IF EXISTS public.printful_orders CASCADE;
DROP TABLE IF EXISTS public.product_drops CASCADE;
DROP TABLE IF EXISTS public.product_promos CASCADE;
DROP TABLE IF EXISTS public.product_sites CASCADE;
DROP TABLE IF EXISTS public.drop_sites CASCADE;
