-- Add form_url column with computed value
ALTER TABLE public.leads_with_status 
ADD COLUMN form_url text GENERATED ALWAYS AS ('https://exec-to-exec-outreach.vercel.app/?email=' || leadership_contact_email) STORED;

-- Add email_status column with default value
ALTER TABLE public.leads_with_status 
ADD COLUMN email_status text DEFAULT 'not sent';