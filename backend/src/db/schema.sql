-- Future PostGIS schema sketch for production.
-- Install extension first:
-- CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS vehicle_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  height_inches INTEGER NOT NULL,
  weight_lbs INTEGER NOT NULL,
  length_ft NUMERIC,
  width_ft NUMERIC,
  axles INTEGER,
  has_hazmat BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS restriction_points (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  borough TEXT,
  geom GEOGRAPHY(POINT, 4326),
  severity TEXT NOT NULL,
  clearance_inches INTEGER,
  max_weight_lbs INTEGER,
  commercial_vehicle_prohibited BOOLEAN DEFAULT FALSE,
  hazmat_prohibited BOOLEAN DEFAULT FALSE,
  source_name TEXT,
  source_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS driver_reports (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  type TEXT NOT NULL,
  location TEXT NOT NULL,
  note TEXT,
  geom GEOGRAPHY(POINT, 4326),
  status TEXT DEFAULT 'pending_review',
  votes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
