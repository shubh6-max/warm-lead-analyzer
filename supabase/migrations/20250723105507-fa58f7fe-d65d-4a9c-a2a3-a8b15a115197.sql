-- Drop the existing static table
DROP TABLE public.final_combined_stakeholder_responses;

-- Create a view that automatically updates with new responses
CREATE VIEW public.final_combined_stakeholder_responses AS
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