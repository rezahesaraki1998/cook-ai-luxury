CREATE TABLE public.payments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL,
 plan_id uuid NOT NULL REFERENCES public.plans(id),
 amount bigint NOT NULL CHECK (amount > 0),
 currency text NOT NULL CHECK (currency IN ('IRT','IRR')),
 duration_days integer NOT NULL CHECK (duration_days > 0),
 provider text NOT NULL DEFAULT 'zarinpal',
 authority text UNIQUE,
 status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','cancelled')),
 ref_id text,
 card_pan text,
 verify_code integer,
 subscription_id uuid REFERENCES public.subscriptions(id),
 return_origin text,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 paid_at timestamptz
);
GRANT SELECT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own payments" ON public.payments FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin(auth.uid()));
CREATE INDEX payments_user_idx ON public.payments(user_id, created_at DESC);
CREATE UNIQUE INDEX payments_subscription_uidx ON public.payments(subscription_id) WHERE subscription_id IS NOT NULL;
CREATE TRIGGER payments_set_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE FUNCTION public.complete_payment(p_payment_id uuid, p_ref_id text, p_card_pan text, p_code integer)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_pay public.payments%ROWTYPE; v_base timestamptz; v_sub uuid;
BEGIN
 SELECT * INTO v_pay FROM public.payments WHERE id = p_payment_id FOR UPDATE;
 IF NOT FOUND THEN RETURN jsonb_build_object('ok', false, 'reason', 'not_found'); END IF;
 IF v_pay.status = 'paid' THEN RETURN jsonb_build_object('ok', true, 'already', true, 'subscription_id', v_pay.subscription_id, 'ref_id', v_pay.ref_id); END IF;
 IF v_pay.status <> 'pending' THEN RETURN jsonb_build_object('ok', false, 'reason', v_pay.status); END IF;
 PERFORM pg_advisory_xact_lock(hashtext('sub:' || v_pay.user_id::text));
 SELECT max(expires_at) INTO v_base FROM public.subscriptions
  WHERE user_id = v_pay.user_id AND status = 'active' AND expires_at > now();
 v_base := greatest(coalesce(v_base, now()), now());
 INSERT INTO public.subscriptions(user_id, plan_id, status, started_at, expires_at)
  VALUES (v_pay.user_id, v_pay.plan_id, 'active', now(), v_base + make_interval(days => v_pay.duration_days))
  RETURNING id INTO v_sub;
 UPDATE public.payments SET status='paid', ref_id=p_ref_id, card_pan=p_card_pan, verify_code=p_code, subscription_id=v_sub, paid_at=now() WHERE id = p_payment_id;
 RETURN jsonb_build_object('ok', true, 'already', false, 'subscription_id', v_sub, 'ref_id', p_ref_id);
END $$;
REVOKE ALL ON FUNCTION public.complete_payment(uuid, text, text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.complete_payment(uuid, text, text, integer) TO service_role;

CREATE OR REPLACE FUNCTION public.fail_payment(p_payment_id uuid, p_status text, p_code integer)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id uuid;
BEGIN
 IF p_status NOT IN ('failed','cancelled') THEN RAISE EXCEPTION 'Invalid status'; END IF;
 UPDATE public.payments SET status = p_status, verify_code = p_code WHERE id = p_payment_id AND status = 'pending' RETURNING id INTO v_id;
 RETURN v_id IS NOT NULL;
END $$;
REVOKE ALL ON FUNCTION public.fail_payment(uuid, text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fail_payment(uuid, text, integer) TO service_role;