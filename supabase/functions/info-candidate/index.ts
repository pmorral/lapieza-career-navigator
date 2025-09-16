import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Initialize Supabase
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    // Get user_id from request body
    const { user_id } = await req.json();

    if (!user_id) {
      return new Response(
        JSON.stringify({
          error: "user_id is required",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    console.log("🔍 Getting candidate info for user:", user_id);

    // Ejecutar todas las consultas en paralelo para mejor rendimiento
    const [
      { data: profile, error: profileError },
      { data: interviews, error: interviewError },
      { data: cvOptimizations, error: cvOptError },
      { data: linkedinOptimizations, error: linkedinError },
    ] = await Promise.all([
      // 1. Información del perfil del usuario
      supabase
        .from("profiles")
        .select(
          `
          id,
          user_id,
          full_name,
          email,
          phone,
          location,
          bio,
          avatar_url,
          subscription_plan,
          subscription_status,
          interview_credits,
          created_at,
          updated_at,
          whatsapp,
          stripe_customer_id,
          payment_completed_at,
          stripe_session_id,
          subscription_months
        `
        )
        .eq("user_id", user_id)
        .single(),

      // 2. Todas sus entrevistas (incluye feedback/respuestas)
      supabase
        .from("interview_responses")
        .select(
          `
          interview_id_external,
          assistant_id,
          type,
          started_at,
          ended_at,
          transcript,
          recording_url,
          stereo_recording_url,
          web_call_url,
          status,
          ended_reason,
          created_at_external,
          updated_at_external,
          org_id,
          cost,
          cost_breakdown,
          costs,
          summary,
          summary_translations,
          ai_summary,
          analysis,
          monitor,
          transport
        `
        )
        .eq("candidate_id", user_id)
        .order("created_at", { ascending: false }),

      // 3. Sus optimizaciones de CV
      supabase
        .from("cv_optimizations")
        .select(
          `
          id,
          original_filename,
          optimized_content,
          created_at,
          updated_at
        `
        )
        .eq("user_id", user_id)
        .order("created_at", { ascending: false }),

      // 4. Sus optimizaciones de LinkedIn
      supabase
        .from("linkedin_optimizations")
        .select(
          `
          id,
          personal_cv_filename,
          linkedin_cv_filename,
          optimized_content,
          created_at,
          updated_at,
          linkedin_url
        `
        )
        .eq("user_id", user_id)
        .order("created_at", { ascending: false }),
    ]);

    // Manejo de errores
    if (profileError) {
      console.error("❌ Error getting profile:", profileError);
      return new Response(
        JSON.stringify({
          error: "Error getting user profile",
          details: profileError.message,
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (interviewError) {
      console.error("❌ Error getting interviews:", interviewError);
    }

    if (cvOptError) {
      console.error("❌ Error getting CV optimizations:", cvOptError);
    }

    if (linkedinError) {
      console.error("❌ Error getting LinkedIn optimizations:", linkedinError);
    }

    // Construir la respuesta
    const candidateData = {
      profile,
      interviews: interviews || [],
      cv_optimizations: cvOptimizations || [],
      linkedin_optimizations: linkedinOptimizations || [],
    };

    console.log("✅ Candidate info retrieved successfully:", {
      user_id,
      profile_found: !!profile,
      interviews_count: interviews?.length || 0,
      cv_optimizations_count: cvOptimizations?.length || 0,
      linkedin_optimizations_count: linkedinOptimizations?.length || 0,
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: candidateData,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("💥 Error in info-candidate function:", error);
    return new Response(
      JSON.stringify({
        error: "Error getting candidate information",
        details: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
