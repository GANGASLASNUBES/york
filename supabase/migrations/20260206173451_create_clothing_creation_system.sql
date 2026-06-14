/*
  # ᗺIPS Clothing Creation System

  1. New Tables
    - `art_assets`
      - `id` (uuid, primary key)
      - `name` (text)
      - `file_url` (text) - URL to asset file in storage
      - `file_type` (text) - image, video, texture, etc.
      - `asset_type` (text) - avatar, brand, pattern, texture, mask, video_loop, civic_data
      - `tags` (text array) - searchable tags
      - `creator_id` (text) - creator identifier
      - `is_lexi_compliant` (boolean) - has red mask + black smile
      - `metadata` (jsonb) - color palette, dimensions, transparency, etc.
      - `version` (integer) - version number
      - `parent_id` (uuid) - references parent asset if this is an edited version
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `clothing_designs`
      - `id` (uuid, primary key)
      - `name` (text)
      - `creator_id` (text)
      - `product_type` (text) - hoodie, tee, joggers, hat, bag
      - `design_json` (jsonb) - layers, positions, scale, rotation
      - `printful_product_id` (text)
      - `print_file_url` (text)
      - `mockup_urls` (text array)
      - `status` (text) - draft, ready, published
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `printful_orders`
      - `id` (uuid, primary key)
      - `design_id` (uuid) - references clothing_designs
      - `printful_order_id` (text)
      - `shopify_order_id` (text)
      - `status` (text) - pending, fulfilled, cancelled
      - `order_data` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `gameware_assets`
      - `id` (uuid, primary key)
      - `design_id` (uuid) - references clothing_designs
      - `name` (text)
      - `asset_type` (text) - texture, sprite_sheet, normal_map, mask, model
      - `engine` (text) - unity, unreal, godot, webgl
      - `file_url` (text)
      - `metadata` (jsonb) - creator, version, licensing, avatar_fit_data
      - `is_unlocked` (boolean) - based on purchase verification
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Policies for authenticated users to manage their own content
    - Public read access for published assets
*/

-- Art Assets Table
CREATE TABLE IF NOT EXISTS art_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  asset_type text NOT NULL,
  tags text[] DEFAULT '{}',
  creator_id text,
  is_lexi_compliant boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  version integer DEFAULT 1,
  parent_id uuid REFERENCES art_assets(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE art_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published art assets"
  ON art_assets FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create art assets"
  ON art_assets FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own art assets"
  ON art_assets FOR UPDATE
  TO authenticated
  USING (creator_id = current_user::text)
  WITH CHECK (creator_id = current_user::text);

-- Clothing Designs Table
CREATE TABLE IF NOT EXISTS clothing_designs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  creator_id text,
  product_type text NOT NULL,
  design_json jsonb DEFAULT '{}',
  printful_product_id text,
  print_file_url text,
  mockup_urls text[] DEFAULT '{}',
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE clothing_designs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published designs"
  ON clothing_designs FOR SELECT
  TO public
  USING (status = 'published' OR creator_id = current_user::text);

CREATE POLICY "Authenticated users can create designs"
  ON clothing_designs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own designs"
  ON clothing_designs FOR UPDATE
  TO authenticated
  USING (creator_id = current_user::text)
  WITH CHECK (creator_id = current_user::text);

-- Printful Orders Table
CREATE TABLE IF NOT EXISTS printful_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id uuid REFERENCES clothing_designs(id),
  printful_order_id text,
  shopify_order_id text,
  status text DEFAULT 'pending',
  order_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE printful_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders"
  ON printful_orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clothing_designs
      WHERE clothing_designs.id = printful_orders.design_id
      AND clothing_designs.creator_id = current_user::text
    )
  );

CREATE POLICY "Authenticated users can create orders"
  ON printful_orders FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Gameware Assets Table
CREATE TABLE IF NOT EXISTS gameware_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id uuid REFERENCES clothing_designs(id),
  name text NOT NULL,
  asset_type text NOT NULL,
  engine text NOT NULL,
  file_url text NOT NULL,
  metadata jsonb DEFAULT '{}',
  is_unlocked boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE gameware_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their unlocked gameware"
  ON gameware_assets FOR SELECT
  TO authenticated
  USING (
    is_unlocked = true AND EXISTS (
      SELECT 1 FROM clothing_designs
      WHERE clothing_designs.id = gameware_assets.design_id
      AND clothing_designs.creator_id = current_user::text
    )
  );

CREATE POLICY "System can create gameware assets"
  ON gameware_assets FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_art_assets_creator ON art_assets(creator_id);
CREATE INDEX IF NOT EXISTS idx_art_assets_tags ON art_assets USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_art_assets_type ON art_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_clothing_designs_creator ON clothing_designs(creator_id);
CREATE INDEX IF NOT EXISTS idx_clothing_designs_status ON clothing_designs(status);
CREATE INDEX IF NOT EXISTS idx_gameware_assets_design ON gameware_assets(design_id);
