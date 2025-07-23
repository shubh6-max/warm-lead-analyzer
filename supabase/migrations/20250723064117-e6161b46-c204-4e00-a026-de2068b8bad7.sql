-- Create final_combined_stakeholder_responses table with joined data
CREATE TABLE public.final_combined_stakeholder_responses AS
SELECT 
    l.sdr_name,
    l.company_name,
    l.target_lead_name,
    l.target_lead_title,
    l.target_lead_linkedin_url,
    l.leadership_name,
    sr.relationship_score,
    sr.comment
FROM public.leads_with_status l
INNER JOIN public.stakeholder_responses sr ON l.lead_id = sr.lead_id;

-- Enable RLS on the new table
ALTER TABLE public.final_combined_stakeholder_responses ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations
CREATE POLICY "Allow all operations on final_combined_stakeholder_responses" 
ON public.final_combined_stakeholder_responses 
FOR ALL 
USING (true) 
WITH CHECK (true);