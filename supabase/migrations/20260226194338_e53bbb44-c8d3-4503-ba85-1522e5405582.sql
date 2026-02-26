
-- Create pinterest_pins table to store Pinterest links per person
CREATE TABLE public.pinterest_pins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_id UUID NOT NULL REFERENCES public.images(id) ON DELETE CASCADE,
  pin_url TEXT NOT NULL,
  pin_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pinterest_pins ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view pins
CREATE POLICY "Authenticated users can view pins"
ON public.pinterest_pins FOR SELECT TO authenticated
USING (true);

-- Anyone authenticated can add pins
CREATE POLICY "Authenticated users can add pins"
ON public.pinterest_pins FOR INSERT TO authenticated
WITH CHECK (true);

-- Admins can delete pins
CREATE POLICY "Admins can delete pins"
ON public.pinterest_pins FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update pins (for reordering)
CREATE POLICY "Admins can update pins"
ON public.pinterest_pins FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add bio column to images table
ALTER TABLE public.images ADD COLUMN IF NOT EXISTS bio TEXT;
