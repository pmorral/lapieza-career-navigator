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
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
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

    console.log("🔍 Getting service history for user:", user_id);

    // Obtener el customer ID del usuario
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("user_id", user_id)
      .single();

    if (profileError) {
      console.error("❌ Error getting profile:", profileError);
      return new Response(
        JSON.stringify({
          error: "Error getting user profile",
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

    if (!profile.stripe_customer_id) {
      console.log("ℹ️ No Stripe customer ID found for user");
      return new Response(
        JSON.stringify({
          services: [],
          message: "No payment history found",
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Obtener pagos de servicios desde la tabla payments
    const { data: payments, error: paymentsError } = await supabase
      .from("payments")
      .select(
        `
        id,
        amount,
        currency,
        status,
        payment_type,
        description,
        created_at
      `
      )
      .eq("user_id", user_id)
      .eq("payment_type", "service")
      .eq("status", "completed")
      .order("created_at", { ascending: false });

    if (paymentsError) {
      console.error("❌ Error getting payments:", paymentsError);
      return new Response(
        JSON.stringify({
          error: "Error getting payment history",
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

    // Mapear los pagos a un formato más legible
    const services = payments.map((payment) => {
      // Determinar el tipo de servicio basado en la descripción
      let serviceName = payment.description || "Servicio";
      let duration = "";

      if (
        payment.description?.includes("Career Coach") ||
        payment.description?.includes("Entrevista")
      ) {
        serviceName = "Entrevista con Career Coach";
        duration = "45 min";
      } else if (
        payment.description?.includes("Asesoría") ||
        payment.description?.includes("Empleabilidad")
      ) {
        serviceName = "Asesoría General de Empleabilidad";
        duration = "60 min";
      } else if (
        payment.description?.includes("Vacantes") ||
        payment.description?.includes("20")
      ) {
        serviceName = "20 Vacantes Personalizadas";
        duration = "48 horas";
      }

      return {
        id: payment.id,
        name: serviceName,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        created_at: payment.created_at,
        duration: duration,
        formatted_date: new Date(payment.created_at).toLocaleDateString(
          "es-ES",
          {
            day: "numeric",
            month: "short",
            year: "numeric",
          }
        ),
      };
    });

    console.log("✅ Found", services.length, "services for user");

    return new Response(
      JSON.stringify({
        services: services,
        customer_id: profile.stripe_customer_id,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("💥 Error in get-service-history function:", error);
    return new Response(
      JSON.stringify({
        error: "Error getting service history",
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
