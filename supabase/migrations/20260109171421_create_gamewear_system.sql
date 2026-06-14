/*
  # Create GameWear System

  1. New Tables
    - `gamewear`
      - `id` (uuid, primary key)
      - `creator_id` (uuid, references profiles)
      - `base_art` (text, base design URL)
      - `platforms` (jsonb, supported platforms)
      - `rpm_asset_id` (text, Ready Player Me asset ID)
      - `rpm_glb_url` (text, GLB file URL)
      - `metaMarker_id` (text, MetaMarker integration ID)
      - `printful_id` (text, Printful product ID)
      - `shopify_id` (text, Shopify product ID)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `gamewear_assets`
      - `id` (uuid, primary key)
      - `gamewear_id` (uuid, references gamewear)
      - `platform` (text, platform name)
      - `rpm_asset_id` (text)
      - `rpm_glb_url` (text)
      - `rpm_user_id` (text)
      - `upm_asset_id` (text, Unity package)
      - `upm_install_url` (text)
      - `ufn_package_url` (text, Unreal package)
      - `created_at` (timestamptz)
    
    - `event_templates`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `base_textures` (jsonb)
      - `uv_aligned_textures` (jsonb)
      - `optional_overlays` (jsonb)
      - `created_at` (timestamptz)
    
    - `games`
      - `id` (uuid, primary key)
      - `title` (text)
      - `organizer_id` (uuid, references profiles)
      - `location_id` (uuid, references locations)
      - `date` (timestamptz)
      - `ticket_sales_enabled` (boolean, default false)
      - `gamewear_enabled` (boolean, default false)
      - `created_at` (timestamptz)
    
    - `partner_stores`
      - `id` (uuid, primary key)
      - `game_id` (uuid, references games)
      - `store_name` (text)
      - `shopify_store_url` (text)
      - `layered_clothing_urls` (jsonb)
      - `created_at` (timestamptz)
    
    - `civic_nodes`
      - `id` (uuid, primary key)
      - `name` (text)
      - `location_id` (uuid, references locations)
      - `installation_instructions` (text)
      - `developer_notes` (text)
      - `utility_integrations` (jsonb)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own content
    - Add policies for public read access where appropriate
*/

-- GameWear table
CREATE TABLE IF NOT EXISTS gamewear (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  base_art text NOT NULL,
  platforms jsonb DEFAULT '[]'::jsonb,
  rpm_asset_id text,
  rpm_glb_url text,
  metaMarker_id text,
  printful_id text,
  shopify_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE gamewear ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all gamewear"
  ON gamewear FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own gamewear"
  ON gamewear FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update own gamewear"
  ON gamewear FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_id)
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can delete own gamewear"
  ON gamewear FOR DELETE
  TO authenticated
  USING (auth.uid() = creator_id);

-- GameWear Assets table
CREATE TABLE IF NOT EXISTS gamewear_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gamewear_id uuid REFERENCES gamewear(id) ON DELETE CASCADE,
  platform text NOT NULL,
  rpm_asset_id text,
  rpm_glb_url text,
  rpm_user_id text,
  upm_asset_id text,
  upm_install_url text,
  ufn_package_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE gamewear_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all gamewear assets"
  ON gamewear_assets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert gamewear assets for own gamewear"
  ON gamewear_assets FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gamewear
      WHERE gamewear.id = gamewear_assets.gamewear_id
      AND gamewear.creator_id = auth.uid()
    )
  );

-- Event Templates table
CREATE TABLE IF NOT EXISTS event_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  base_textures jsonb DEFAULT '[]'::jsonb,
  uv_aligned_textures jsonb DEFAULT '[]'::jsonb,
  optional_overlays jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE event_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view event templates"
  ON event_templates FOR SELECT
  TO authenticated
  USING (true);

-- Games table
CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  organizer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  location_id uuid REFERENCES locations(id) ON DELETE SET NULL,
  date timestamptz NOT NULL,
  ticket_sales_enabled boolean DEFAULT false,
  gamewear_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view games"
  ON games FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Organizers can insert games"
  ON games FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Organizers can update own games"
  ON games FOR UPDATE
  TO authenticated
  USING (auth.uid() = organizer_id)
  WITH CHECK (auth.uid() = organizer_id);

-- Partner Stores table
CREATE TABLE IF NOT EXISTS partner_stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES games(id) ON DELETE CASCADE,
  store_name text NOT NULL,
  shopify_store_url text,
  layered_clothing_urls jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE partner_stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view partner stores"
  ON partner_stores FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Game organizers can manage partner stores"
  ON partner_stores FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM games
      WHERE games.id = partner_stores.game_id
      AND games.organizer_id = auth.uid()
    )
  );

-- Civic Nodes table
CREATE TABLE IF NOT EXISTS civic_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location_id uuid REFERENCES locations(id) ON DELETE SET NULL,
  installation_instructions text,
  developer_notes text,
  utility_integrations jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE civic_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view civic nodes"
  ON civic_nodes FOR SELECT
  TO authenticated
  USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_gamewear_creator ON gamewear(creator_id);
CREATE INDEX IF NOT EXISTS idx_gamewear_assets_gamewear ON gamewear_assets(gamewear_id);
CREATE INDEX IF NOT EXISTS idx_games_organizer ON games(organizer_id);
CREATE INDEX IF NOT EXISTS idx_games_location ON games(location_id);
CREATE INDEX IF NOT EXISTS idx_partner_stores_game ON partner_stores(game_id);
CREATE INDEX IF NOT EXISTS idx_civic_nodes_location ON civic_nodes(location_id);
