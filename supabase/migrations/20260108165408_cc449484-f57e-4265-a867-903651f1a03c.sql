-- Allow collaborators (form_editors) to SELECT draft forms and their questions/options

-- FORMS: update SELECT policy to include editors
DROP POLICY IF EXISTS "Anyone can view published forms" ON public.forms;
CREATE POLICY "Anyone can view published forms"
ON public.forms
FOR SELECT
USING (
  (is_published = true)
  OR (auth.uid() = creator_id)
  OR has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1
    FROM public.form_editors fe
    WHERE fe.form_id = forms.id
      AND fe.user_id = auth.uid()
  )
);

-- FORM_QUESTIONS: update SELECT policy to include editors
DROP POLICY IF EXISTS "Anyone can view questions of accessible forms" ON public.form_questions;
CREATE POLICY "Anyone can view questions of accessible forms"
ON public.form_questions
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.forms f
    WHERE f.id = form_questions.form_id
      AND (
        (f.is_published = true)
        OR (f.creator_id = auth.uid())
        OR has_role(auth.uid(), 'admin'::app_role)
        OR EXISTS (
          SELECT 1
          FROM public.form_editors fe
          WHERE fe.form_id = f.id
            AND fe.user_id = auth.uid()
        )
      )
  )
);

-- FORM_OPTIONS: update SELECT policy to include editors
DROP POLICY IF EXISTS "Anyone can view options of accessible questions" ON public.form_options;
CREATE POLICY "Anyone can view options of accessible questions"
ON public.form_options
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.form_questions q
    JOIN public.forms f ON f.id = q.form_id
    WHERE q.id = form_options.question_id
      AND (
        (f.is_published = true)
        OR (f.creator_id = auth.uid())
        OR has_role(auth.uid(), 'admin'::app_role)
        OR EXISTS (
          SELECT 1
          FROM public.form_editors fe
          WHERE fe.form_id = f.id
            AND fe.user_id = auth.uid()
        )
      )
  )
);