-- Create verification_codes table
CREATE TABLE IF NOT EXISTS verification_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'trial_interview',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_verification_codes_email_type ON verification_codes(email, type);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires ON verification_codes(expires_at);

-- Add RLS policies
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (you can restrict this later if needed)
CREATE POLICY "Allow all operations on verification_codes" ON verification_codes
  FOR ALL USING (true);
