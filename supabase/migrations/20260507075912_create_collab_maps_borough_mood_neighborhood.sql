/*
  # Create Collaborative Maps, Borough Mood, and Neighborhood Stats Tables

  1. New Tables
    - `collab_maps` - Collaborative map definitions
    - `collab_map_members` - Membership/permissions for collab maps
    - `collab_map_pins` - Pins on collaborative maps
    - `borough_mood` - Borough-level mood scores
    - `neighborhood_stats` - Neighborhood-level snapshot data

  2. Security
    - RLS enabled on all tables
    - collab_maps: owner can CRUD, members can SELECT
    - collab_map_members: map owner manages, members see own
    - collab_map_pins: members with pin/edit/manage role can insert
    - borough_mood: authenticated can SELECT, admin can INSERT
    - neighborhood_stats: authenticated can SELECT, admin can manage

  3. Indexes on foreign keys and common queries
*/

-- Create all tables first, then policies

CREATE TABLE IF NOT EXISTS collab_maps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  overlays jsonb NOT NULL DEFAULT '[]'::jsonb,
  center_lat numeric NOT NULL DEFAULT 45.5017,
  center_lng numeric NOT NULL DEFAULT -73.5673,
  zoom integer NOT NULL DEFAULT 13,
  is_public boolean NOT NULL DEFAULT false,
  public_slug text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS collab_map_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id uuid NOT NULL REFERENCES collab_maps(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  email text NOT NULL,
  role text NOT NULL DEFAULT 'view',
  invited_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz
);

CREATE TABLE IF NOT EXISTS collab_map_pins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id uuid NOT NULL REFERENCES collab_maps(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  lat numeric NOT NULL,
  lng numeric NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'general',
  severity text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS borough_mood (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  borough text NOT NULL,
  noise_score integer NOT NULL DEFAULT 0,
  traffic_score integer NOT NULL DEFAULT 0,
  air_quality_score integer NOT NULL DEFAULT 0,
  events_score integer NOT NULL DEFAULT 0,
  weather_score integer NOT NULL DEFAULT 0,
  transit_score integer NOT NULL DEFAULT 0,
  composite_score integer NOT NULL DEFAULT 0,
  mood text NOT NULL DEFAULT 'stable',
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS neighborhood_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  borough text NOT NULL,
  neighborhood text NOT NULL,
  heat_index integer NOT NULL DEFAULT 50,
  transit_status text NOT NULL DEFAULT 'normal',
  noise_level integer NOT NULL DEFAULT 40,
  air_quality integer NOT NULL DEFAULT 30,
  active_events integer NOT NULL DEFAULT 0,
  shelter_capacity text NOT NULL DEFAULT 'available',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE collab_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE collab_map_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE collab_map_pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE borough_mood ENABLE ROW LEVEL SECURITY;
ALTER TABLE neighborhood_stats ENABLE ROW LEVEL SECURITY;

-- Revoke anon access
REVOKE ALL ON collab_maps FROM anon;
REVOKE ALL ON collab_map_members FROM anon;
REVOKE ALL ON collab_map_pins FROM anon;
REVOKE ALL ON borough_mood FROM anon;
REVOKE ALL ON neighborhood_stats FROM anon;

-- Policies for collab_maps
CREATE POLICY "Owners can manage own maps"
  ON collab_maps FOR ALL TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Members can view maps they belong to"
  ON collab_maps FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM collab_map_members
      WHERE collab_map_members.map_id = collab_maps.id
      AND collab_map_members.user_id = auth.uid()
    )
  );

-- Policies for collab_map_members
CREATE POLICY "Map owners can manage members"
  ON collab_map_members FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM collab_maps
      WHERE collab_maps.id = collab_map_members.map_id
      AND collab_maps.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM collab_maps
      WHERE collab_maps.id = collab_map_members.map_id
      AND collab_maps.owner_id = auth.uid()
    )
  );

CREATE POLICY "Members can view own membership"
  ON collab_map_members FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Policies for collab_map_pins
CREATE POLICY "Map members and owners can view pins"
  ON collab_map_pins FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM collab_map_members
      WHERE collab_map_members.map_id = collab_map_pins.map_id
      AND collab_map_members.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM collab_maps
      WHERE collab_maps.id = collab_map_pins.map_id
      AND collab_maps.owner_id = auth.uid()
    )
  );

CREATE POLICY "Members with pin role can insert pins"
  ON collab_map_pins FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND (
      EXISTS (
        SELECT 1 FROM collab_maps
        WHERE collab_maps.id = collab_map_pins.map_id
        AND collab_maps.owner_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM collab_map_members
        WHERE collab_map_members.map_id = collab_map_pins.map_id
        AND collab_map_members.user_id = auth.uid()
        AND collab_map_members.role IN ('pin', 'edit', 'manage')
      )
    )
  );

CREATE POLICY "Pin owners can update own pins"
  ON collab_map_pins FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Pin owners and map owners can delete pins"
  ON collab_map_pins FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM collab_maps
      WHERE collab_maps.id = collab_map_pins.map_id
      AND collab_maps.owner_id = auth.uid()
    )
  );

-- Policies for borough_mood
CREATE POLICY "Authenticated users can view borough mood"
  ON borough_mood FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can insert borough mood"
  ON borough_mood FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Policies for neighborhood_stats
CREATE POLICY "Authenticated users can view neighborhood stats"
  ON neighborhood_stats FOR SELECT TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage neighborhood stats"
  ON neighborhood_stats FOR INSERT TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can update neighborhood stats"
  ON neighborhood_stats FOR UPDATE TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_collab_maps_owner ON collab_maps(owner_id);
CREATE INDEX IF NOT EXISTS idx_collab_maps_slug ON collab_maps(public_slug) WHERE public_slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_collab_members_map ON collab_map_members(map_id);
CREATE INDEX IF NOT EXISTS idx_collab_members_user ON collab_map_members(user_id);
CREATE INDEX IF NOT EXISTS idx_collab_pins_map ON collab_map_pins(map_id);
CREATE INDEX IF NOT EXISTS idx_borough_mood_borough_time ON borough_mood(borough, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_neighborhood_stats_lookup ON neighborhood_stats(borough, neighborhood);
