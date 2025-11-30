-- Create storage bucket for classmate images
INSERT INTO storage.buckets (id, name, public)
VALUES ('classmate-images', 'classmate-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create images table
CREATE TABLE IF NOT EXISTS public.images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no auth required for now)
CREATE POLICY "Anyone can view images"
  ON public.images
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can upload images"
  ON public.images
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can delete images"
  ON public.images
  FOR DELETE
  USING (true);

-- Create tier_lists table
CREATE TABLE IF NOT EXISTS public.tier_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'My Tier List',
  tiers JSONB NOT NULL DEFAULT '{"S":[],"A":[],"B":[],"C":[],"D":[]}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tier_lists ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Anyone can view tier lists"
  ON public.tier_lists
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create tier lists"
  ON public.tier_lists
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update tier lists"
  ON public.tier_lists
  FOR UPDATE
  USING (true);

-- Create ratings table
CREATE TABLE IF NOT EXISTS public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_id UUID REFERENCES public.images(id) ON DELETE CASCADE,
  sex_appeal INTEGER CHECK (sex_appeal >= 0 AND sex_appeal <= 10),
  character_design INTEGER CHECK (character_design >= 0 AND character_design <= 10),
  iq INTEGER CHECK (iq >= 0 AND iq <= 10),
  eq INTEGER CHECK (eq >= 0 AND eq <= 10),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Anyone can view ratings"
  ON public.ratings
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create ratings"
  ON public.ratings
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update ratings"
  ON public.ratings
  FOR UPDATE
  USING (true);

-- Create storage policies for classmate-images bucket
CREATE POLICY "Anyone can upload images to classmate-images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'classmate-images');

CREATE POLICY "Anyone can view images in classmate-images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'classmate-images');

CREATE POLICY "Anyone can delete images from classmate-images"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'classmate-images');

-- Create function to calculate total score
CREATE OR REPLACE FUNCTION calculate_total_score(
  p_sex_appeal INTEGER,
  p_character_design INTEGER,
  p_iq INTEGER,
  p_eq INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN COALESCE(p_sex_appeal, 0) + 
         COALESCE(p_character_design, 0) + 
         COALESCE(p_iq, 0) + 
         COALESCE(p_eq, 0);
END;
$$;