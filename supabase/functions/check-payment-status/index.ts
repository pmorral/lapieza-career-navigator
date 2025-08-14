import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

// Initialize Supabase
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const { user_id } = await req.json();
    
    if (!user_id) {
      return new Response(JSON.stringify({
        error: "user_id is required"
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }

    console.log("🔍 Checking payment status for user:", user_id);

    // 1. Verificar suscripción activa en la tabla subscriptions
    const { data: subscription, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select(`
        id,
        plan_type,
        amount_paid,
        currency,
        status,
        started_at,
        expires_at,
        stripe_session_id,
        stripe_customer_id
      `)
      .eq("user_id", user_id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (subscriptionError && subscriptionError.code !== "PGRST116") {
      console.error("❌ Error getting subscription:", subscriptionError);
      return new Response(JSON.stringify({
        error: "Error getting subscription"
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }

    // 2. Verificar si la suscripción ha expirado
    let paymentStatus = "unpaid";
    let paymentDetails = null;
    let needsExpirationUpdate = false;

    if (subscription) {
      const now = new Date();
      const expiresAt = new Date(subscription.expires_at);
      
      console.log("📅 Subscription expires at:", expiresAt.toISOString());
      console.log("🕐 Current time:", now.toISOString());
      
      if (expiresAt > now) {
        // Suscripción activa y no expirada
        paymentStatus = "paid";
        paymentDetails = {
          plan: subscription.plan_type,
          months: subscription.plan_type === "12months" ? 12 : 6,
          started_at: subscription.started_at,
          expires_at: subscription.expires_at,
          amount_paid: subscription.amount_paid,
          currency: subscription.currency,
          session_id: subscription.stripe_session_id,
          customer_id: subscription.stripe_customer_id
        };
        console.log("✅ User has active subscription:", paymentDetails);
      } else {
        // Suscripción expirada, actualizar estado
        console.log("⚠️ Subscription has expired, updating status...");
        needsExpirationUpdate = true;
        paymentStatus = "unpaid";
      }
    } else {
      console.log("❌ No active subscription found");
    }

    // 3. Si la suscripción expiró, actualizar su estado
    if (needsExpirationUpdate && subscription) {
      try {
        const { error: updateError } = await supabase
          .from("subscriptions")
          .update({ status: "expired" })
          .eq("id", subscription.id);

        if (updateError) {
          console.error("❌ Error updating expired subscription:", updateError);
        } else {
          console.log("✅ Expired subscription status updated");
        }

        // También actualizar el perfil del usuario
        const { error: profileUpdateError } = await supabase
          .from("profiles")
          .update({
            subscription_status: "inactive",
            subscription_plan: null,
            payment_completed_at: null
          })
          .eq("user_id", user_id);

        if (profileUpdateError) {
          console.error("❌ Error updating user profile:", profileUpdateError);
        } else {
          console.log("✅ User profile updated after expiration");
        }
      } catch (updateError) {
        console.error("❌ Exception updating expired subscription:", updateError);
      }
    }

    // 4. Obtener información del perfil para contexto adicional
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("subscription_status, subscription_plan")
      .eq("user_id", user_id)
      .single();

    if (profileError) {
      console.error("❌ Error getting profile:", profileError);
    }

    return new Response(JSON.stringify({
      success: true,
      payment_status: paymentStatus,
      subscription: paymentDetails,
      profile: profile || {},
      checked_at: new Date().toISOString(),
      expires_at: subscription?.expires_at || null
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });

  } catch (error) {
    console.error("💥 Error in check-payment-status function:", error);
    return new Response(JSON.stringify({
      error: "Error checking payment status"
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
