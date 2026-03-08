
-- Add avatar_url column to profiles
ALTER TABLE public.profiles ADD COLUMN avatar_url text DEFAULT NULL;

-- Update handle_new_user trigger to store avatar
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, username, is_approved, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'username',
    CASE
      WHEN NEW.raw_user_meta_data ->> 'username' = 'lmaomaidah' THEN true
      ELSE false
    END,
    NEW.raw_user_meta_data ->> 'avatar_url'
  );

  IF NEW.raw_user_meta_data ->> 'username' = 'lmaomaidah' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
  END IF;

  RETURN NEW;
END;
$function$;
