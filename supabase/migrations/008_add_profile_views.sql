-- Create a migration to add profile_views to follower_snapshots
ALTER TABLE follower_snapshots ADD COLUMN IF NOT EXISTS profile_views integer NOT NULL DEFAULT 0;

-- Comment for clarity
COMMENT ON COLUMN follower_snapshots.profile_views IS 'Number of times the user profile was viewed on this day (from Threads API)';
