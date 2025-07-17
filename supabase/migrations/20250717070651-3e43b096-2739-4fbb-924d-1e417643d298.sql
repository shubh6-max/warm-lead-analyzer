-- Create a comprehensive reporting view that joins leads and responses
DROP VIEW IF EXISTS public.lead_responses_view;

CREATE OR REPLACE VIEW public.lead_responses_complete AS
SELECT 
  -- Lead information
  l.id as lead_id,
  l."Target Lead Name" as target_lead_name,
  l."Company Name" as company_name,
  l."Target Lead Title" as target_lead_title,
  l."Target Lead Linkedin URL" as target_lead_linkedin_url,
  l."Leadership contact email" as leadership_contact_email,
  l."Status" as lead_status,
  l."SDR Name" as sdr_name,
  l."Relationship Strength" as relationship_strength,
  l."Confirmation Status" as confirmation_status,
  l."Last_Updated" as lead_last_updated,
  
  -- Response information
  r.id as response_id,
  r.stakeholder_email,
  r.relationship_score,
  r.comment as stakeholder_comment,
  r.submitted_at as response_submitted_at,
  
  -- Calculated fields
  CASE 
    WHEN r.id IS NOT NULL THEN 'Completed'
    ELSE 'Pending'
  END as response_status,
  
  -- Response quality indicator
  CASE 
    WHEN r.relationship_score >= 8 THEN 'Strong'
    WHEN r.relationship_score >= 5 THEN 'Medium' 
    WHEN r.relationship_score >= 1 THEN 'Weak'
    ELSE 'No Response'
  END as relationship_category

FROM public.leads_with_status l
LEFT JOIN public.stakeholder_responses r ON l.id = r.lead_id
ORDER BY l.id, r.submitted_at DESC;

-- Create a materialized view for better performance on large datasets
CREATE MATERIALIZED VIEW public.lead_responses_summary AS
SELECT 
  l.id as lead_id,
  l."Target Lead Name" as target_lead_name,
  l."Company Name" as company_name,
  l."Target Lead Title" as target_lead_title,
  l."Leadership contact email" as leadership_contact_email,
  l."Status" as lead_status,
  l."SDR Name" as sdr_name,
  
  -- Aggregated response data
  COUNT(r.id) as total_responses,
  AVG(r.relationship_score) as average_score,
  MAX(r.relationship_score) as highest_score,
  MIN(r.relationship_score) as lowest_score,
  
  -- Latest response info
  (SELECT relationship_score FROM public.stakeholder_responses 
   WHERE lead_id = l.id ORDER BY submitted_at DESC LIMIT 1) as latest_score,
  (SELECT comment FROM public.stakeholder_responses 
   WHERE lead_id = l.id ORDER BY submitted_at DESC LIMIT 1) as latest_comment,
  (SELECT stakeholder_email FROM public.stakeholder_responses 
   WHERE lead_id = l.id ORDER BY submitted_at DESC LIMIT 1) as latest_respondent,
  (SELECT submitted_at FROM public.stakeholder_responses 
   WHERE lead_id = l.id ORDER BY submitted_at DESC LIMIT 1) as latest_response_date,
   
  -- Response status summary
  CASE 
    WHEN COUNT(r.id) = 0 THEN 'No Responses'
    WHEN AVG(r.relationship_score) >= 8 THEN 'Strong Relationships'
    WHEN AVG(r.relationship_score) >= 5 THEN 'Medium Relationships'
    ELSE 'Weak Relationships'
  END as relationship_summary,
  
  l."Last_Updated" as lead_last_updated

FROM public.leads_with_status l
LEFT JOIN public.stakeholder_responses r ON l.id = r.lead_id
GROUP BY l.id, l."Target Lead Name", l."Company Name", l."Target Lead Title", 
         l."Leadership contact email", l."Status", l."SDR Name", l."Last_Updated"
ORDER BY l.id;

-- Create indexes on the materialized view for better query performance
CREATE INDEX idx_lead_responses_summary_lead_id ON public.lead_responses_summary(lead_id);
CREATE INDEX idx_lead_responses_summary_company ON public.lead_responses_summary(company_name);
CREATE INDEX idx_lead_responses_summary_status ON public.lead_responses_summary(lead_status);
CREATE INDEX idx_lead_responses_summary_avg_score ON public.lead_responses_summary(average_score);

-- Function to refresh the materialized view
CREATE OR REPLACE FUNCTION public.refresh_lead_responses_summary()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.lead_responses_summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get all data for a specific lead
CREATE OR REPLACE FUNCTION public.get_lead_complete_info(p_lead_id BIGINT)
RETURNS TABLE (
  lead_id BIGINT,
  target_lead_name TEXT,
  company_name TEXT,
  target_lead_title TEXT,
  target_lead_linkedin_url TEXT,
  leadership_contact_email TEXT,
  lead_status TEXT,
  sdr_name TEXT,
  relationship_strength TEXT,
  response_id UUID,
  stakeholder_email TEXT,
  relationship_score INTEGER,
  stakeholder_comment TEXT,
  response_submitted_at TIMESTAMPTZ,
  response_status TEXT,
  relationship_category TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.lead_responses_complete
  WHERE lead_responses_complete.lead_id = p_lead_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;