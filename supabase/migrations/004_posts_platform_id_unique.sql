-- Add unique constraint on platform_post_id so we can upsert imported Threads posts
-- without creating duplicates
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS platform_post_url TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS posts_platform_post_id_unique
  ON posts (platform_post_id)
  WHERE platform_post_id IS NOT NULL;
