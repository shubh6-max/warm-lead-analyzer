-- Create stakeholder_responses table for normalized response storage
CREATE TABLE public.stakeholder_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id BIGINT NOT NULL REFERENCES public.leads_with_status(id) ON DELETE CASCADE,
  stakeholder_email TEXT NOT NULL,
  relationship_score INTEGER CHECK (relationship_score >= 1 AND relationship_score <= 10),
  comment TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one response per stakeholder per lead
  UNIQUE(lead_id, stakeholder_email)
);

-- Enable RLS
ALTER TABLE public.stakeholder_responses ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (same as leads_with_status)
CREATE POLICY "Allow all operations on stakeholder_responses" 
ON public.stakeholder_responses 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_stakeholder_responses_lead_id ON public.stakeholder_responses(lead_id);
CREATE INDEX idx_stakeholder_responses_email ON public.stakeholder_responses(stakeholder_email);
CREATE INDEX idx_stakeholder_responses_submitted_at ON public.stakeholder_responses(submitted_at);

-- Migrate existing data from dynamic columns
INSERT INTO public.stakeholder_responses (lead_id, stakeholder_email, relationship_score, comment)
SELECT 
  id as lead_id,
  'ambar.mittal@mathco.com' as stakeholder_email,
  CASE 
    WHEN "ambar.mittal@mathco.com_Score" ~ '^[0-9]+$' THEN 
      CAST("ambar.mittal@mathco.com_Score" AS INTEGER)
    ELSE NULL
  END as relationship_score,
  "ambar.mittal@mathco.com_Comment" as comment
FROM public.leads_with_status 
WHERE "ambar.mittal@mathco.com_Score" IS NOT NULL 
   OR "ambar.mittal@mathco.com_Comment" IS NOT NULL;

-- Create a view for easy reporting (combines lead data with responses)
CREATE OR REPLACE VIEW public.lead_responses_view AS
SELECT 
  l.id as lead_id,
  l."Target Lead Name" as target_lead_name,
  l."Company Name" as company_name,
  l."Target Lead Title" as target_lead_title,
  l."Target Lead Linkedin URL" as target_lead_url,
  l."Leadership contact email" as leadership_email,
  l."Status" as lead_status,
  l."SDR Name" as sdr_name,
  l."Relationship Strength" as relationship_strength,
  r.stakeholder_email,
  r.relationship_score,
  r.comment as stakeholder_comment,
  r.submitted_at
FROM public.leads_with_status l
LEFT JOIN public.stakeholder_responses r ON l.id = r.lead_id;

-- Function to get responses for a specific stakeholder
CREATE OR REPLACE FUNCTION public.get_leads_for_stakeholder(p_email TEXT)
RETURNS TABLE (
  lead_id BIGINT,
  target_lead_name TEXT,
  company_name TEXT,
  target_lead_title TEXT,
  target_lead_url TEXT,
  leadership_email TEXT,
  lead_status TEXT,
  sdr_name TEXT,
  relationship_strength TEXT,
  existing_score INTEGER,
  existing_comment TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l."Target Lead Name",
    l."Company Name", 
    l."Target Lead Title",
    l."Target Lead Linkedin URL",
    l."Leadership contact email",
    l."Status",
    l."SDR Name",
    l."Relationship Strength",
    r.relationship_score,
    r.comment
  FROM public.leads_with_status l
  LEFT JOIN public.stakeholder_responses r ON l.id = r.lead_id AND r.stakeholder_email = p_email
  WHERE l."Leadership contact email" = p_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;