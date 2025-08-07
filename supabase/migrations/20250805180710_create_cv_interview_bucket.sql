-- Create cv-interview bucket for storing CV files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'cv-interview',
  'cv-interview',
  false,
  2097152, -- 2MB limit
  ARRAY['application/pdf']
) ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads to cv-interview" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'cv-interview' 
  AND auth.role() = 'authenticated'
);

-- Create policy to allow service role to manage files
CREATE POLICY "Allow service role full access to cv-interview" ON storage.objects
FOR ALL USING (
  bucket_id = 'cv-interview' 
  AND auth.role() = 'service_role'
);

-- Create policy to allow service role to read files (for generating signed URLs)
CREATE POLICY "Allow service role to read cv-interview files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'cv-interview' 
  AND auth.role() = 'service_role'
); 