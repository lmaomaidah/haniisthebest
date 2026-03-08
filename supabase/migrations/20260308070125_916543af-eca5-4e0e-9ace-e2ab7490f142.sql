-- Harden RLS policy role scope so only authenticated users evaluate policies
DO $$
DECLARE
  p RECORD;
BEGIN
  FOR p IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format(
      'ALTER POLICY %I ON %I.%I TO authenticated;',
      p.policyname,
      p.schemaname,
      p.tablename
    );
  END LOOP;
END
$$;

-- Server-side activity logging helper to prevent spoofed user_id and standardize events
CREATE OR REPLACE FUNCTION public.log_activity_event(
  _action_type text,
  _action_details jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  INSERT INTO public.activity_logs (user_id, action_type, action_details)
  VALUES (
    _user_id,
    LEFT(COALESCE(NULLIF(TRIM(_action_type), ''), 'unknown_action'), 120),
    COALESCE(_action_details, '{}'::jsonb)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_activity_event(text, jsonb) TO authenticated;

-- Performance for admin audit view
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at_desc
  ON public.activity_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_activity_logs_action_type
  ON public.activity_logs (action_type);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_created_at
  ON public.activity_logs (user_id, created_at DESC);