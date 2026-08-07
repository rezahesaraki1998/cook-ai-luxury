import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limit settings
const ANONYMOUS_LIMIT = 2; // Total requests for anonymous users
const AUTHENTICATED_LIMIT = 50; // Requests per hour for authenticated users
const ADMIN_UNLIMITED = true; // Admins have unlimited access

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Require an authenticated user (verify_jwt is also enabled for this function)
    const authHeader = req.headers.get('authorization');
    let userId: string | null = null;
    let isAdmin = false;
    let isAuthenticated = false;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);

      if (authError || !user) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      userId = user.id;
      isAuthenticated = true;

      // Check if user is admin
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      isAdmin = !!roleData;
      console.log(`Authenticated user: ${userId}, isAdmin: ${isAdmin}`);
    }


    // Get client IP for anonymous rate limiting
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    const identifier = isAuthenticated ? userId! : `ip:${clientIP}`;
    const endpoint = 'recipe-ai';

    // Skip rate limiting for admins
    if (!isAdmin) {
      // Check rate limits
      const now = new Date();
      const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      if (isAuthenticated) {
        // For authenticated users: check requests in the last hour
        const { data: rateLimitData, error: rlError } = await supabase
          .from('rate_limits')
          .select('request_count')
          .eq('identifier', identifier)
          .eq('endpoint', endpoint)
          .gte('window_start', hourAgo.toISOString())
          .order('window_start', { ascending: false })
          .limit(1)
          .single();

        const currentCount = rateLimitData?.request_count || 0;

        if (currentCount >= AUTHENTICATED_LIMIT) {
          console.log(`Rate limit exceeded for authenticated user: ${identifier}`);
          return new Response(
            JSON.stringify({ error: 'محدودیت درخواست: لطفاً یک ساعت دیگر امتحان کنید.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Update or insert rate limit record
        if (rateLimitData) {
          await supabase
            .from('rate_limits')
            .update({ request_count: currentCount + 1 })
            .eq('identifier', identifier)
            .eq('endpoint', endpoint)
            .gte('window_start', hourAgo.toISOString());
        } else {
          await supabase
            .from('rate_limits')
            .insert({ identifier, endpoint, request_count: 1, window_start: now.toISOString() });
        }
      } else {
        // For anonymous users: check total requests ever (lifetime limit)
        const { data: rateLimitData } = await supabase
          .from('rate_limits')
          .select('request_count')
          .eq('identifier', identifier)
          .eq('endpoint', endpoint);

        const totalCount = rateLimitData?.reduce((sum, r) => sum + r.request_count, 0) || 0;

        if (totalCount >= ANONYMOUS_LIMIT) {
          console.log(`Rate limit exceeded for anonymous user: ${identifier}`);
          return new Response(
            JSON.stringify({ error: 'محدودیت رایگان: لطفاً برای ادامه ثبت‌نام کنید.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Insert new rate limit record
        await supabase
          .from('rate_limits')
          .insert({ identifier, endpoint, request_count: 1, window_start: now.toISOString() });
      }
    }

    const { prompt } = await req.json();
    
    // Input validation
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Invalid prompt');
    }
    
    const cleanPrompt = prompt.trim();
    
    if (cleanPrompt.length === 0) {
      throw new Error('Prompt cannot be empty');
    }
    
    if (cleanPrompt.length > 500) {
      throw new Error('Prompt is too long. Maximum 500 characters allowed.');
    }
    
    const apiKey = Deno.env.get('OPENROUTER_API_KEY');

    if (!apiKey) {
      throw new Error('OPENROUTER_API_KEY is not configured');
    }

    console.log(`Calling OpenRouter API for ${isAuthenticated ? 'authenticated' : 'anonymous'} user`);

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
    
    const recipe = data.choices[0].message.content;

    return new Response(JSON.stringify({ recipe }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in recipe-ai function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});