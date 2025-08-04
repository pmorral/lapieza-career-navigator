-- Create table for CV optimization history
CREATE TABLE public.cv_optimizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  original_filename TEXT NOT NULL,
  optimized_content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cv_optimizations ENABLE ROW LEVEL SECURITY;

-- Create policies for CV optimizations
CREATE POLICY "Users can view their own CV optimizations" 
ON public.cv_optimizations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own CV optimizations" 
ON public.cv_optimizations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own CV optimizations" 
ON public.cv_optimizations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create table for LinkedIn optimization history
CREATE TABLE public.linkedin_optimizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  personal_cv_filename TEXT NOT NULL,
  linkedin_cv_filename TEXT,
  optimized_content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.linkedin_optimizations ENABLE ROW LEVEL SECURITY;

-- Create policies for LinkedIn optimizations
CREATE POLICY "Users can view their own LinkedIn optimizations" 
ON public.linkedin_optimizations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own LinkedIn optimizations" 
ON public.linkedin_optimizations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own LinkedIn optimizations" 
ON public.linkedin_optimizations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_cv_optimizations_updated_at
BEFORE UPDATE ON public.cv_optimizations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_linkedin_optimizations_updated_at
BEFORE UPDATE ON public.linkedin_optimizations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();