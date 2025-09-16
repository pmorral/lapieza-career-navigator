import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Method not allowed",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { email } = await req.json();

    if (!email) {
      console.error("❌ Missing email");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Email is required",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("🔍 Validating trial request for email:", email);

    // Check if user exists in profiles table
    const { data: existingProfile, error: profileError } = await supabase
      .from("profiles")
      .select("user_id, trial_interview_used, trial_interview_date")
      .eq("email", email)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      console.error("❌ Error checking profile:", profileError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Error checking user profile",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // If user doesn't exist, they can request trial
    if (!existingProfile) {
      console.log("✅ User doesn't exist, can request trial");
      return new Response(
        JSON.stringify({
          success: true,
          can_request_trial: true,
          user_exists: false,
          message: "User can request trial interview",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // If user exists, check if they already used their trial
    if (existingProfile.trial_interview_used) {
      console.log("❌ User already used trial interview");
      return new Response(
        JSON.stringify({
          success: false,
          trial_limit_reached: true,
          user_exists: true,
          trial_date: existingProfile.trial_interview_date,
          message: "Ya has utilizado tu entrevista gratuita",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // User exists but hasn't used trial yet
    console.log("✅ User exists but can still request trial");
    return new Response(
      JSON.stringify({
        success: true,
        can_request_trial: true,
        user_exists: true,
        message: "User can request trial interview",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("💥 Error in validate-trial-request:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
