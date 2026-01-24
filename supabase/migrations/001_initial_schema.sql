-- Aeden Database Schema
-- PostgreSQL with Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- WORK SOURCES TABLE
-- Tracks connected integrations (GitHub, Notion, etc.)
-- ============================================
CREATE TABLE work_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN (
    'manual', 'github', 'notion', 'figma', 'linear', 
    'jira', 'youtube', 'substack', 'stripe', 'webflow', 'airtable'
  )),
  access_token TEXT, -- Encrypted OAuth token
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  account_username TEXT,
  account_id TEXT, -- External platform ID
  is_active BOOLEAN DEFAULT true,
  last_synced_at TIMESTAMPTZ,
  sync_cursor TEXT, -- For incremental syncing
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE (user_id, source_type)
);

-- ============================================
-- SOCIAL ACCOUNTS TABLE
-- Connected social platforms for publishing
-- ============================================
CREATE TABLE social_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('threads', 'twitter', 'linkedin')),
  access_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ,
  account_id TEXT NOT NULL, -- Platform user ID
  account_handle TEXT, -- @username
  profile_picture_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE (user_id, platform)
);

-- ============================================
-- POSTS TABLE
-- Generated and published posts
-- ============================================
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'threads' CHECK (platform IN ('threads', 'twitter', 'linkedin')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'publishing', 'published', 'failed')),
  image_url TEXT,
  source_type TEXT DEFAULT 'manual' CHECK (source_type IN (
    'manual', 'github', 'notion', 'figma', 'linear', 
    'jira', 'youtube', 'substack', 'stripe', 'webflow', 'airtable'
  )),
  source_data JSONB, -- Raw data from source (commit, task, etc.)
  ai_model_version TEXT DEFAULT 'gemini-2.0-flash',
  platform_post_id TEXT, -- ID from published platform
  platform_post_url TEXT,
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  -- Analytics (synced from platform)
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  last_analytics_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER PREFERENCES TABLE
-- Persona, tone, and voice settings
-- ============================================
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  user_type TEXT DEFAULT 'developer' CHECK (user_type IN (
    'developer', 'designer', 'product_manager', 'no_code_builder',
    'content_creator', 'founder', 'other'
  )),
  tone TEXT DEFAULT 'casual' CHECK (tone IN (
    'casual', 'professional', 'technical', 'humorous', 'inspirational'
  )),
  creator_bookmarks JSONB DEFAULT '[]'::jsonb,
  -- Example: [{"url": "https://threads.net/@levelsio", "platform": "threads", "username": "@levelsio"}]
  brand_guidelines TEXT,
  voice_analysis JSONB,
  -- Stores AI-analyzed voice characteristics
  default_posting_time TIME,
  preferred_ai_model TEXT DEFAULT 'gemini' CHECK (preferred_ai_model IN ('gemini', 'claude')),
  auto_generate_on_sync BOOLEAN DEFAULT false,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_scheduled_at ON posts(scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX idx_work_sources_user_id ON work_sources(user_id);
CREATE INDEX idx_social_accounts_user_id ON social_accounts(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- Users can only access their own data
-- ============================================
ALTER TABLE work_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Work Sources Policies
CREATE POLICY "Users can view own work sources"
  ON work_sources FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own work sources"
  ON work_sources FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own work sources"
  ON work_sources FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own work sources"
  ON work_sources FOR DELETE
  USING (auth.uid() = user_id);

-- Social Accounts Policies
CREATE POLICY "Users can view own social accounts"
  ON social_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own social accounts"
  ON social_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own social accounts"
  ON social_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own social accounts"
  ON social_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- Posts Policies
CREATE POLICY "Users can view own posts"
  ON posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  USING (auth.uid() = user_id);

-- User Preferences Policies
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- UPDATED_AT TRIGGER
-- Auto-update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_work_sources_updated_at
  BEFORE UPDATE ON work_sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_accounts_updated_at
  BEFORE UPDATE ON social_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
