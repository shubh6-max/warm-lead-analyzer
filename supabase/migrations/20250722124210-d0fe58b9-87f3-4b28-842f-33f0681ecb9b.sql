-- Enable RLS on leads_with_status table
ALTER TABLE public.leads_with_status ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (since no auth is implemented)
CREATE POLICY "Allow all operations on leads_with_status" 
ON public.leads_with_status 
FOR ALL 
USING (true) 
WITH CHECK (true);