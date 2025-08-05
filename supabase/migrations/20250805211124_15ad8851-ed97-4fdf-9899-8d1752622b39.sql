-- Create coupons table for managing promotional codes
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'free')),
  discount_value NUMERIC,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create coupon_uses table to track who used which coupon
CREATE TABLE public.coupon_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(coupon_id, user_id)
);

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_uses ENABLE ROW LEVEL SECURITY;

-- Policies for coupons (publicly readable for validation)
CREATE POLICY "Coupons are publicly readable" 
ON public.coupons 
FOR SELECT 
USING (true);

-- Policies for coupon_uses (users can view their own usage)
CREATE POLICY "Users can view their own coupon usage" 
ON public.coupon_uses 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Insert coupon usage" 
ON public.coupon_uses 
FOR INSERT 
WITH CHECK (true);

-- Insert the ACADEMY_100 coupon
INSERT INTO public.coupons (code, discount_type, discount_value, max_uses, description)
VALUES ('ACADEMY_100', 'free', 0, 1000, 'Free access coupon for Academy users');

-- Add trigger for updated_at
CREATE TRIGGER update_coupons_updated_at
BEFORE UPDATE ON public.coupons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();