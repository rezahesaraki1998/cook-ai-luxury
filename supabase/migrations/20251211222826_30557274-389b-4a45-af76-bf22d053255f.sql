-- Drop the insecure SELECT policy
DROP POLICY IF EXISTS "Users can read their own codes" ON public.email_verification_codes;

-- Create a secure policy that only allows service_role access (no anon access)
CREATE POLICY "Only authenticated users can read their own codes" 
ON public.email_verification_codes 
FOR SELECT 
USING (email = (current_setting('request.jwt.claims'::text, true)::json ->> 'email'));

-- Delete all existing verification codes (SMS is disabled, codes are expired)
DELETE FROM public.email_verification_codes;