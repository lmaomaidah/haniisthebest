-- Categories table
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT categories_name_length CHECK (char_length(name) BETWEEN 1 AND 60),
  CONSTRAINT categories_name_unique UNIQUE (name)
);

-- Junction table for many-to-many
CREATE TABLE public.image_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_id uuid NOT NULL REFERENCES public.images(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (image_id, category_id)
);

-- RLS on categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view categories"
  ON public.categories FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create categories"
  ON public.categories FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Admins can update categories"
  ON public.categories FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete categories"
  ON public.categories FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS on image_categories
ALTER TABLE public.image_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view image categories"
  ON public.image_categories FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can assign categories"
  ON public.image_categories FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can remove category assignments"
  ON public.image_categories FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR auth.uid() IS NOT NULL);