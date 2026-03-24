-- Migration: 013_handle_new_user
-- Creates a trigger to auto-insert user_preferences when a new user is created

-- Create or replace the function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id, user_type, categories, topics, auto_learn_persona, tone, preferred_ai_model)
  VALUES (
    NEW.id,
    'developer',
    ARRAY[]::text[],
    ARRAY[]::text[],
    true,
    'professional',
    'gemini-2.0-flash'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
