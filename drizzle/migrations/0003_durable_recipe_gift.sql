CREATE TABLE public.recipe_quotas (
 identifier text PRIMARY KEY,
 used_count integer NOT NULL DEFAULT 0 CHECK (used_count >= 0),
 updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.recipe_quotas TO service_role;
ALTER TABLE public.recipe_quotas ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.recipe_requests (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 identifier text NOT NULL,
 prompt text NOT NULL,
 tier text NOT NULL CHECK (tier IN ('guest','gift','paid','admin')),
 status text NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved','consumed','refunded')),
 image_claimed boolean NOT NULL DEFAULT false,
 nutrition_claimed boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.recipe_requests TO service_role;
ALTER TABLE public.recipe_requests ENABLE ROW LEVEL SECURITY;
CREATE INDEX recipe_requests_identifier_idx ON public.recipe_requests(identifier, status);
INSERT INTO public.recipe_quotas(identifier, used_count)
 SELECT identifier, least(2, sum(request_count))::integer FROM public.rate_limits
 WHERE endpoint = 'recipe-ai' AND identifier LIKE 'ip:%' GROUP BY identifier
 ON CONFLICT DO NOTHING;
CREATE OR REPLACE FUNCTION public.recipe_access_status(p_user_id uuid, p_identifier text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_tier text := 'guest'; v_used integer := 0; v_reserved integer := 0; v_limit integer := 2;
BEGIN
 IF p_user_id IS NOT NULL THEN
  IF p_identifier <> 'user:' || p_user_id::text THEN RAISE EXCEPTION 'Invalid identity'; END IF;
  v_tier := 'gift'; v_limit := 1;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = p_user_id AND role = 'admin') THEN
   v_tier := 'admin';
  ELSIF EXISTS (SELECT 1 FROM public.subscriptions WHERE user_id = p_user_id AND status = 'active' AND started_at <= now() AND (expires_at IS NULL OR expires_at > now())) THEN
   v_tier := 'paid';
  END IF;
 ELSIF p_identifier NOT LIKE 'ip:%' THEN RAISE EXCEPTION 'Invalid identity';
 END IF;
 SELECT used_count INTO v_used FROM public.recipe_quotas WHERE identifier = p_identifier;
 SELECT count(*)::integer INTO v_reserved FROM public.recipe_requests WHERE identifier = p_identifier AND status = 'reserved' AND tier IN ('guest','gift');
 RETURN jsonb_build_object('tier', v_tier, 'used', coalesce(v_used,0), 'remaining', CASE WHEN v_tier IN ('paid','admin') THEN NULL ELSE greatest(0,v_limit-coalesce(v_used,0)-v_reserved) END, 'busy',v_reserved > 0);
END $$;
CREATE OR REPLACE FUNCTION public.reserve_recipe_request(p_user_id uuid, p_identifier text, p_prompt text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_access jsonb; v_id uuid;
BEGIN
 IF length(trim(p_prompt)) NOT BETWEEN 1 AND 200 THEN RAISE EXCEPTION 'Invalid prompt'; END IF;
 INSERT INTO public.recipe_quotas(identifier) VALUES(p_identifier) ON CONFLICT DO NOTHING;
 PERFORM 1 FROM public.recipe_quotas WHERE identifier=p_identifier FOR UPDATE;
 v_access := public.recipe_access_status(p_user_id,p_identifier);
 IF v_access->>'tier' NOT IN ('admin','paid') AND (v_access->>'remaining')::integer <= 0 THEN
  RETURN v_access || jsonb_build_object('allowed',false,'code',CASE WHEN (v_access->>'busy')::boolean THEN 'REQUEST_IN_PROGRESS' WHEN p_user_id IS NULL THEN 'GUEST_QUOTA_EXHAUSTED' ELSE 'MEMBER_GIFT_EXHAUSTED' END);
 END IF;
 INSERT INTO public.recipe_requests(identifier,prompt,tier) VALUES(p_identifier,trim(p_prompt),v_access->>'tier') RETURNING id INTO v_id;
 RETURN v_access || jsonb_build_object('allowed',true,'requestId',v_id);
END $$;
CREATE OR REPLACE FUNCTION public.finish_recipe_request(p_request_id uuid, p_success boolean)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_request public.recipe_requests%ROWTYPE; v_identifier text;
BEGIN
 SELECT identifier INTO v_identifier FROM public.recipe_requests WHERE id=p_request_id;
 IF v_identifier IS NULL THEN RETURN false; END IF;
 PERFORM 1 FROM public.recipe_quotas WHERE identifier=v_identifier FOR UPDATE;
 SELECT * INTO v_request FROM public.recipe_requests WHERE id=p_request_id FOR UPDATE;
 IF v_request.status <> 'reserved' THEN RETURN false; END IF;
 IF p_success AND v_request.tier IN ('guest','gift') THEN
  UPDATE public.recipe_quotas SET used_count=used_count+1,updated_at=now() WHERE identifier=v_identifier;
 END IF;
 UPDATE public.recipe_requests SET status=CASE WHEN p_success THEN 'consumed' ELSE 'refunded' END WHERE id=p_request_id;
 RETURN true;
END $$;
CREATE OR REPLACE FUNCTION public.claim_recipe_extra(p_request_id uuid,p_identifier text,p_prompt text,p_kind text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id uuid;
BEGIN
 IF p_kind = 'image' THEN
  UPDATE public.recipe_requests SET image_claimed=true WHERE id=p_request_id AND identifier=p_identifier AND prompt=trim(p_prompt) AND status='consumed' AND created_at > now()-interval '15 minutes' AND NOT image_claimed RETURNING id INTO v_id;
 ELSIF p_kind = 'nutrition' THEN
  UPDATE public.recipe_requests SET nutrition_claimed=true WHERE id=p_request_id AND identifier=p_identifier AND prompt=trim(p_prompt) AND status='consumed' AND created_at > now()-interval '15 minutes' AND NOT nutrition_claimed RETURNING id INTO v_id;
 END IF;
 RETURN v_id IS NOT NULL;
END $$;
REVOKE ALL ON FUNCTION public.recipe_access_status(uuid,text), public.reserve_recipe_request(uuid,text,text), public.finish_recipe_request(uuid,boolean), public.claim_recipe_extra(uuid,text,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.recipe_access_status(uuid,text), public.reserve_recipe_request(uuid,text,text), public.finish_recipe_request(uuid,boolean), public.claim_recipe_extra(uuid,text,text,text) TO service_role;