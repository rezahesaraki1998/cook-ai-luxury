-- Allow anonymous visitors to read active plans without calling is_admin()
DROP POLICY IF EXISTS "Anyone can view active plans" ON public.plans;

CREATE POLICY "Public can view active plans"
ON public.plans
FOR SELECT
TO anon
USING (is_active = true);

CREATE POLICY "Authenticated can view active plans"
ON public.plans
FOR SELECT
TO authenticated
USING (is_active = true OR public.is_admin(auth.uid()));