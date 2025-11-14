import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    console.log('Calling OpenRouter API with validated prompt');

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
