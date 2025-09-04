import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, code, type = "trial_interview" } = await req.json();

    console.log("🔍 Verifying code:", { email, code, type });

    if (!email || !code) {
      console.log("❌ Missing required fields:", {
        email: !!email,
        code: !!code,
      });
      return new Response(
        JSON.stringify({ error: "Email and code are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // First, let's check what codes exist for this email
    const { data: allCodes, error: allCodesError } = await supabase
      .from("verification_codes")
      .select("*")
      .eq("email", email)
      .eq("type", type)
      .order("created_at", { ascending: false });

    console.log("📋 All codes for email:", allCodes);

    // Find and verify the code
    const { data: verificationCode, error: dbError } = await supabase
      .from("verification_codes")
      .select("*")
      .eq("email", email)
      .eq("code", code)
      .eq("type", type)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    console.log("🔍 Verification query result:", { verificationCode, dbError });

    if (dbError) {
      console.log("❌ Database error:", dbError);
      return new Response(
        JSON.stringify({
          error: "Database error during verification",
          details: dbError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!verificationCode) {
      console.log("❌ No valid verification code found");
      return new Response(
        JSON.stringify({
          error: "Invalid or expired verification code",
          details: "Please request a new code",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Mark the code as used
    await supabase
      .from("verification_codes")
      .update({ used: true })
      .eq("id", verificationCode.id);

    // Clean up expired codes for this email
    await supabase
      .from("verification_codes")
      .delete()
      .eq("email", email)
      .lt("expires_at", new Date().toISOString());

    return new Response(
      JSON.stringify({
        success: true,
        message: "Code verified successfully",
        data: {
          email,
          verified_at: new Date().toISOString(),
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("💥 Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
