// Pure ZarinPal v4 logic with injectable dependencies (tested in logic_test.ts).
export const ZP_REQUEST_URL = 'https://api.zarinpal.com/pg/v4/payment/request.json';
export const ZP_VERIFY_URL = 'https://api.zarinpal.com/pg/v4/payment/verify.json';
export const DEFAULT_MERCHANT_ID = '0ba3ec43-ccb9-4dfd-8e93-71e39e1cc598'; // public merchant id, not a secret
export const DEFAULT_GATEWAY_BASE = 'https://www.zarinpal.com/pg/StartPay/';
// Fixed merchant-domain return address, never derived from a buyer's origin.
export const ZP_CALLBACK_URL = 'https://www.cookluxury.ir/payment/result';

const ALLOWED_ORIGINS = [
  /^https:\/\/(www\.)?cookluxury\.ir$/,
  /^https:\/\/[a-z0-9-]+\.lovable\.app$/,
  /^https:\/\/[a-z0-9-]+\.lovableproject\.com$/,
  /^http:\/\/localhost(:\d+)?$/,
];
export const DEFAULT_ORIGIN = 'https://www.cookluxury.ir';
export function safeOrigin(o: unknown): string {
  return typeof o === 'string' && ALLOWED_ORIGINS.some((r) => r.test(o)) ? o : DEFAULT_ORIGIN;
}

export interface Plan { id: string; price: number | string; currency: string; duration_days: number; is_active: boolean; name: string }
/** Derive the charge strictly from the trusted plan row. */
export function chargeFromPlan(plan: Plan | null): { amount: number; currency: 'IRT' | 'IRR' } | null {
  if (!plan || !plan.is_active) return null;
  const amount = Number(plan.price);
  if (!Number.isInteger(amount) || amount <= 0) return null;
  if (plan.currency !== 'IRT' && plan.currency !== 'IRR') return null;
  // ZarinPal minimum is 1,000 IRR (100 IRT)
  if ((plan.currency === 'IRT' ? amount * 10 : amount) < 1000) return null;
  return { amount, currency: plan.currency };
}

export interface Payment { id: string; status: string; amount: number | string; currency: string; authority: string | null; return_origin: string | null }
export interface CallbackDeps {
  loadByAuthority(authority: string): Promise<Payment | null>;
  verify(amount: number, authority: string): Promise<{ code: number; ref_id?: string | number; card_pan?: string } | null>;
  complete(id: string, refId: string, cardPan: string | null, code: number): Promise<{ ok: boolean; already?: boolean; ref_id?: string }>;
  fail(id: string, status: 'failed' | 'cancelled', code: number | null): Promise<unknown>;
}
export type Outcome = { result: 'success' | 'failed' | 'cancelled' | 'invalid'; refId?: string; origin: string };

const AUTH_RE = /^[A-Za-z0-9]{10,64}$/;
export async function handleCallback(authority: string | null, status: string | null, deps: CallbackDeps): Promise<Outcome> {
  if (!authority || !AUTH_RE.test(authority) || (status !== 'OK' && status !== 'NOK')) return { result: 'invalid', origin: DEFAULT_ORIGIN };
  const pay = await deps.loadByAuthority(authority);
  if (!pay) return { result: 'invalid', origin: DEFAULT_ORIGIN };
  const origin = safeOrigin(pay.return_origin);
  if (pay.status === 'paid') return { result: 'success', origin }; // duplicate callback
  if (pay.status !== 'pending') return { result: pay.status === 'cancelled' ? 'cancelled' : 'failed', origin };
  if (status === 'NOK') { await deps.fail(pay.id, 'cancelled', null); return { result: 'cancelled', origin }; }
  // Status=OK is never trusted alone: verify server-side with the persisted amount.
  const v = await deps.verify(Number(pay.amount), authority);
  if (!v) return { result: 'failed', origin }; // network error: keep pending so a retry can verify
  if (v.code === 100 || v.code === 101) {
    const r = await deps.complete(pay.id, String(v.ref_id ?? ''), v.card_pan ?? null, v.code);
    return r.ok ? { result: 'success', refId: r.ref_id, origin } : { result: 'failed', origin };
  }
  await deps.fail(pay.id, 'failed', v.code);
  return { result: 'failed', origin };
}
