-- Create storage bucket for CV templates
INSERT INTO storage.buckets (id, name, public) VALUES ('cv-templates', 'cv-templates', true);

-- Create policies for CV templates bucket
CREATE POLICY "CV templates are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'cv-templates');

CREATE POLICY "Admin can upload CV templates" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'cv-templates');