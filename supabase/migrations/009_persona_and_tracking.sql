-- Migration: 009_persona_and_tracking
-- Adds Hybrid Persona input fields to user_preferences and creates post_edits table.

-- 1. Add fields to user_preferences
ALTER TABLE IF EXISTS user_preferences 
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS topics JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS refinement TEXT,
ADD COLUMN IF NOT EXISTS ai_context TEXT;

-- 2. Create post_edits table for progressive learning tracking
CREATE TABLE IF NOT EXISTS post_edits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  original_ai_text TEXT NOT NULL,
  user_edited_text TEXT NOT NULL,
  changes JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS for post_edits
ALTER TABLE post_edits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own post edits" ON post_edits
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_edits.post_id AND posts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own post edits" ON post_edits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts
      WHERE posts.id = post_edits.post_id AND posts.user_id = auth.uid()
    )
  );
