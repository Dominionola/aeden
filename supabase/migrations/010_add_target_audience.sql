-- Add target_audience column to user_preferences
ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS target_audience text;
