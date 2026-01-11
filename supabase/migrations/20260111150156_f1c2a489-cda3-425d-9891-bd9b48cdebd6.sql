-- Add invite_token column to forms table for invite-by-link functionality
ALTER TABLE public.forms ADD COLUMN IF NOT EXISTS invite_token uuid DEFAULT gen_random_uuid();
ALTER TABLE public.forms ADD COLUMN IF NOT EXISTS invite_enabled boolean DEFAULT false;

-- Create index for faster invite token lookups
CREATE INDEX IF NOT EXISTS idx_forms_invite_token ON public.forms(invite_token);

-- Create a security definer function to check if user is form creator
-- This prevents infinite recursion in RLS policies
CREATE OR REPLACE FUNCTION public.is_form_creator(_form_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.forms
    WHERE id = _form_id
      AND creator_id = _user_id
  )
$$;

-- Create a security definer function to check if user is form editor
CREATE OR REPLACE FUNCTION public.is_form_editor(_form_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.form_editors
    WHERE form_id = _form_id
      AND user_id = _user_id
  )
$$;

-- Drop existing problematic policies on form_editors
DROP POLICY IF EXISTS "Editors can view their assignments" ON public.form_editors;
DROP POLICY IF EXISTS "Form creators can manage editors" ON public.form_editors;

-- Recreate policies using security definer functions to avoid recursion
CREATE POLICY "Editors can view their editor assignments"
ON public.form_editors
FOR SELECT
USING (user_id = auth.uid() OR is_form_creator(form_id, auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Form creators can insert editors"
ON public.form_editors
FOR INSERT
WITH CHECK (is_form_creator(form_id, auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Form creators can delete editors"
ON public.form_editors
FOR DELETE
USING (is_form_creator(form_id, auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));