-- Revert to using stakeholder_responses table for multiple stakeholders per lead

-- Remove Score and Comment columns from leads_with_status since we'll use stakeholder_responses
ALTER TABLE public.leads_with_status 
DROP COLUMN IF EXISTS "Score",
DROP COLUMN IF EXISTS "Comment";

-- Ensure stakeholder_responses table exists with proper structure
CREATE TABLE IF NOT EXISTS public.stakeholder_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id BIGINT NOT NULL,
  stakeholder_email TEXT NOT NULL,
  relationship_score INTEGER,
  comment TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(lead_id, stakeholder_email)
);

-- Enable RLS on stakeholder_responses
ALTER TABLE public.stakeholder_responses ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (since no auth is implemented yet)
DROP POLICY IF EXISTS "Allow all operations on stakeholder_responses" ON public.stakeholder_responses;
CREATE POLICY "Allow all operations on stakeholder_responses" 
ON public.stakeholder_responses 
FOR ALL 
USING (true) 
WITH CHECK (true);