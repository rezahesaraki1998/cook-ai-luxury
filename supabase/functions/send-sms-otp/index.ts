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

  // The code below is kept for reference when SMS OTP is re-enabled
  // It is unreachable due to the return statement above
});
