-- Drop the dynamic email columns and add simple Score/Comment columns
ALTER TABLE public.leads_with_status 
DROP COLUMN IF EXISTS "ambar.mittal@mathco.com_Score",
DROP COLUMN IF EXISTS "ambar.mittal@mathco.com_Comment";

-- Add new simple Score and Comment columns
ALTER TABLE public.leads_with_status 
ADD COLUMN IF NOT EXISTS "Score" INTEGER,
ADD COLUMN IF NOT EXISTS "Comment" TEXT;