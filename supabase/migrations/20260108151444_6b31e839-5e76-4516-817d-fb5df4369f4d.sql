-- Drop existing update/delete policies on forms
DROP POLICY IF EXISTS "Creators and admins can update forms" ON public.forms;
DROP POLICY IF EXISTS "Creators and admins can delete forms" ON public.forms;

-- Create new policies that include editors
CREATE POLICY "Creators, editors and admins can update forms" 
ON public.forms 
FOR UPDATE 
USING (
  (auth.uid() = creator_id) 
  OR has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM form_editors fe 
    WHERE fe.form_id = forms.id AND fe.user_id = auth.uid()
  )
);

CREATE POLICY "Creators and admins can delete forms" 
ON public.forms 
FOR DELETE 
USING ((auth.uid() = creator_id) OR has_role(auth.uid(), 'admin'::app_role));

-- Drop existing policies on form_questions
DROP POLICY IF EXISTS "Form creators can manage questions" ON public.form_questions;
DROP POLICY IF EXISTS "Form creators can update questions" ON public.form_questions;
DROP POLICY IF EXISTS "Form creators can delete questions" ON public.form_questions;

-- Create new policies that include editors for form_questions
CREATE POLICY "Form creators and editors can manage questions" 
ON public.form_questions 
FOR INSERT 
WITH CHECK (EXISTS ( SELECT 1
   FROM forms f
  WHERE ((f.id = form_questions.form_id) AND ((f.creator_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR EXISTS (
    SELECT 1 FROM form_editors fe WHERE fe.form_id = f.id AND fe.user_id = auth.uid()
  )))));

CREATE POLICY "Form creators and editors can update questions" 
ON public.form_questions 
FOR UPDATE 
USING (EXISTS ( SELECT 1
   FROM forms f
  WHERE ((f.id = form_questions.form_id) AND ((f.creator_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR EXISTS (
    SELECT 1 FROM form_editors fe WHERE fe.form_id = f.id AND fe.user_id = auth.uid()
  )))));

CREATE POLICY "Form creators and editors can delete questions" 
ON public.form_questions 
FOR DELETE 
USING (EXISTS ( SELECT 1
   FROM forms f
  WHERE ((f.id = form_questions.form_id) AND ((f.creator_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR EXISTS (
    SELECT 1 FROM form_editors fe WHERE fe.form_id = f.id AND fe.user_id = auth.uid()
  )))));

-- Drop existing policies on form_options
DROP POLICY IF EXISTS "Form creators can manage options" ON public.form_options;
DROP POLICY IF EXISTS "Form creators can update options" ON public.form_options;
DROP POLICY IF EXISTS "Form creators can delete options" ON public.form_options;

-- Create new policies that include editors for form_options
CREATE POLICY "Form creators and editors can manage options" 
ON public.form_options 
FOR INSERT 
WITH CHECK (EXISTS ( SELECT 1
   FROM (form_questions q JOIN forms f ON ((f.id = q.form_id)))
  WHERE ((q.id = form_options.question_id) AND ((f.creator_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR EXISTS (
    SELECT 1 FROM form_editors fe WHERE fe.form_id = f.id AND fe.user_id = auth.uid()
  )))));

CREATE POLICY "Form creators and editors can update options" 
ON public.form_options 
FOR UPDATE 
USING (EXISTS ( SELECT 1
   FROM (form_questions q JOIN forms f ON ((f.id = q.form_id)))
  WHERE ((q.id = form_options.question_id) AND ((f.creator_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR EXISTS (
    SELECT 1 FROM form_editors fe WHERE fe.form_id = f.id AND fe.user_id = auth.uid()
  )))));

CREATE POLICY "Form creators and editors can delete options" 
ON public.form_options 
FOR DELETE 
USING (EXISTS ( SELECT 1
   FROM (form_questions q JOIN forms f ON ((f.id = q.form_id)))
  WHERE ((q.id = form_options.question_id) AND ((f.creator_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR EXISTS (
    SELECT 1 FROM form_editors fe WHERE fe.form_id = f.id AND fe.user_id = auth.uid()
  )))));