-- Migration: 013_handle_new_user
-- Automatically creates a default user_preferences row when a new user signs up.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_preferences (
    user_id, 
    user_type, 
    tone, 
    preferred_ai_model,
    auto_learn_persona
  )
  VALUES (
    new.id, 
    'developer', 
    'professional', 
    'gemini-2.0-flash',
    true
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger attached to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
