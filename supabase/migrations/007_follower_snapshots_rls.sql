-- Add RLS policies to allow authenticated users to insert and update their own follower snapshots
-- (This is necessary because the manual sync route uses the user's authenticated client, not the service role)

CREATE POLICY "Users can insert own follower snapshots"
    ON follower_snapshots FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own follower snapshots"
    ON follower_snapshots FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
