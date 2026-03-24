-- Migration: 012_auto_learn_persona
-- Adds auto_learn_persona boolean to user_preferences table for the Progressive Learning MVP

ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS auto_learn_persona BOOLEAN DEFAULT true NOT NULL;
