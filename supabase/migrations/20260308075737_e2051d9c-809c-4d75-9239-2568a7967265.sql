
-- Comments table with replies support
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT comments_body_length CHECK (char_length(body) <= 2000),
  CONSTRAINT comments_content_type_check CHECK (content_type IN ('tier_list', 'rating', 'ship', 'poll', 'pin'))
);

-- Add foreign key to profiles
ALTER TABLE public.comments
  ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add is_public to tier_lists
ALTER TABLE public.tier_lists ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT false;

-- Add is_public to venn_diagrams (ships)
ALTER TABLE public.venn_diagrams ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT false;

-- Enable RLS on comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view comments on public content
CREATE POLICY "Authenticated users can view comments"
  ON public.comments FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert their own comments
CREATE POLICY "Users can insert own comments"
  ON public.comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
  ON public.comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- Users can delete their own comments or admins
CREATE POLICY "Users can delete own comments or admins"
  ON public.comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- Update tier_lists RLS to allow viewing public lists
DROP POLICY IF EXISTS "Users can view own tier lists or admins" ON public.tier_lists;
CREATE POLICY "Users can view own or public tier lists"
  ON public.tier_lists FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role) OR is_public = true);

-- Update venn_diagrams RLS to allow viewing public diagrams
DROP POLICY IF EXISTS "Users can view own venn diagrams or admins" ON public.venn_diagrams;
CREATE POLICY "Users can view own or public venn diagrams"
  ON public.venn_diagrams FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role) OR is_public = true);

-- Enable realtime for comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;

-- Index for fast comment lookups
CREATE INDEX idx_comments_content ON public.comments(content_type, content_id);
CREATE INDEX idx_comments_parent ON public.comments(parent_id);
