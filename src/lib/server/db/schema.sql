CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS activities (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    strava_id BIGINT UNIQUE,
    name TEXT NOT NULL,
    distance FLOAT,
    moving_time INTEGER,
    elapsed_time INTEGER,
    total_elevation_gain FLOAT,
    start_date TIMESTAMP,
    avg_speed FLOAT,
    max_speed FLOAT,
    avg_heartrate FLOAT,
    max_heartrate INTEGER,
    avg_cadence FLOAT,
    avg_watts FLOAT,
    max_watts INTEGER,
    kilojoules FLOAT,
    summary_polyline TEXT
);

CREATE TABLE IF NOT EXISTS activity_streams (
    id SERIAL PRIMARY KEY,
    activity_id INTEGER REFERENCES activities(id) ON DELETE CASCADE,
    time_index INTEGER,
    velocity_smooth FLOAT,
    heartrate INTEGER,
    cadence INTEGER,
    watts FLOAT,
    altitude FLOAT,
    grade_smooth FLOAT,
    geom GEOMETRY(Point, 4326)
);

CREATE INDEX IF NOT EXISTS idx_activity_streams_geom ON activity_streams USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_activity_streams_activity_id ON activity_streams(activity_id);
