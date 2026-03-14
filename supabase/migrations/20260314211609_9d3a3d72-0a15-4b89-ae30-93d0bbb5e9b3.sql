
CREATE OR REPLACE FUNCTION public.log_activity_event(_action_type text, _action_details jsonb DEFAULT '{}'::jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _user_id uuid := auth.uid();
  _username text;
  _enriched jsonb;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Fetch username to embed in the log so it survives user deletion
  SELECT username INTO _username FROM public.profiles WHERE user_id = _user_id;

  _enriched := COALESCE(_action_details, '{}'::jsonb);
  _enriched := _enriched || jsonb_build_object('_logged_username', COALESCE(_username, 'unknown'));
  _enriched := _enriched || jsonb_build_object('_logged_user_id', _user_id::text);

  INSERT INTO public.activity_logs (user_id, action_type, action_details)
  VALUES (
    _user_id,
    LEFT(COALESCE(NULLIF(TRIM(_action_type), ''), 'unknown_action'), 120),
    _enriched
  );
END;
$function$;
