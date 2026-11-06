import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Opt-in live regression tests. Never embed credentials or mint arbitrary users.
const enabled = process.env.RECIPE_QUOTA_LIVE_TEST === '1';
const env = enabled ? readFileSync(new URL('../.env', import.meta.url), 'utf8') : '';
const value = (key) => env.match(new RegExp(`^${key}=["']?([^"'\\n]+)`, 'm'))?.[1];
const url = value('VITE_SUPABASE_URL');
const key = value('VITE_SUPABASE_PUBLISHABLE_KEY');
const session = enabled ? JSON.parse(readFileSync(process.env.RECIPE_TEST_SESSION_FILE, 'utf8')).session : null;
async function call(body, member = false, endpoint = 'recipe-ai') {
  const response = await fetch(`${url}/functions/v1/${endpoint}`, {
    method: 'POST', headers: { apikey: key, Authorization: `Bearer ${member ? session.access_token : key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: response.status, data: await response.json() };
}
test('guest entitlement totals exactly two searches', { skip: !enabled }, async () => {
  const result = await call({ action: 'status' });
  assert.equal(result.status, 200);
  assert.equal(result.data.quota.tier, 'guest');
  assert.equal(result.data.quota.used + result.data.quota.remaining, 2);
});
test('consumed membership gift cannot be reclaimed with a fresh request', { skip: !enabled }, async () => {
  const status = await call({ action: 'status' }, true);
  assert.equal(status.data.quota.tier, 'gift');
  assert.equal(status.data.quota.used, 1);
  assert.equal(status.data.quota.remaining, 0);
  const result = await call({ prompt: 'عدسی' }, true);
  assert.equal(result.status, 429);
  assert.equal(result.data.code, 'MEMBER_GIFT_EXHAUSTED');
});
test('invalid input does not spend a guest search', { skip: !enabled }, async () => {
  const before = await call({ action: 'status' });
  assert.equal((await call({ prompt: '' })).status, 400);
  const after = await call({ action: 'status' });
  assert.equal(after.data.quota.used, before.data.quota.used);
});
test('extra AI calls require a recipe receipt', { skip: !enabled }, async () => {
  for (const endpoint of ['generate-food-image', 'get-nutrition-info']) {
    assert.equal((await call({ foodName: 'عدسی' }, true, endpoint)).status, 400);
  }
});
test('signed-in clients cannot reserve quota directly', { skip: !enabled }, async () => {
  const response = await fetch(`${url}/rest/v1/rpc/reserve_recipe_request`, {
    method: 'POST', headers: { apikey: key, Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_user_id: session.user.id, p_identifier: `user:${session.user.id}`, p_prompt: 'عدسی' }),
  });
  assert.equal(response.status, 403);
});