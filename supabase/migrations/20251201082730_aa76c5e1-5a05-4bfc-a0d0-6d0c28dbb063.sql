-- Make image_url nullable to allow text-only classmates
ALTER TABLE public.images 
ALTER COLUMN image_url DROP NOT NULL;

-- Create table for venn diagram configurations
CREATE TABLE public.venn_diagrams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  name TEXT NOT NULL DEFAULT 'My Venn Diagram',
  circles JSONB NOT NULL DEFAULT '[]'::jsonb,
  placements JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.venn_diagrams ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Anyone can view venn diagrams" 
ON public.venn_diagrams 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create venn diagrams" 
ON public.venn_diagrams 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update venn diagrams" 
ON public.venn_diagrams 
FOR UPDATE 
USING (true);