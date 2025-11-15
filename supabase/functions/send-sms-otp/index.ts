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

  try {
    const { phone } = await req.json();
    
    console.log('Sending SMS OTP to:', phone);

    // Validate phone number
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

    // Send SMS via Kavenegar
    const kavenegarApiKey = Deno.env.get('KAVENEGAR_API_KEY');
    const kavenegarUrl = `https://api.kavenegar.com/v1/${kavenegarApiKey}/verify/lookup.json`;
    
    const formData = new URLSearchParams();
    formData.append('receptor', phone);
    formData.append('token', code);
    formData.append('template', 'verify'); // Default template name in Kavenegar

    const smsResponse = await fetch(kavenegarUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const smsResult = await smsResponse.json();
    console.log('Kavenegar response:', smsResult);

    if (smsResult.return?.status !== 200) {
      console.error('SMS sending failed:', smsResult);
      return new Response(
        JSON.stringify({ error: 'خطا در ارسال پیامک' }),
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
