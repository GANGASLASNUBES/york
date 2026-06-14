/*
  # Create Civic User Pins Table

  1. New Tables
    - `user_pins`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `type` (text: public, private, gear, story)
      - `lat` (double precision)
      - `lng` (double precision)
      - `title` (text)
      - `description` (text)
      - `category` (text: shelter, event, safety, art, etc.)
      - `severity` (text, nullable: green/amber/red)
      - `image_url` (text, nullable)
      - `approved` (boolean, default false for public pins)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `user_pins` table
    - Authenticated users can read public and approved pins
    - Users can read their own private pins
    - Users can insert their own pins
    - Users can update/delete their own pins

  3. Indexes
    - Spatial index on lat/lng for proximity queries
    - Index on user_id for ownership queries
    - Index on type for filtering
*/

CREATE TABLE IF NOT EXISTS user_pins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  type text NOT NULL DEFAULT 'public' CHECK (type IN ('public', 'private', 'gear', 'story')),
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'general',
  severity text CHECK (severity IS NULL OR severity IN ('green', 'amber', 'red')),
  image_url text,
  approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_pins ENABLE ROW LEVEL SECURITY;

-- Users can view approved public pins and all their own pins
CREATE POLICY "Users can view public approved pins"
  ON user_pins
  FOR SELECT
  TO authenticated
  USING (
    (type = 'public' AND approved = true)
    OR (user_id = auth.uid())
  );

-- Users can create their own pins
CREATE POLICY "Users can create own pins"
  ON user_pins
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users can update their own pins
CREATE POLICY "Users can update own pins"
  ON user_pins
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own pins
CREATE POLICY "Users can delete own pins"
  ON user_pins
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_pins_user_id ON user_pins(user_id);
CREATE INDEX IF NOT EXISTS idx_user_pins_type ON user_pins(type);
CREATE INDEX IF NOT EXISTS idx_user_pins_location ON user_pins(lat, lng);
CREATE INDEX IF NOT EXISTS idx_user_pins_category ON user_pins(category);
CREATE INDEX IF NOT EXISTS idx_user_pins_approved ON user_pins(approved) WHERE type = 'public';
