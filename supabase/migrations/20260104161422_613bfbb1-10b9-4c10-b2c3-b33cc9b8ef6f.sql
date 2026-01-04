
-- Create forms table
CREATE TABLE public.forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Poll',
  description TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  results_revealed BOOLEAN NOT NULL DEFAULT false,
  results_revealed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create form_questions table
CREATE TABLE public.form_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  question_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create form_options table
CREATE TABLE public.form_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.form_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  option_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create form_responses table (votes)
CREATE TABLE public.form_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.form_questions(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES public.form_options(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(question_id, user_id) -- One vote per question per user
);

-- Create form_editors table (collaborators)
CREATE TABLE public.form_editors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(form_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_editors ENABLE ROW LEVEL SECURITY;

-- Forms policies
CREATE POLICY "Anyone can view published forms"
ON public.forms FOR SELECT
USING (is_published = true OR auth.uid() = creator_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can create forms"
ON public.forms FOR INSERT
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators and admins can update forms"
ON public.forms FOR UPDATE
USING (auth.uid() = creator_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Creators and admins can delete forms"
ON public.forms FOR DELETE
USING (auth.uid() = creator_id OR has_role(auth.uid(), 'admin'));

-- Questions policies
CREATE POLICY "Anyone can view questions of accessible forms"
ON public.form_questions FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.forms f 
  WHERE f.id = form_id 
  AND (f.is_published = true OR f.creator_id = auth.uid() OR has_role(auth.uid(), 'admin'))
));

CREATE POLICY "Form creators can manage questions"
ON public.form_questions FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.forms f 
  WHERE f.id = form_id 
  AND (f.creator_id = auth.uid() OR has_role(auth.uid(), 'admin'))
));

CREATE POLICY "Form creators can update questions"
ON public.form_questions FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.forms f 
  WHERE f.id = form_id 
  AND (f.creator_id = auth.uid() OR has_role(auth.uid(), 'admin'))
));

CREATE POLICY "Form creators can delete questions"
ON public.form_questions FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.forms f 
  WHERE f.id = form_id 
  AND (f.creator_id = auth.uid() OR has_role(auth.uid(), 'admin'))
));

-- Options policies
CREATE POLICY "Anyone can view options of accessible questions"
ON public.form_options FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.form_questions q
  JOIN public.forms f ON f.id = q.form_id
  WHERE q.id = question_id 
  AND (f.is_published = true OR f.creator_id = auth.uid() OR has_role(auth.uid(), 'admin'))
));

CREATE POLICY "Form creators can manage options"
ON public.form_options FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.form_questions q
  JOIN public.forms f ON f.id = q.form_id
  WHERE q.id = question_id 
  AND (f.creator_id = auth.uid() OR has_role(auth.uid(), 'admin'))
));

CREATE POLICY "Form creators can update options"
ON public.form_options FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.form_questions q
  JOIN public.forms f ON f.id = q.form_id
  WHERE q.id = question_id 
  AND (f.creator_id = auth.uid() OR has_role(auth.uid(), 'admin'))
));

CREATE POLICY "Form creators can delete options"
ON public.form_options FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.form_questions q
  JOIN public.forms f ON f.id = q.form_id
  WHERE q.id = question_id 
  AND (f.creator_id = auth.uid() OR has_role(auth.uid(), 'admin'))
));

-- Responses policies
CREATE POLICY "Users can vote on published forms"
ON public.form_responses FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND EXISTS (
    SELECT 1 FROM public.form_questions q
    JOIN public.forms f ON f.id = q.form_id
    WHERE q.id = question_id AND f.is_published = true
  )
);

CREATE POLICY "Creators and admins can view all responses when revealed"
ON public.form_responses FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.form_questions q
    JOIN public.forms f ON f.id = q.form_id
    WHERE q.id = question_id 
    AND (
      (f.results_revealed = true)
      OR f.creator_id = auth.uid() 
      OR has_role(auth.uid(), 'admin')
    )
  )
  OR user_id = auth.uid()
);

-- Editors policies
CREATE POLICY "Form creators can manage editors"
ON public.form_editors FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.forms f 
  WHERE f.id = form_id 
  AND (f.creator_id = auth.uid() OR has_role(auth.uid(), 'admin'))
));

CREATE POLICY "Editors can view their assignments"
ON public.form_editors FOR SELECT
USING (user_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_forms_updated_at
BEFORE UPDATE ON public.forms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
