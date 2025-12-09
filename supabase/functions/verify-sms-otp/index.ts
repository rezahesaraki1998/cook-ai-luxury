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
    let { phone, code } = await req.json();
    
    // Normalize phone number - convert +98 to 0
    if (phone && phone.startsWith('+98')) {
      phone = '0' + phone.slice(3);
    }
    
    console.log('Verifying SMS OTP for phone:', phone);

    if (!phone || !code) {
      return new Response(
        JSON.stringify({ error: 'شماره موبایل و کد تایید الزامی است' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check code in database
    const { data, error } = await supabase
      .from('email_verification_codes')
      .select('*')
      .eq('email', phone)
      .eq('code', code)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      console.error('Verification failed:', error);
      return new Response(
        JSON.stringify({ error: 'کد تایید نامعتبر یا منقضی شده است' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark as verified
    await supabase
      .from('email_verification_codes')
      .update({ verified: true })
      .eq('id', data.id);

    console.log('OTP verified successfully');

    return new Response(
      JSON.stringify({ success: true, message: 'کد تایید با موفقیت تایید شد' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in verify-sms-otp:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'خطای سرور' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
