-- Fix search_path for the cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_expired_verification_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.email_verification_codes
  WHERE expires_at < now();
END;
$$;