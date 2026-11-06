import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from 'https://esm.sh/zod@3.25.76';
import { recipeIdentity } from '../_shared/recipe-access.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });
  let receipt: string | null = null;
  let identity: Awaited<ReturnType<typeof recipeIdentity>> | null = null;
  const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), {
    status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
  try {
    if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
    const body = await req.json();
    identity = await recipeIdentity(req);
    const { client: supabase, userId, identifier } = identity;
    if (body.action === 'status') {
      const { data, error } = await supabase.rpc('recipe_access_status', { p_user_id: userId, p_identifier: identifier });
      if (error) throw error;
      return json({ quota: data });
    }
    const parsed = z.object({ prompt: z.string().trim().min(1).max(200), language: z.enum(['fa','en']).default('fa') }).safeParse(body);
    if (!parsed.success) return json({ error: 'Invalid prompt', code: 'INVALID_INPUT' }, 400);
    const cleanPrompt = parsed.data.prompt;
    const { data: reservation, error: reserveError } = await supabase.rpc('reserve_recipe_request', {
      p_user_id: userId, p_identifier: identifier, p_prompt: cleanPrompt,
    });
    if (reserveError) throw reserveError;
    if (!reservation?.allowed) return json({ code: reservation?.code, quota: reservation }, 429);
    receipt = reservation.requestId;

    const apiKey = Deno.env.get('OPENROUTER_API_KEY');

    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY is not configured');
    }

    console.log('Calling recipe provider');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://lovable.dev',
        'X-Title': 'Recipe AI'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `شما یک دستیار آشپزی هستید. وقتی کاربر نام یک غذا می‌گوید، دستور پخت را به این فرمت دقیق پاسخ دهید:

## نام غذا
[نام غذا]

## مواد لازم
- [ماده اول با مقدار]
- [ماده دوم با مقدار]
...

## مراحل پخت
1. [مرحله اول]
2. [مرحله دوم]
...

## نکات مهم
- [نکته اول]
- [نکته دوم]
...

حتما از این فرمت دقیق استفاده کنید.`
          },
          {
            role: 'user',
            content: cleanPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenRouter API response received');
    
    const recipe = data.choices?.[0]?.message?.content;
    if (typeof recipe !== 'string' || !recipe.trim()) throw new Error('Empty recipe response');
    const { data: settled, error: settleError } = await supabase.rpc('finish_recipe_request', { p_request_id: receipt, p_success: true });
    if (settleError || !settled) throw new Error('Unable to settle recipe quota');
    const requestId = receipt;
    receipt = null;
    const { data: quota, error: quotaError } = await supabase.rpc('recipe_access_status', { p_user_id: userId, p_identifier: identifier });
    if (quotaError) throw quotaError;

    return new Response(JSON.stringify({ recipe, requestId, quota }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (receipt && identity) {
      await identity.client.rpc('finish_recipe_request', { p_request_id: receipt, p_success: false });
    }
    console.error('Recipe request failed');
    if (error instanceof Error && error.message === 'INVALID_SESSION') return json({ code: 'INVALID_SESSION' }, 401);
    return new Response(
      JSON.stringify({ error: 'Unable to generate recipe' }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});