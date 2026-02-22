-- Drop the partial index from migration 004
DROP INDEX IF EXISTS posts_platform_post_id_unique;

-- Add a proper UNIQUE constraint on platform_post_id
-- PostgreSQL handles multiple NULLs fine in UNIQUE constraints by default (NULL != NULL),
-- and this allows Supabase JS `.upsert(..., { onConflict: 'platform_post_id' })` to find the exact constraint.
ALTER TABLE posts
  ADD CONSTRAINT posts_platform_post_id_key UNIQUE (platform_post_id);
