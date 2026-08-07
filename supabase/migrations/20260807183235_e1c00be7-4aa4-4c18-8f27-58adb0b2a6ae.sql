-- 1) email_verification_codes: remove client-side access entirely (server/service-role only)
DROP POLICY IF EXISTS "Anyone can create verification codes" ON public.email_verification_codes;
DROP POLICY IF EXISTS "Only authenticated users can read their own codes" ON public.email_verification_codes;

REVOKE ALL ON public.email_verification_codes FROM anon;
REVOKE ALL ON public.email_verification_codes FROM authenticated;
GRANT ALL ON public.email_verification_codes TO service_role;

-- 2) rate_limits: explicit access rules, server-side only + admin read for monitoring
REVOKE ALL ON public.rate_limits FROM anon;
REVOKE ALL ON public.rate_limits FROM authenticated;
GRANT SELECT ON public.rate_limits TO authenticated;
GRANT ALL ON public.rate_limits TO service_role;

DROP POLICY IF EXISTS "Admins can view rate limits" ON public.rate_limits;
CREATE POLICY "Admins can view rate limits"
ON public.rate_limits
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- 3) SECURITY DEFINER functions: revoke public/anon/authenticated EXECUTE where not needed
REVOKE ALL ON FUNCTION public.cleanup_expired_verification_codes() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.cleanup_old_rate_limits() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_updated_at() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.cleanup_expired_verification_codes() TO service_role;
GRANT EXECUTE ON FUNCTION public.cleanup_old_rate_limits() TO service_role;

-- Role-check helpers are required by RLS policies, so keep them callable by signed-in users only
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, service_role;