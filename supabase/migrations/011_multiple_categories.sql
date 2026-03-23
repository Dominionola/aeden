-- Migration: 011_multiple_categories
-- Replaces single 'category' with 'categories' array for multi-niche support

-- 1. Add new column 'categories'
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS categories JSONB DEFAULT '[]'::jsonb;

-- 2. Migrate existing 'category' data into 'categories' array
UPDATE public.user_preferences
SET categories = jsonb_build_array(category)
WHERE category IS NOT NULL;

-- 3. Drop the old 'category' column
ALTER TABLE public.user_preferences
DROP COLUMN IF EXISTS category;
