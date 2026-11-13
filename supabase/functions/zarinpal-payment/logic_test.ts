import { assertEquals } from 'jsr:@std/assert@1';
import { chargeFromPlan, handleCallback, safeOrigin, ZP_CALLBACK_URL, type CallbackDeps, type Payment } from './logic.ts';
import { paymentVerificationUrl } from '../../../src/lib/payment-callback.ts';

const AUTH = 'A0000000000000000000000000000wwOGYpd';
function deps(pay: Payment | null, verifyCode: number | null) {
  const calls = { verify: [] as number[], complete: 0, fail: [] as string[] };
  const state = { pay };
  const d: CallbackDeps = {
    loadByAuthority: async () => state.pay && { ...state.pay },
    verify: async (amount) => { calls.verify.push(amount); return verifyCode === null ? null : { code: verifyCode, ref_id: 123, card_pan: '6037**1234' }; },
    complete: async () => { if (!state.pay) throw new Error('Missing payment'); calls.complete++; const already = state.pay.status === 'paid'; state.pay.status = 'paid'; return { ok: true, already, ref_id: '123' }; },
    fail: async (_id, s) => { if (!state.pay) throw new Error('Missing payment'); calls.fail.push(s); state.pay.status = s; },
  };
  return { d, calls, state };
}
const pending = (): Payment => ({ id: 'p1', status: 'pending', amount: '249000.00', currency: 'IRT', authority: AUTH, return_origin: 'https://www.cookluxury.ir' });

Deno.test('success verifies with persisted amount and activates once', async () => {
  const { d, calls } = deps(pending(), 100);
  const r = await handleCallback(AUTH, 'OK', d);
  assertEquals(r.result, 'success'); assertEquals(calls.verify, [249000]); assertEquals(calls.complete, 1);
});
Deno.test('duplicate callback after success does not verify or activate again', async () => {
  const { d, calls } = deps(pending(), 100);
  await handleCallback(AUTH, 'OK', d);
  const r = await handleCallback(AUTH, 'OK', d);
  assertEquals(r.result, 'success'); assertEquals(calls.complete, 1); assertEquals(calls.verify.length, 1);
});
Deno.test('code 101 (already verified) is treated as success via idempotent completion', async () => {
  const { d, calls } = deps(pending(), 101);
  assertEquals((await handleCallback(AUTH, 'OK', d)).result, 'success'); assertEquals(calls.complete, 1);
});
Deno.test('cancelled callback marks cancelled without verifying', async () => {
  const { d, calls } = deps(pending(), 100);
  assertEquals((await handleCallback(AUTH, 'NOK', d)).result, 'cancelled');
  assertEquals(calls.verify.length, 0); assertEquals(calls.complete, 0); assertEquals(calls.fail, ['cancelled']);
});
Deno.test('wrong amount / failed verification (-50) never activates', async () => {
  const { d, calls } = deps(pending(), -50);
  assertEquals((await handleCallback(AUTH, 'OK', d)).result, 'failed');
  assertEquals(calls.complete, 0); assertEquals(calls.fail, ['failed']);
});
Deno.test('verify network error keeps payment pending', async () => {
  const { d, calls, state } = deps(pending(), null);
  assertEquals((await handleCallback(AUTH, 'OK', d)).result, 'failed');
  assertEquals(calls.complete, 0); assertEquals(state.pay?.status, 'pending');
});
Deno.test('unknown or malformed authority is rejected', async () => {
  assertEquals((await handleCallback(AUTH, 'OK', deps(null, 100).d)).result, 'invalid');
  assertEquals((await handleCallback('bad!', 'OK', deps(pending(), 100).d)).result, 'invalid');
  assertEquals((await handleCallback(AUTH, 'MAYBE', deps(pending(), 100).d)).result, 'invalid');
});
Deno.test('charge comes only from active integer plan price', () => {
  const p = { id: 'x', name: 'n', price: '249000.00', currency: 'IRT', duration_days: 30, is_active: true };
  assertEquals(chargeFromPlan(p), { amount: 249000, currency: 'IRT' });
  assertEquals(chargeFromPlan({ ...p, is_active: false }), null);
  assertEquals(chargeFromPlan({ ...p, price: '10.5' }), null);
  assertEquals(chargeFromPlan({ ...p, currency: 'USD' }), null);
});
Deno.test('return origin is allowlisted', () => {
  assertEquals(safeOrigin('https://evil.com'), 'https://www.cookluxury.ir');
  assertEquals(safeOrigin('https://cookluxury.ir'), 'https://cookluxury.ir');
});
Deno.test('gateway callback uses the merchant website, not the function host or payment CNAME', () => {
  assertEquals(ZP_CALLBACK_URL, 'https://www.cookluxury.ir/payment/result');
});
Deno.test('browser forwards only valid callback fields to server verification', () => {
  for (const status of ['OK', 'NOK']) {
    const target = paymentVerificationUrl('https://backend.example', new URLSearchParams({ Authority: AUTH, Status: status, status: 'success', amount: '1', redirect: 'https://evil.com' }));
    assertEquals(target, `https://backend.example/functions/v1/zarinpal-payment?action=callback&Authority=${AUTH}&Status=${status}`);
  }
  assertEquals(paymentVerificationUrl('https://backend.example', new URLSearchParams({ Authority: 'bad!', Status: 'OK' })), null);
  assertEquals(paymentVerificationUrl('https://backend.example', new URLSearchParams({ Authority: AUTH, Status: 'success' })), null);
});
