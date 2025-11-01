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
    const apiKey = Deno.env.get('GOOGLE_API_KEY');

    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY is not configured');
    }

    console.log('Calling Google Gemini API with prompt:', prompt);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `شما یک دستیار آشپزی هستید. وقتی کاربر نام یک غذا می‌گوید، دستور پخت را به این فرمت دقیق پاسخ دهید:

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

حتما از این فرمت دقیق استفاده کنید.

درخواست کاربر: ${prompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Gemini API error:', response.status, errorText);
      throw new Error(`Google Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Google Gemini API response received');
    
    const recipe = data.candidates[0].content.parts[0].text;

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
