import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3.25.76';
import { chargeFromPlan, handleCallback, safeOrigin, DEFAULT_GATEWAY_BASE, DEFAULT_MERCHANT_ID, ZP_REQUEST_URL, ZP_VERIFY_URL, ZP_CALLBACK_URL } from './logic.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
if (!SUPABASE_URL || !SERVICE_KEY) throw new Error('Payment service configuration is missing');
const admin = createClient(SUPABASE_URL, SERVICE_KEY);
const MERCHANT = Deno.env.get('ZARINPAL_MERCHANT_ID') || DEFAULT_MERCHANT_ID;
const GATEWAY = Deno.env.get('ZARINPAL_GATEWAY_BASE') || DEFAULT_GATEWAY_BASE;
const json = (d: unknown, status = 200) => new Response(JSON.stringify(d), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

async function zp(url: string, body: unknown) {
  const r = await fetch(url, { method: 'POST', signal: AbortSignal.timeout(20000), headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) });
  return await r.json().catch(() => null);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const url = new URL(req.url);

  // ZarinPal redirects the buyer's browser here (GET ?Authority=..&Status=OK|NOK)
  if (req.method === 'GET' && url.searchParams.get('action') === 'callback') {
    let out;
    try {
      out = await handleCallback(url.searchParams.get('Authority'), url.searchParams.get('Status'), {
        loadByAuthority: async (a) => (await admin.from('payments').select('id,status,amount,currency,authority,return_origin').eq('authority', a).maybeSingle()).data,
        verify: async (amount, authority) => {
          const res = await zp(ZP_VERIFY_URL, { merchant_id: MERCHANT, amount, authority }).catch((e) => { console.error('verify network', e); return null; });
          if (!res) return null;
          const code = res?.data?.code ?? res?.errors?.code;
          console.log('verify code', code);
          return typeof code === 'number' ? { code, ref_id: res?.data?.ref_id, card_pan: res?.data?.card_pan } : null;
        },
        complete: async (id, refId, pan, code) => {
          const { data, error } = await admin.rpc('complete_payment', { p_payment_id: id, p_ref_id: refId, p_card_pan: pan, p_code: code });
          if (error) throw error;
          return data as { ok: boolean; ref_id?: string };
        },
        fail: async (id, status, code) => admin.rpc('fail_payment', { p_payment_id: id, p_status: status, p_code: code }),
      });
    } catch (e) {
      console.error('callback error', e);
      out = { result: 'failed', origin: safeOrigin(null) };
    }
    const dest = new URL('/payment/result', out.origin);
    dest.searchParams.set('status', out.result);
    if (out.refId) dest.searchParams.set('ref', out.refId);
    return new Response(null, { status: 302, headers: { Location: dest.toString() } });
  }

  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const token = req.headers.get('authorization')?.replace(/^Bearer /, '');
  const { data: u } = token ? await admin.auth.getUser(token) : { data: { user: null } };
  if (!u?.user) return json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' }, 401);

  const parsed = z.object({ planId: z.string().uuid(), returnOrigin: z.string().max(200).optional() }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ error: 'Invalid input', code: 'INVALID_INPUT' }, 400);

  const { data: plan } = await admin.from('plans').select('id,name,price,currency,duration_days,is_active').eq('id', parsed.data.planId).maybeSingle();
  const charge = chargeFromPlan(plan);
  if (!plan || !charge) return json({ error: 'Plan unavailable', code: 'PLAN_UNAVAILABLE' }, 400);

  const { data: pay, error: insErr } = await admin.from('payments').insert({
    user_id: u.user.id, plan_id: plan.id, amount: charge.amount, currency: charge.currency,
    duration_days: plan.duration_days, return_origin: safeOrigin(parsed.data.returnOrigin),
  }).select('id').single();
  if (insErr || !pay) { console.error(insErr); return json({ error: 'Could not create order', code: 'ORDER_FAILED' }, 500); }

  const res = await zp(ZP_REQUEST_URL, {
    merchant_id: MERCHANT, amount: charge.amount, currency: charge.currency,
    callback_url: ZP_CALLBACK_URL,
    description: `اشتراک ${plan.name} - cookluxury`,
    metadata: { email: u.user.email ?? undefined, order_id: pay.id },
  }).catch((e) => { console.error('request network', e); return null; });
  const authority = res?.data?.authority;
  if (res?.data?.code !== 100 || typeof authority !== 'string') {
    console.error('zarinpal request failed', JSON.stringify(res?.errors ?? res));
    await admin.rpc('fail_payment', { p_payment_id: pay.id, p_status: 'failed', p_code: res?.errors?.code ?? null });
    if (res?.errors?.code === -14) {
      return json({ error: 'Payment return domain does not match the registered merchant domain', code: 'CALLBACK_DOMAIN_MISMATCH' }, 503);
    }
    return json({ error: 'Gateway unavailable', code: 'GATEWAY_ERROR' }, 502);
  }
  await admin.from('payments').update({ authority }).eq('id', pay.id).eq('status', 'pending');
  return json({ url: `${GATEWAY.replace(/\/?$/, '/')}${authority}` });
});
