/*
  # Complete Security Fixes

  1. Add missing foreign key indexes (14 total)
  2. Fix multiple permissive policies on partner_stores
  3. Fix function search path for handle_new_user
  4. Enable RLS on public tables with appropriate policies
  5. Restrict overly permissive policies on onenote_logs
*/

-- Add missing foreign key indexes for performance
CREATE INDEX IF NOT EXISTS idx_ad_analytics_campaign_id ON public.ad_analytics(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ad_audit_log_asset_id ON public.ad_audit_log(asset_id);
CREATE INDEX IF NOT EXISTS idx_ad_telemetry_asset_id ON public.ad_telemetry(asset_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_user_id ON public.affiliates(user_id);
CREATE INDEX IF NOT EXISTS idx_avatar_products_product_id ON public.avatar_products(product_id);
CREATE INDEX IF NOT EXISTS idx_civic_nodes_location_id ON public.civic_nodes(location_id);
CREATE INDEX IF NOT EXISTS idx_drop_sites_site_id ON public.drop_sites(site_id);
CREATE INDEX IF NOT EXISTS idx_games_location_id ON public.games(location_id);
CREATE INDEX IF NOT EXISTS idx_games_organizer_id ON public.games(organizer_id);
CREATE INDEX IF NOT EXISTS idx_gameware_assets_design_id ON public.gameware_assets(design_id);
CREATE INDEX IF NOT EXISTS idx_gamewear_creator_id ON public.gamewear(creator_id);
CREATE INDEX IF NOT EXISTS idx_gamewear_assets_gamewear_id ON public.gamewear_assets(gamewear_id);
CREATE INDEX IF NOT EXISTS idx_partner_stores_game_id ON public.partner_stores(game_id);
CREATE INDEX IF NOT EXISTS idx_product_sites_site_id ON public.product_sites(site_id);

-- Fix multiple permissive policies issue
DROP POLICY IF EXISTS "Anyone can view partner stores" ON public.partner_stores;
CREATE POLICY "Anyone can view partner stores"
  ON public.partner_stores
  AS RESTRICTIVE
  FOR SELECT
  TO authenticated
  USING (true);

-- Fix function search path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  VALUES (new.id, new.email, now(), now())
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

-- Enable RLS on public tables
ALTER TABLE public.fl_api_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fl_avatar_gear ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fl_fulfillment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fl_gift_progression ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fl_gift_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fl_gift_approval_gates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fl_product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fl_promo_restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fl_promo_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fl_runtime_story_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fl_zakeke_ar_events ENABLE ROW LEVEL SECURITY;

-- Add service role policies for system tables
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role can manage api logs' AND tablename = 'fl_api_logs') THEN
    CREATE POLICY "Service role can manage api logs"
      ON public.fl_api_logs FOR ALL TO service_role
      USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role can manage avatar gear' AND tablename = 'fl_avatar_gear') THEN
    CREATE POLICY "Service role can manage avatar gear"
      ON public.fl_avatar_gear FOR ALL TO service_role
      USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role can manage fulfillment events' AND tablename = 'fl_fulfillment_events') THEN
    CREATE POLICY "Service role can manage fulfillment events"
      ON public.fl_fulfillment_events FOR ALL TO service_role
      USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role can manage gift progression' AND tablename = 'fl_gift_progression') THEN
    CREATE POLICY "Service role can manage gift progression"
      ON public.fl_gift_progression FOR ALL TO service_role
      USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role can manage gift shipments' AND tablename = 'fl_gift_shipments') THEN
    CREATE POLICY "Service role can manage gift shipments"
      ON public.fl_gift_shipments FOR ALL TO service_role
      USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role can manage gift approval gates' AND tablename = 'fl_gift_approval_gates') THEN
    CREATE POLICY "Service role can manage gift approval gates"
      ON public.fl_gift_approval_gates FOR ALL TO service_role
      USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role can manage product variants' AND tablename = 'fl_product_variants') THEN
    CREATE POLICY "Service role can manage product variants"
      ON public.fl_product_variants FOR ALL TO service_role
      USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role can manage promo restrictions' AND tablename = 'fl_promo_restrictions') THEN
    CREATE POLICY "Service role can manage promo restrictions"
      ON public.fl_promo_restrictions FOR ALL TO service_role
      USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role can manage promo usage logs' AND tablename = 'fl_promo_usage_logs') THEN
    CREATE POLICY "Service role can manage promo usage logs"
      ON public.fl_promo_usage_logs FOR ALL TO service_role
      USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role can manage runtime story assets' AND tablename = 'fl_runtime_story_assets') THEN
    CREATE POLICY "Service role can manage runtime story assets"
      ON public.fl_runtime_story_assets FOR ALL TO service_role
      USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role can manage AR events' AND tablename = 'fl_zakeke_ar_events') THEN
    CREATE POLICY "Service role can manage AR events"
      ON public.fl_zakeke_ar_events FOR ALL TO service_role
      USING (true) WITH CHECK (true);
  END IF;
END $$;

-- Add user-scoped policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their avatar gear' AND tablename = 'fl_avatar_gear') THEN
    CREATE POLICY "Users can view their avatar gear"
      ON public.fl_avatar_gear FOR SELECT TO authenticated
      USING ((select auth.uid()::text) = avatar_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their gift progression' AND tablename = 'fl_gift_progression') THEN
    CREATE POLICY "Users can view their gift progression"
      ON public.fl_gift_progression FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM fl_gift_requests WHERE fl_gift_requests.id = fl_gift_progression.request_id AND fl_gift_requests.user_id = (select auth.uid())));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their gift shipments' AND tablename = 'fl_gift_shipments') THEN
    CREATE POLICY "Users can view their gift shipments"
      ON public.fl_gift_shipments FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM fl_gift_requests WHERE fl_gift_requests.id = fl_gift_shipments.request_id AND fl_gift_requests.user_id = (select auth.uid())));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their gift approval gates' AND tablename = 'fl_gift_approval_gates') THEN
    CREATE POLICY "Users can view their gift approval gates"
      ON public.fl_gift_approval_gates FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM fl_gift_requests WHERE fl_gift_requests.id = fl_gift_approval_gates.request_id AND fl_gift_requests.user_id = (select auth.uid())));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can view product variants' AND tablename = 'fl_product_variants') THEN
    CREATE POLICY "Authenticated users can view product variants"
      ON public.fl_product_variants FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can view promo restrictions' AND tablename = 'fl_promo_restrictions') THEN
    CREATE POLICY "Authenticated users can view promo restrictions"
      ON public.fl_promo_restrictions FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their promo usage' AND tablename = 'fl_promo_usage_logs') THEN
    CREATE POLICY "Users can view their promo usage"
      ON public.fl_promo_usage_logs FOR SELECT TO authenticated
      USING ((select auth.uid()) = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can view runtime story assets' AND tablename = 'fl_runtime_story_assets') THEN
    CREATE POLICY "Authenticated users can view runtime story assets"
      ON public.fl_runtime_story_assets FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their AR events' AND tablename = 'fl_zakeke_ar_events') THEN
    CREATE POLICY "Users can view their AR events"
      ON public.fl_zakeke_ar_events FOR SELECT TO authenticated
      USING ((select auth.uid()) = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can create AR events' AND tablename = 'fl_zakeke_ar_events') THEN
    CREATE POLICY "Users can create AR events"
      ON public.fl_zakeke_ar_events FOR INSERT TO authenticated
      WITH CHECK ((select auth.uid()) = user_id);
  END IF;
END $$;

-- Restrict onenote_logs to service role only (remove overly permissive read policy)
DROP POLICY IF EXISTS "Authenticated users can read OneNote logs" ON public.onenote_logs;
