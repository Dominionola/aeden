-- Aeden Database Schema - Part 1: Tables
-- PostgreSQL with Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- WORK SOURCES TABLE
-- Tracks connected integrations (GitHub, Notion, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS work_sources (
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
CREATE TABLE IF NOT EXISTS social_accounts (
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
CREATE TABLE IF NOT EXISTS posts (
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
CREATE TABLE IF NOT EXISTS user_preferences (
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
  brand_guidelines TEXT,
  voice_analysis JSONB,
  default_posting_time TIME,
  preferred_ai_model TEXT DEFAULT 'gemini' CHECK (preferred_ai_model IN ('gemini', 'claude')),
  auto_generate_on_sync BOOLEAN DEFAULT false,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
