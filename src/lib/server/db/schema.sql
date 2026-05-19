CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  image TEXT,

  strava_athlete_id VARCHAR(255) UNIQUE,
  refresh_token TEXT NOT NULL,
  access_token TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  scope VARCHAR(255)
);

CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  strava_activity_id BIGINT UNIQUE,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) DEFAULT 'Ride',
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,

  distance_meters REAL NOT NULL,
  moving_time_seconds INTEGER NOT NULL,
  elapsed_time_seconds INTEGER NOT NULL,
  avg_speed_mps REAL NOT NULL,
  max_speed_mps REAL,
  total_elevation_gain REAL,

  summary_polyline TEXT,
  geom_route GEOMETRY(LineString, 4326)
);

CREATE TABLE activity_streams (
  id BIGSERIAL PRIMARY KEY,
  activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,

  time_offsets INTEGER[] NOT NULL,
  latitudes DOUBLE PRECISION[],
  longitudes DOUBLE PRECISION[],
  speeds REAL[],
  altitudes REAL[],
  cadence INTEGER[],
  watts INTEGER[],
  heartrate INTEGER[]
);

CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_start ON activities(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_activities_spatial ON activities USING GIST(geom_route);
CREATE INDEX IF NOT EXISTS idx_streams_activity ON activity_streams(activity_id);
