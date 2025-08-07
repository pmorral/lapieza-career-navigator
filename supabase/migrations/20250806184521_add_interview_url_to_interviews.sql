-- Add interview_url column to interviews table
ALTER TABLE interviews 
ADD COLUMN IF NOT EXISTS interview_url TEXT;

-- Add comment to document the field
COMMENT ON COLUMN interviews.interview_url IS 'URL of the completed interview from LaPieza API'; 