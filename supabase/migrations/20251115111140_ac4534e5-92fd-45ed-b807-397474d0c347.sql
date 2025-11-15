-- Create table for email verification codes
CREATE TABLE IF NOT EXISTS public.email_verification_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '10 minutes'),
  verified BOOLEAN NOT NULL DEFAULT false
);

-- Enable RLS
ALTER TABLE public.email_verification_codes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert (for signup)
CREATE POLICY "Anyone can create verification codes"
ON public.email_verification_codes
FOR INSERT
WITH CHECK (true);

-- Create policy to allow reading own codes
CREATE POLICY "Users can read their own codes"
ON public.email_verification_codes
FOR SELECT
USING (email = current_setting('request.jwt.claims', true)::json->>'email' OR auth.role() = 'anon');

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON public.email_verification_codes(email);

-- Create index on expires_at for cleanup
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires ON public.email_verification_codes(expires_at);

-- Create function to clean up expired codes
CREATE OR REPLACE FUNCTION public.cleanup_expired_verification_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM public.email_verification_codes
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;