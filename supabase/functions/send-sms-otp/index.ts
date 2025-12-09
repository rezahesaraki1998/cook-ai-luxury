import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // SMS OTP temporarily disabled for security review
  return new Response(
    JSON.stringify({ error: 'سرویس پیامک موقتاً غیرفعال است' }),
    { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );

  try {
    let { phone } = await req.json();
    
    console.log('Received phone:', phone);

    // Normalize phone number - convert +98 to 0
    if (phone && phone.startsWith('+98')) {
      phone = '0' + phone.slice(3);
    }
    
    console.log('Normalized phone:', phone);

    // Validate phone number (must be 09xxxxxxxxx format after normalization)
    if (!phone || !/^09\d{9}$/.test(phone)) {
      return new Response(
        JSON.stringify({ error: 'شماره موبایل معتبر نیست' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated OTP code:', code);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Store code in database
    const { error: dbError } = await supabase
      .from('email_verification_codes')
      .insert({
        email: phone, // Using email field to store phone
        code: code,
        verified: false
      });

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'خطا در ذخیره کد تایید' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send SMS via sms.ir
    const smsirApiKey = Deno.env.get('SMSIR_API_KEY');
    const smsirTemplateId = Deno.env.get('SMSIR_TEMPLATE_ID');
    
    console.log('Using sms.ir API with template ID:', smsirTemplateId);

    const smsResponse = await fetch('https://api.sms.ir/v1/send/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-api-key': smsirApiKey!,
      },
      body: JSON.stringify({
        mobile: phone,
        templateId: parseInt(smsirTemplateId!, 10),
        parameters: [
          {
            name: "CODE",
            value: code
          }
        ]
      }),
    });

    const smsResult = await smsResponse.json();
    console.log('sms.ir response:', smsResult);

    if (smsResult.status !== 1) {
      console.error('SMS sending failed:', smsResult);
      return new Response(
        JSON.stringify({ error: smsResult.message || 'خطا در ارسال پیامک' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'کد تایید با موفقیت ارسال شد' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in send-sms-otp:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'خطای سرور' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
