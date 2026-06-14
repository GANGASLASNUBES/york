/*
  # Advertising & Asset Library System

  Creates comprehensive advertising management system with:
  - Unified asset library
  - Ad campaigns (renamed to avoid conflict)
  - Analytics tracking
  - Microsoft 365 integration
  - Theme customization
*/

-- Assets Library
CREATE TABLE IF NOT EXISTS ad_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  asset_type text NOT NULL CHECK (asset_type IN ('video', 'ar', 'telemetry', 'product', 'image', 'audio')),
  file_url text NOT NULL,
  thumbnail_url text,
  metadata jsonb DEFAULT '{}'::jsonb,
  campaign_ids jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'published', 'archived')),
  role_access jsonb DEFAULT '{"editor": true, "marketing": false, "community": false}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ad_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ad_assets_select" ON ad_assets FOR SELECT TO authenticated
  USING (creator_id = auth.uid() OR status = 'published');

CREATE POLICY "ad_assets_insert" ON ad_assets FOR INSERT TO authenticated
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "ad_assets_update" ON ad_assets FOR UPDATE TO authenticated
  USING (creator_id = auth.uid());

-- Ad Campaigns
CREATE TABLE IF NOT EXISTS ad_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  campaign_type text NOT NULL CHECK (campaign_type IN ('tiktok', 'instagram', 'cross_platform', 'bipsgear')),
  platforms jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
  asset_ids jsonb DEFAULT '[]'::jsonb,
  telemetry_data jsonb DEFAULT '{}'::jsonb,
  start_date timestamptz,
  end_date timestamptz,
  budget numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ad_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ad_campaigns_select" ON ad_campaigns FOR SELECT TO authenticated USING (true);
CREATE POLICY "ad_campaigns_insert" ON ad_campaigns FOR INSERT TO authenticated WITH CHECK (creator_id = auth.uid());
CREATE POLICY "ad_campaigns_update" ON ad_campaigns FOR UPDATE TO authenticated USING (creator_id = auth.uid());

-- Campaign Analytics
CREATE TABLE IF NOT EXISTS ad_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES ad_campaigns(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('tiktok', 'instagram', 'bipsgear', 'cross_platform')),
  views bigint DEFAULT 0,
  engagement bigint DEFAULT 0,
  conversions bigint DEFAULT 0,
  clicks bigint DEFAULT 0,
  shares bigint DEFAULT 0,
  cost numeric DEFAULT 0,
  revenue numeric DEFAULT 0,
  recorded_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE ad_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ad_analytics_select" ON ad_analytics FOR SELECT TO authenticated USING (true);

-- Telemetry Visuals
CREATE TABLE IF NOT EXISTS ad_telemetry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES ad_assets(id) ON DELETE CASCADE,
  telemetry_type text NOT NULL CHECK (telemetry_type IN ('battery_runtime', 'heat_zone', 'usage_pattern', 'location_data', 'performance_metrics')),
  data_source text NOT NULL CHECK (data_source IN ('foster_hardware', 'gear_sensor', 'community_telemetry')),
  visualization_config jsonb DEFAULT '{}'::jsonb,
  anonymized boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ad_telemetry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ad_telemetry_select" ON ad_telemetry FOR SELECT TO authenticated USING (anonymized = true);

-- Microsoft 365 Integrations
CREATE TABLE IF NOT EXISTS m365_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  integration_type text NOT NULL CHECK (integration_type IN ('onedrive', 'stream', 'designer', 'clipchamp', 'powerbi', 'teams', 'sharepoint')),
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  folder_id text,
  settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE m365_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "m365_all" ON m365_integrations FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Site Themes
CREATE TABLE IF NOT EXISTS ad_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  theme_name text NOT NULL,
  base_colors jsonb DEFAULT '{"primary": "#D4AF37", "secondary": "#000000", "accent": "#FFD700"}'::jsonb,
  overlay_mode text DEFAULT 'default' CHECK (overlay_mode IN ('cybernetic', 'nature', 'default', 'custom')),
  texture_pack text DEFAULT 'none' CHECK (texture_pack IN ('bark', 'moss', 'stone', 'water', 'none')),
  gear_state_colors jsonb DEFAULT '{"idle": "#808080", "heating": "#FF4500", "cooling": "#4169E1"}'::jsonb,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ad_themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ad_themes_all" ON ad_themes FOR ALL TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Asset Audit Log
CREATE TABLE IF NOT EXISTS ad_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES ad_assets(id) ON DELETE CASCADE,
  user_id uuid,
  action text NOT NULL CHECK (action IN ('created', 'updated', 'published', 'deleted', 'accessed', 'downloaded')),
  changes jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ad_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ad_audit_select" ON ad_audit_log FOR SELECT TO authenticated USING (true);

-- Indexes
CREATE INDEX idx_ad_assets_creator ON ad_assets(creator_id);
CREATE INDEX idx_ad_assets_type ON ad_assets(asset_type);
CREATE INDEX idx_ad_assets_status ON ad_assets(status);
CREATE INDEX idx_ad_campaigns_creator ON ad_campaigns(creator_id);
CREATE INDEX idx_ad_campaigns_status ON ad_campaigns(status);
CREATE INDEX idx_ad_analytics_campaign ON ad_analytics(campaign_id);
CREATE INDEX idx_ad_analytics_platform ON ad_analytics(platform);
CREATE INDEX idx_ad_telemetry_asset ON ad_telemetry(asset_id);
CREATE INDEX idx_m365_user ON m365_integrations(user_id);
CREATE INDEX idx_ad_themes_user ON ad_themes(user_id);
CREATE INDEX idx_ad_audit_asset ON ad_audit_log(asset_id);
