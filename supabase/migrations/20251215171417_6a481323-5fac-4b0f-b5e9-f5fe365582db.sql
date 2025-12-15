-- Fix activity_logs foreign key + RLS policies for admin dashboard

-- Drop existing FK if exists and recreate
ALTER TABLE public.activity_logs DROP CONSTRAINT IF EXISTS activity_logs_user_id_fkey;

ALTER TABLE public.activity_logs
  ADD CONSTRAINT activity_logs_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES public.profiles(user_id)
  ON DELETE CASCADE;

-- Ensure user_roles has FK to profiles for join
ALTER TABLE public.user_roles DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;

ALTER TABLE public.user_roles
  ADD CONSTRAINT user_roles_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES public.profiles(user_id)
  ON DELETE CASCADE;

-- Fix user role insert policy - currently blocks handle_new_user trigger
DROP POLICY IF EXISTS "System can insert roles" ON public.user_roles;

CREATE POLICY "System can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (true);