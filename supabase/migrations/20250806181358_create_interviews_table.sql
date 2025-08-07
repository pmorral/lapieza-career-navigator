-- Create interviews table to store AI interview requests
CREATE TABLE IF NOT EXISTS interviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  interview_request_id TEXT NOT NULL,
  task_id TEXT NOT NULL,
  candidate_id TEXT NOT NULL,
  interview_id TEXT NOT NULL,
  job_title TEXT NOT NULL,
  job_description TEXT NOT NULL,
  fullname TEXT NOT NULL,
  email TEXT NOT NULL,
  language TEXT NOT NULL,
  cv_filename TEXT NOT NULL,
  cv_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'creating',
  api_message TEXT,
  source TEXT DEFAULT 'academy',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);
CREATE INDEX IF NOT EXISTS idx_interviews_created_at ON interviews(created_at);

-- Create RLS policies
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to see only their own interviews
CREATE POLICY "Users can view their own interviews" ON interviews
  FOR SELECT USING (auth.uid() = user_id);

-- Policy to allow service role to insert interviews
CREATE POLICY "Service role can insert interviews" ON interviews
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Policy to allow service role to update interviews
CREATE POLICY "Service role can update interviews" ON interviews
  FOR UPDATE USING (auth.role() = 'service_role');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_interviews_updated_at 
  BEFORE UPDATE ON interviews 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column(); 