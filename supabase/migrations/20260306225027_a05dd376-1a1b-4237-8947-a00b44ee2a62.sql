-- 1) Ensure all existing public RLS policies apply only to authenticated users
DO $$
DECLARE
  policy_rec RECORD;
BEGIN
  FOR policy_rec IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format(
      'ALTER POLICY %I ON %I.%I TO authenticated',
      policy_rec.policyname,
      policy_rec.schemaname,
      policy_rec.tablename
    );
  END LOOP;
END $$;

-- 2) Add ownership columns for collaborative tables
ALTER TABLE public.tier_lists
ADD COLUMN IF NOT EXISTS user_id uuid;

ALTER TABLE public.venn_diagrams
ADD COLUMN IF NOT EXISTS user_id uuid;

ALTER TABLE public.ratings
ADD COLUMN IF NOT EXISTS user_id uuid;

ALTER TABLE public.images
ADD COLUMN IF NOT EXISTS user_id uuid;

-- 3) Backfill ownership to a known existing user (prefer admin), fallback to random uuid
WITH fallback_user AS (
  SELECT user_id
  FROM public.user_roles
  ORDER BY CASE WHEN role = 'admin' THEN 0 ELSE 1 END, user_id
  LIMIT 1
)
UPDATE public.tier_lists t
SET user_id = COALESCE(t.user_id, (SELECT user_id FROM fallback_user), gen_random_uuid())
WHERE t.user_id IS NULL;

WITH fallback_user AS (
  SELECT user_id
  FROM public.user_roles
  ORDER BY CASE WHEN role = 'admin' THEN 0 ELSE 1 END, user_id
  LIMIT 1
)
UPDATE public.venn_diagrams v
SET user_id = COALESCE(v.user_id, (SELECT user_id FROM fallback_user), gen_random_uuid())
WHERE v.user_id IS NULL;

WITH fallback_user AS (
  SELECT user_id
  FROM public.user_roles
  ORDER BY CASE WHEN role = 'admin' THEN 0 ELSE 1 END, user_id
  LIMIT 1
)
UPDATE public.ratings r
SET user_id = COALESCE(r.user_id, (SELECT user_id FROM fallback_user), gen_random_uuid())
WHERE r.user_id IS NULL;

WITH fallback_user AS (
  SELECT user_id
  FROM public.user_roles
  ORDER BY CASE WHEN role = 'admin' THEN 0 ELSE 1 END, user_id
  LIMIT 1
)
UPDATE public.images i
SET user_id = COALESCE(i.user_id, (SELECT user_id FROM fallback_user), gen_random_uuid())
WHERE i.user_id IS NULL;

ALTER TABLE public.tier_lists ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.venn_diagrams ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.ratings ALTER COLUMN user_id SET DEFAULT auth.uid();
ALTER TABLE public.images ALTER COLUMN user_id SET DEFAULT auth.uid();

ALTER TABLE public.tier_lists ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.venn_diagrams ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.ratings ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE public.images ALTER COLUMN user_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tier_lists_user_id ON public.tier_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_venn_diagrams_user_id ON public.venn_diagrams(user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON public.ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_images_user_id ON public.images(user_id);

-- 4) Tighten RLS policies for tier_lists
DROP POLICY IF EXISTS "Authenticated users can create tier lists" ON public.tier_lists;
DROP POLICY IF EXISTS "Authenticated users can update tier lists" ON public.tier_lists;
DROP POLICY IF EXISTS "Authenticated users can view tier lists" ON public.tier_lists;

CREATE POLICY "Users can create own tier lists"
ON public.tier_lists
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tier lists or admins"
ON public.tier_lists
FOR UPDATE
TO authenticated
USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own tier lists or admins"
ON public.tier_lists
FOR SELECT
TO authenticated
USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can delete own tier lists or admins"
ON public.tier_lists
FOR DELETE
TO authenticated
USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role));

-- 5) Tighten RLS policies for venn_diagrams
DROP POLICY IF EXISTS "Authenticated users can create venn diagrams" ON public.venn_diagrams;
DROP POLICY IF EXISTS "Authenticated users can update venn diagrams" ON public.venn_diagrams;
DROP POLICY IF EXISTS "Authenticated users can view venn diagrams" ON public.venn_diagrams;

CREATE POLICY "Users can create own venn diagrams"
ON public.venn_diagrams
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own venn diagrams or admins"
ON public.venn_diagrams
FOR UPDATE
TO authenticated
USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own venn diagrams or admins"
ON public.venn_diagrams
FOR SELECT
TO authenticated
USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can delete own venn diagrams or admins"
ON public.venn_diagrams
FOR DELETE
TO authenticated
USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role));

-- 6) Tighten RLS policies for ratings
DROP POLICY IF EXISTS "Authenticated users can create ratings" ON public.ratings;
DROP POLICY IF EXISTS "Authenticated users can update ratings" ON public.ratings;
DROP POLICY IF EXISTS "Authenticated users can view ratings" ON public.ratings;

CREATE POLICY "Users can create own ratings"
ON public.ratings
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings or admins"
ON public.ratings
FOR UPDATE
TO authenticated
USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own ratings or admins"
ON public.ratings
FOR SELECT
TO authenticated
USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can delete own ratings or admins"
ON public.ratings
FOR DELETE
TO authenticated
USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role));

-- 7) Improve image ownership controls while keeping authenticated read access
DROP POLICY IF EXISTS "Authenticated users can upload images" ON public.images;
DROP POLICY IF EXISTS "Authenticated users can view images" ON public.images;
DROP POLICY IF EXISTS "Admins can delete images" ON public.images;

CREATE POLICY "Authenticated users can upload own images"
ON public.images
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view images"
ON public.images
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own images or admins"
ON public.images
FOR UPDATE
TO authenticated
USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can delete own images or admins"
ON public.images
FOR DELETE
TO authenticated
USING ((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role));

-- 8) Enforce approved-admin bootstrap and future admin auto-approval
UPDATE public.profiles p
SET is_approved = true
WHERE EXISTS (
  SELECT 1
  FROM public.user_roles ur
  WHERE ur.user_id = p.user_id
    AND ur.role = 'admin'::app_role
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, username, is_approved)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'username',
    CASE
      WHEN NEW.raw_user_meta_data ->> 'username' = 'lmaomaidah' THEN true
      ELSE false
    END
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