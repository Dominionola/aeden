-- ============================================================
-- BOOTSTRAP: Run this ONE TIME in the Supabase SQL Editor.
-- After this, use `npm run migrate` for all future migrations.
-- ============================================================

-- Creates a helper function that lets the migration runner execute arbitrary SQL
-- using the service_role key. Only the service role can call this.
CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER  -- runs as the function owner (postgres superuser)
AS $$
BEGIN
  EXECUTE sql_query;
END;
$$;

-- Restrict access: only service_role can call this, not anon users
REVOKE ALL ON FUNCTION exec_sql(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION exec_sql(TEXT) FROM anon;
REVOKE ALL ON FUNCTION exec_sql(TEXT) FROM authenticated;
-- service_role retains access via SECURITY DEFINER
