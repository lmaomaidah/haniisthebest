-- Allow users to update their own pins (for reordering)
DROP POLICY IF EXISTS "Admins can update pins" ON public.pinterest_pins;
CREATE POLICY "Users can update own pins or admins can update any"
ON public.pinterest_pins
FOR UPDATE
USING ((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));