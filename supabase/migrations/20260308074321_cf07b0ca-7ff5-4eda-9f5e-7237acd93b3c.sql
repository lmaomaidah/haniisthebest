
-- Drop the admin-only update policy and replace with one allowing the creator or admins
DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;
CREATE POLICY "Creator or admins can update categories"
  ON public.categories
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by OR has_role(auth.uid(), 'admin'::app_role));

-- Allow creator or admins to delete categories
DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;
CREATE POLICY "Creator or admins can delete categories"
  ON public.categories
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by OR has_role(auth.uid(), 'admin'::app_role));
