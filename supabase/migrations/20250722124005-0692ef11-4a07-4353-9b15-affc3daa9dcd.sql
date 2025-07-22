-- Update stakeholder_responses table to store text responses instead of numbers
ALTER TABLE public.stakeholder_responses 
DROP CONSTRAINT IF EXISTS stakeholder_responses_relationship_score_check;

ALTER TABLE public.stakeholder_responses 
ALTER COLUMN relationship_score TYPE TEXT;

-- Create a new combined table using both tables
CREATE TABLE public.lead_stakeholder_combined AS
SELECT 
    l.lead_id,
    l.target_lead_name,
    l.company_name,
    l.target_lead_title,
    l.target_lead_linkedin_url,
    l.leadership_contact_email,
    l.leadership_name,
    l.status as lead_status,
    l.sdr_name,
    sr.id as response_id,
    sr.stakeholder_email,
    sr.relationship_score,
    sr.comment as stakeholder_comment,
    sr.submitted_at as response_submitted_at
FROM public.leads_with_status l
LEFT JOIN public.stakeholder_responses sr ON l.lead_id = sr.lead_id;