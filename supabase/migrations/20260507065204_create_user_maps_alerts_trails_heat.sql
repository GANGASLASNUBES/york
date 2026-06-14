/*
  # Create User Maps, Alerts, Trails, and City Heat Index

  1. New Tables
    - `user_maps` - Custom saved map configurations
    - `user_alerts` - Alert subscriptions per user
    - `user_trails` - City trails (system and user-created)
    - `city_heat_index` - Historical city mood readings

  2. Security
    - RLS enabled on all tables
    - Users access own data + public content

  3. Indexes
    - Optimized for user lookups and public content queries
*/

-- User maps
CREATE TABLE IF NOT EXISTS user_maps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  name text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  overlays jsonb NOT NULL DEFAULT '[]'::jsonb,
  pins jsonb NOT NULL DEFAULT '[]'::jsonb,
  trails jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text NOT NULL DEFAULT '',
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_maps ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_maps' AND policyname = 'Users can view own and public maps') THEN
    CREATE POLICY "Users can view own and public maps"
      ON user_maps FOR SELECT TO authenticated
      USING (user_id = auth.uid() OR is_public = true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_maps' AND policyname = 'Users can insert own maps') THEN
    CREATE POLICY "Users can insert own maps"
      ON user_maps FOR INSERT TO authenticated
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_maps' AND policyname = 'Users can update own maps') THEN
    CREATE POLICY "Users can update own maps"
      ON user_maps FOR UPDATE TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_maps' AND policyname = 'Users can delete own maps') THEN
    CREATE POLICY "Users can delete own maps"
      ON user_maps FOR DELETE TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_maps_user_id ON user_maps(user_id);

-- User alerts
CREATE TABLE IF NOT EXISTS user_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  alert_type text NOT NULL CHECK (alert_type IN ('snow', 'transit', 'air_quality', 'events', 'safety')),
  severity_threshold text NOT NULL DEFAULT 'amber' CHECK (severity_threshold IN ('green', 'amber', 'red')),
  delivery_method text NOT NULL DEFAULT 'web' CHECK (delivery_method IN ('web', 'email', 'sms')),
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_alerts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_alerts' AND policyname = 'Users can view own alerts') THEN
    CREATE POLICY "Users can view own alerts"
      ON user_alerts FOR SELECT TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_alerts' AND policyname = 'Users can insert own alerts') THEN
    CREATE POLICY "Users can insert own alerts"
      ON user_alerts FOR INSERT TO authenticated
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_alerts' AND policyname = 'Users can update own alerts') THEN
    CREATE POLICY "Users can update own alerts"
      ON user_alerts FOR UPDATE TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_alerts' AND policyname = 'Users can delete own alerts') THEN
    CREATE POLICY "Users can delete own alerts"
      ON user_alerts FOR DELETE TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_alerts_user_id ON user_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_alerts_type ON user_alerts(alert_type);

-- User trails
CREATE TABLE IF NOT EXISTS user_trails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  name text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  trail_type text NOT NULL DEFAULT 'custom' CHECK (trail_type IN ('art', 'park', 'festival', 'safety', 'custom')),
  route_points jsonb NOT NULL DEFAULT '[]'::jsonb,
  pins jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_public boolean NOT NULL DEFAULT false,
  is_system boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_trails ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_trails' AND policyname = 'Users can view public and own trails') THEN
    CREATE POLICY "Users can view public and own trails"
      ON user_trails FOR SELECT TO authenticated
      USING (is_public = true OR is_system = true OR user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_trails' AND policyname = 'Users can insert own trails') THEN
    CREATE POLICY "Users can insert own trails"
      ON user_trails FOR INSERT TO authenticated
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_trails' AND policyname = 'Users can update own trails') THEN
    CREATE POLICY "Users can update own trails"
      ON user_trails FOR UPDATE TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_trails' AND policyname = 'Users can delete own trails') THEN
    CREATE POLICY "Users can delete own trails"
      ON user_trails FOR DELETE TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_trails_user_id ON user_trails(user_id);
CREATE INDEX IF NOT EXISTS idx_user_trails_type ON user_trails(trail_type);
CREATE INDEX IF NOT EXISTS idx_user_trails_public ON user_trails(is_public) WHERE is_public = true;

-- City heat index
CREATE TABLE IF NOT EXISTS city_heat_index (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recorded_at timestamptz NOT NULL DEFAULT now(),
  noise_score integer NOT NULL DEFAULT 0 CHECK (noise_score BETWEEN 0 AND 100),
  traffic_score integer NOT NULL DEFAULT 0 CHECK (traffic_score BETWEEN 0 AND 100),
  air_quality_score integer NOT NULL DEFAULT 0 CHECK (air_quality_score BETWEEN 0 AND 100),
  events_score integer NOT NULL DEFAULT 0 CHECK (events_score BETWEEN 0 AND 100),
  weather_score integer NOT NULL DEFAULT 0 CHECK (weather_score BETWEEN 0 AND 100),
  transit_score integer NOT NULL DEFAULT 0 CHECK (transit_score BETWEEN 0 AND 100),
  overall_mood text NOT NULL DEFAULT 'stable' CHECK (overall_mood IN ('energized', 'stable', 'stressed', 'overloaded')),
  composite_score integer NOT NULL DEFAULT 50 CHECK (composite_score BETWEEN 0 AND 100)
);

ALTER TABLE city_heat_index ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'city_heat_index' AND policyname = 'Authenticated users can view heat index') THEN
    CREATE POLICY "Authenticated users can view heat index"
      ON city_heat_index FOR SELECT TO authenticated
      USING (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_city_heat_index_timestamp ON city_heat_index(recorded_at DESC);
