
-- ==============================
-- 1. Add is_approved column to profiles (admin approval system)
-- ==============================
ALTER TABLE public.profiles ADD COLUMN is_approved boolean NOT NULL DEFAULT false;

-- Auto-approve admin user (lmaomaidah)
UPDATE public.profiles SET is_approved = true WHERE username = 'lmaomaidah';

-- Create helper function to check approval
CREATE OR REPLACE FUNCTION public.is_approved(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = _user_id
      AND is_approved = true
  )
$$;

-- ==============================
-- 2. Fix permissive RLS on ratings - require authentication
-- ==============================
DROP POLICY IF EXISTS "Anyone can create ratings" ON public.ratings;
DROP POLICY IF EXISTS "Anyone can update ratings" ON public.ratings;
DROP POLICY IF EXISTS "Anyone can view ratings" ON public.ratings;

CREATE POLICY "Authenticated users can view ratings"
ON public.ratings FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create ratings"
ON public.ratings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update ratings"
ON public.ratings FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL);

-- ==============================
-- 3. Fix permissive RLS on tier_lists - require authentication
-- ==============================
DROP POLICY IF EXISTS "Anyone can create tier lists" ON public.tier_lists;
DROP POLICY IF EXISTS "Anyone can update tier lists" ON public.tier_lists;
DROP POLICY IF EXISTS "Anyone can view tier lists" ON public.tier_lists;

CREATE POLICY "Authenticated users can view tier lists"
ON public.tier_lists FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create tier lists"
ON public.tier_lists FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update tier lists"
ON public.tier_lists FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL);

-- ==============================
-- 4. Fix permissive RLS on venn_diagrams - require authentication
-- ==============================
DROP POLICY IF EXISTS "Anyone can create venn diagrams" ON public.venn_diagrams;
DROP POLICY IF EXISTS "Anyone can update venn diagrams" ON public.venn_diagrams;
DROP POLICY IF EXISTS "Anyone can view venn diagrams" ON public.venn_diagrams;

CREATE POLICY "Authenticated users can view venn diagrams"
ON public.venn_diagrams FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create venn diagrams"
ON public.venn_diagrams FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update venn diagrams"
ON public.venn_diagrams FOR UPDATE
TO authenticated
USING (auth.uid() IS NOT NULL);

-- ==============================
-- 5. Fix anonymous access - restrict all policies to authenticated role
-- ==============================

-- pinterest_pins: fix SELECT to require auth
DROP POLICY IF EXISTS "Authenticated users can view pins" ON public.pinterest_pins;
CREATE POLICY "Authenticated users can view pins"
ON public.pinterest_pins FOR SELECT
TO authenticated
USING (true);

-- Fix pinterest_pins other policies to use TO authenticated
DROP POLICY IF EXISTS "Authenticated users can add pins" ON public.pinterest_pins;
CREATE POLICY "Authenticated users can add pins"
ON public.pinterest_pins FOR INSERT
TO authenticated
WITH CHECK ((auth.uid() IS NOT NULL) AND (COALESCE(user_id, auth.uid()) = auth.uid()));

