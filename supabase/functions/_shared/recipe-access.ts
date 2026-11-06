import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export async function recipeIdentity(req: Request) {
  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey) throw new Error('Server configuration unavailable');
  const client = createClient(url, serviceKey);
  const token = req.headers.get('authorization')?.replace(/^Bearer /, '');
  let userId: string | null = null;
  if (token && token !== Deno.env.get('SUPABASE_ANON_KEY')) {
    const { data, error } = await client.auth.getUser(token);
    if (error || !data.user) throw new Error('INVALID_SESSION');
    userId = data.user.id;
  }
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip');
  if (!userId && !ip) throw new Error('Client identity unavailable');
  return { client, userId, identifier: userId ? `user:${userId}` : `ip:${ip}` };
}

export async function claimExtra(req: Request, requestId: string, foodName: string, kind: string) {
  const { client, identifier } = await recipeIdentity(req);
  const { data, error } = await client.rpc('claim_recipe_extra', {
    p_request_id: requestId, p_identifier: identifier, p_prompt: foodName, p_kind: kind,
  });
  if (error) throw error;
  return data === true;
}