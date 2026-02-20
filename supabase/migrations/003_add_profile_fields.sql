-- Migration 003: Add extended profile fields to social_accounts
-- Run this in your Supabase SQL Editor

ALTER TABLE social_accounts
  ADD COLUMN IF NOT EXISTS biography TEXT,
  ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;