DROP POLICY IF EXISTS "Users can delete own pins or admins can delete any" ON public.pinterest_pins;
CREATE POLICY "Users can delete own pins or admins can delete any"
ON public.pinterest_pins FOR DELETE
TO authenticated
USING ((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can update own pins or admins can update any" ON public.pinterest_pins;
CREATE POLICY "Users can update own pins or admins can update any"
ON public.pinterest_pins FOR UPDATE
TO authenticated
USING ((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

-- images: restrict to authenticated
DROP POLICY IF EXISTS "Authenticated users can view images" ON public.images;
CREATE POLICY "Authenticated users can view images"
ON public.images FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can upload images" ON public.images;
CREATE POLICY "Authenticated users can upload images"
ON public.images FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins can delete images" ON public.images;
CREATE POLICY "Admins can delete images"
ON public.images FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- profiles: restrict to authenticated
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles"
ON public.profiles FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update any profile (needed for approval)
CREATE POLICY "Admins can update any profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- activity_logs: restrict to authenticated
DROP POLICY IF EXISTS "Users can insert their own activity" ON public.activity_logs;
CREATE POLICY "Users can insert their own activity"
ON public.activity_logs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own activity" ON public.activity_logs;
CREATE POLICY "Users can view their own activity"
ON public.activity_logs FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all activity" ON public.activity_logs;
CREATE POLICY "Admins can view all activity"
ON public.activity_logs FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete activity logs" ON public.activity_logs;
CREATE POLICY "Admins can delete activity logs"
ON public.activity_logs FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- user_roles: restrict to authenticated
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
CREATE POLICY "Users can view their own role"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can insert user roles" ON public.user_roles;
CREATE POLICY "Admins can insert user roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can update user roles" ON public.user_roles;
CREATE POLICY "Admins can update user roles"
ON public.user_roles FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins can delete user roles" ON public.user_roles;
CREATE POLICY "Admins can delete user roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- forms: restrict to authenticated
DROP POLICY IF EXISTS "Anyone can view published forms" ON public.forms;
CREATE POLICY "Anyone can view published forms"
ON public.forms FOR SELECT
TO authenticated
USING ((is_published = true) OR (auth.uid() = creator_id) OR has_role(auth.uid(), 'admin'::app_role) OR (EXISTS ( SELECT 1 FROM form_editors fe WHERE ((fe.form_id = forms.id) AND (fe.user_id = auth.uid())))));

DROP POLICY IF EXISTS "Authenticated users can create forms" ON public.forms;
CREATE POLICY "Authenticated users can create forms"
ON public.forms FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Creators and admins can delete forms" ON public.forms;
CREATE POLICY "Creators and admins can delete forms"
ON public.forms FOR DELETE
TO authenticated
USING ((auth.uid() = creator_id) OR has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Creators, editors and admins can update forms" ON public.forms;
CREATE POLICY "Creators, editors and admins can update forms"
ON public.forms FOR UPDATE
TO authenticated
USING ((auth.uid() = creator_id) OR has_role(auth.uid(), 'admin'::app_role) OR (EXISTS ( SELECT 1 FROM form_editors fe WHERE ((fe.form_id = forms.id) AND (fe.user_id = auth.uid())))));

-- form_editors: restrict to authenticated
DROP POLICY IF EXISTS "Editors can view their editor assignments" ON public.form_editors;
CREATE POLICY "Editors can view their editor assignments"
ON public.form_editors FOR SELECT
TO authenticated
USING ((user_id = auth.uid()) OR is_form_creator(form_id, auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Form creators can insert editors" ON public.form_editors;
CREATE POLICY "Form creators can insert editors"
ON public.form_editors FOR INSERT
TO authenticated
WITH CHECK (is_form_creator(form_id, auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Form creators can delete editors" ON public.form_editors;
CREATE POLICY "Form creators can delete editors"
ON public.form_editors FOR DELETE
TO authenticated
USING (is_form_creator(form_id, auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

-- form_questions: restrict to authenticated
DROP POLICY IF EXISTS "Anyone can view questions of accessible forms" ON public.form_questions;
CREATE POLICY "Anyone can view questions of accessible forms"
ON public.form_questions FOR SELECT
TO authenticated
USING ((EXISTS ( SELECT 1 FROM forms f WHERE ((f.id = form_questions.form_id) AND ((f.is_published = true) OR (f.creator_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR (EXISTS ( SELECT 1 FROM form_editors fe WHERE ((fe.form_id = f.id) AND (fe.user_id = auth.uid())))))))));

DROP POLICY IF EXISTS "Form creators and editors can manage questions" ON public.form_questions;
CREATE POLICY "Form creators and editors can manage questions"
ON public.form_questions FOR INSERT
TO authenticated
WITH CHECK ((EXISTS ( SELECT 1 FROM forms f WHERE ((f.id = form_questions.form_id) AND ((f.creator_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR (EXISTS ( SELECT 1 FROM form_editors fe WHERE ((fe.form_id = f.id) AND (fe.user_id = auth.uid())))))))));

DROP POLICY IF EXISTS "Form creators and editors can update questions" ON public.form_questions;
CREATE POLICY "Form creators and editors can update questions"
ON public.form_questions FOR UPDATE
TO authenticated
USING ((EXISTS ( SELECT 1 FROM forms f WHERE ((f.id = form_questions.form_id) AND ((f.creator_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR (EXISTS ( SELECT 1 FROM form_editors fe WHERE ((fe.form_id = f.id) AND (fe.user_id = auth.uid())))))))));

DROP POLICY IF EXISTS "Form creators and editors can delete questions" ON public.form_questions;
CREATE POLICY "Form creators and editors can delete questions"
ON public.form_questions FOR DELETE
TO authenticated
USING ((EXISTS ( SELECT 1 FROM forms f WHERE ((f.id = form_questions.form_id) AND ((f.creator_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR (EXISTS ( SELECT 1 FROM form_editors fe WHERE ((fe.form_id = f.id) AND (fe.user_id = auth.uid())))))))));

-- form_options: restrict to authenticated
DROP POLICY IF EXISTS "Anyone can view options of accessible questions" ON public.form_options;
CREATE POLICY "Anyone can view options of accessible questions"
ON public.form_options FOR SELECT
TO authenticated
USING ((EXISTS ( SELECT 1 FROM (form_questions q JOIN forms f ON ((f.id = q.form_id))) WHERE ((q.id = form_options.question_id) AND ((f.is_published = true) OR (f.creator_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR (EXISTS ( SELECT 1 FROM form_editors fe WHERE ((fe.form_id = f.id) AND (fe.user_id = auth.uid())))))))));

DROP POLICY IF EXISTS "Form creators and editors can manage options" ON public.form_options;
CREATE POLICY "Form creators and editors can manage options"
ON public.form_options FOR INSERT
TO authenticated
WITH CHECK ((EXISTS ( SELECT 1 FROM (form_questions q JOIN forms f ON ((f.id = q.form_id))) WHERE ((q.id = form_options.question_id) AND ((f.creator_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR (EXISTS ( SELECT 1 FROM form_editors fe WHERE ((fe.form_id = f.id) AND (fe.user_id = auth.uid())))))))));

DROP POLICY IF EXISTS "Form creators and editors can update options" ON public.form_options;
CREATE POLICY "Form creators and editors can update options"
ON public.form_options FOR UPDATE
TO authenticated
USING ((EXISTS ( SELECT 1 FROM (form_questions q JOIN forms f ON ((f.id = q.form_id))) WHERE ((q.id = form_options.question_id) AND ((f.creator_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR (EXISTS ( SELECT 1 FROM form_editors fe WHERE ((fe.form_id = f.id) AND (fe.user_id = auth.uid())))))))));

DROP POLICY IF EXISTS "Form creators and editors can delete options" ON public.form_options;
CREATE POLICY "Form creators and editors can delete options"
ON public.form_options FOR DELETE
TO authenticated
USING ((EXISTS ( SELECT 1 FROM (form_questions q JOIN forms f ON ((f.id = q.form_id))) WHERE ((q.id = form_options.question_id) AND ((f.creator_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR (EXISTS ( SELECT 1 FROM form_editors fe WHERE ((fe.form_id = f.id) AND (fe.user_id = auth.uid())))))))));

-- form_responses: restrict to authenticated
DROP POLICY IF EXISTS "Creators and admins can view all responses when revealed" ON public.form_responses;
CREATE POLICY "Creators and admins can view all responses when revealed"
ON public.form_responses FOR SELECT
TO authenticated
USING (((EXISTS ( SELECT 1 FROM (form_questions q JOIN forms f ON ((f.id = q.form_id))) WHERE ((q.id = form_responses.question_id) AND ((f.results_revealed = true) OR (f.creator_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))))) OR (user_id = auth.uid())));

DROP POLICY IF EXISTS "Users can vote on published forms" ON public.form_responses;
CREATE POLICY "Users can vote on published forms"
ON public.form_responses FOR INSERT
TO authenticated
WITH CHECK ((auth.uid() = user_id) AND (EXISTS ( SELECT 1 FROM (form_questions q JOIN forms f ON ((f.id = q.form_id))) WHERE ((q.id = form_responses.question_id) AND (f.is_published = true)))));

-- storage: restrict to authenticated
DROP POLICY IF EXISTS "Authenticated users can view classmate-images" ON storage.objects;
CREATE POLICY "Authenticated users can view classmate-images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'classmate-images');

DROP POLICY IF EXISTS "Admins can delete from classmate-images" ON storage.objects;
CREATE POLICY "Admins can delete from classmate-images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'classmate-images' AND has_role(auth.uid(), 'admin'::app_role));
