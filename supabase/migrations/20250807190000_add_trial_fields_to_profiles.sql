-- Add trial-related fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN whatsapp TEXT,
ADD COLUMN is_new_user BOOLEAN DEFAULT true,
ADD COLUMN trial_interview_used BOOLEAN DEFAULT false,
ADD COLUMN trial_interview_date TIMESTAMP WITH TIME ZONE;

-- Add index for WhatsApp lookup
CREATE INDEX idx_profiles_whatsapp ON public.profiles(whatsapp);

-- Add index for trial interview lookup
CREATE INDEX idx_profiles_trial_interview ON public.profiles(trial_interview_used, is_new_user);

-- Add comment to explain the new fields
COMMENT ON COLUMN public.profiles.whatsapp IS 'WhatsApp number for trial interview verification';
COMMENT ON COLUMN public.profiles.is_new_user IS 'Indicates if this is a new user (for trial interviews)';
COMMENT ON COLUMN public.profiles.trial_interview_used IS 'Indicates if the user has already used their trial interview';
COMMENT ON COLUMN public.profiles.trial_interview_date IS 'Date when the trial interview was used'; 