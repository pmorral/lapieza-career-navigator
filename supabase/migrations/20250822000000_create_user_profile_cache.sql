-- Create table for caching user profile information
CREATE TABLE public.user_profile_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  linkedin_url TEXT,
  linkedin_profile_data JSONB,
  cv_analysis_data JSONB,
  last_linkedin_scrape TIMESTAMP WITH TIME ZONE,
  last_cv_analysis TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique index to ensure one cache record per user
CREATE UNIQUE INDEX user_profile_cache_user_id_idx ON public.user_profile_cache(user_id);

-- Enable RLS
ALTER TABLE public.user_profile_cache ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own profile cache" 
ON public.user_profile_cache 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile cache" 
ON public.user_profile_cache 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile cache" 
ON public.user_profile_cache 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile cache" 
ON public.user_profile_cache 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_profile_cache_updated_at
BEFORE UPDATE ON public.user_profile_cache
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add linkedin_url column to linkedin_optimizations table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'linkedin_optimizations' 
        AND column_name = 'linkedin_url'
    ) THEN
        ALTER TABLE public.linkedin_optimizations ADD COLUMN linkedin_url TEXT;
    END IF;
END $$;
