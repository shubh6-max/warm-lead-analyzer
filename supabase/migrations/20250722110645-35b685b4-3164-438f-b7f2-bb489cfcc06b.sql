-- Create stakeholder_responses table
CREATE TABLE public.stakeholder_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id BIGINT NOT NULL,
  stakeholder_email TEXT NOT NULL,
  relationship_score INTEGER NOT NULL CHECK (relationship_score >= 1 AND relationship_score <= 5),
  comment TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(lead_id, stakeholder_email)
);

-- Enable RLS
ALTER TABLE public.stakeholder_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for stakeholder responses
CREATE POLICY "Stakeholders can view their own responses" 
ON public.stakeholder_responses 
FOR SELECT 
USING (true);

CREATE POLICY "Stakeholders can insert their own responses" 
ON public.stakeholder_responses 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Stakeholders can update their own responses" 
ON public.stakeholder_responses 
FOR UPDATE 
USING (true);