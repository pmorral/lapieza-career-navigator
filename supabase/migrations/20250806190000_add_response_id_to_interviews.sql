-- Add a reference column to interviews table to link to the response
ALTER TABLE interviews 
ADD COLUMN IF NOT EXISTS response_id UUID REFERENCES interview_responses(id);

-- Create index for the foreign key
CREATE INDEX IF NOT EXISTS idx_interviews_response_id ON interviews(response_id);

-- Add comment to document the field
COMMENT ON COLUMN interviews.response_id IS 'Reference to the complete interview response data'; 