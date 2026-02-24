-- Create follower_snapshots table to store daily follower counts
CREATE TABLE IF NOT EXISTS follower_snapshots (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    follower_count integer NOT NULL DEFAULT 0,
    snapshot_date date NOT NULL DEFAULT CURRENT_DATE,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, snapshot_date)
);

-- Enable RLS
ALTER TABLE follower_snapshots ENABLE ROW LEVEL SECURITY;

-- Users can read their own snapshots
CREATE POLICY "Users can read own follower snapshots"
    ON follower_snapshots FOR SELECT
    USING (auth.uid() = user_id);

-- Service role can insert/update (for sync routes)
CREATE POLICY "Service can manage follower snapshots"
    ON follower_snapshots FOR ALL
    USING (true)
    WITH CHECK (true);

-- Index for fast lookups
CREATE INDEX idx_follower_snapshots_user_date
    ON follower_snapshots(user_id, snapshot_date DESC);
