-- Enable RLS on the new combined table
ALTER TABLE public.lead_stakeholder_combined ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (since no auth is implemented)
CREATE POLICY "Allow all operations on lead_stakeholder_combined" 
ON public.lead_stakeholder_combined 
FOR ALL 
USING (true) 
WITH CHECK (true);