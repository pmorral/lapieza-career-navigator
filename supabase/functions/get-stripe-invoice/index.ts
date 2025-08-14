import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
// Initialize Stripe
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"), {
  apiVersion: "2024-12-18.acacia"
});
// Initialize Supabase
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, supabaseServiceKey);
serve(async (req)=>{
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
    // Get user profile to find Stripe customer ID
    const { data: profile, error: profileError } = await supabase.from("profiles").select("stripe_customer_id, email, full_name").eq("user_id", user_id).single();
    if (profileError || !profile?.stripe_customer_id) {
      return new Response(JSON.stringify({
        error: "User not found or no Stripe customer ID"
      }), {
        status: 404,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    // Get payment intents for the customer
    const paymentIntents = await stripe.paymentIntents.list({
      customer: profile.stripe_customer_id,
      limit: 10
    });
    if (paymentIntents.data.length === 0) {
      return new Response(JSON.stringify({
        error: "No payment intents found for this customer"
      }), {
        status: 404,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    // Get the most recent successful payment
    const latestPayment = paymentIntents.data.filter((pi)=>pi.status === "succeeded").sort((a, b)=>b.created - a.created)[0];
    if (!latestPayment) {
      return new Response(JSON.stringify({
        error: "No successful payments found"
      }), {
        status: 404,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    // Get checkout session details if available
    let checkoutSession = null;
    if (latestPayment.metadata?.checkout_session_id) {
      try {
        checkoutSession = await stripe.checkout.sessions.retrieve(latestPayment.metadata.checkout_session_id);
      } catch (error) {
        console.log("Could not retrieve checkout session:", error.message);
      }
    }
    // Get customer details
    const customer = await stripe.customers.retrieve(profile.stripe_customer_id);
    // Prepare invoice data
    const invoiceData = {
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name
      },
      payment: {
        id: latestPayment.id,
        amount: latestPayment.amount / 100,
        amount_cents: latestPayment.amount,
        currency: latestPayment.currency,
        status: latestPayment.status,
        created: new Date(latestPayment.created * 1000).toISOString(),
        payment_method: latestPayment.payment_method_types?.[0] || "card"
      },
      checkout: checkoutSession ? {
        id: checkoutSession.id,
        membership_type: checkoutSession.metadata?.membership_type,
        months: checkoutSession.metadata?.months,
        product_id: checkoutSession.metadata?.product_id,
        price_id: checkoutSession.metadata?.price_id
      } : null,
      metadata: {
        user_id,
        source: "academy",
        generated_at: new Date().toISOString()
      }
    };
    console.log("✅ Stripe invoice data retrieved successfully:", {
      customer_id: customer.id,
      payment_id: latestPayment.id,
      amount: `$${invoiceData.payment.amount}`,
      membership_type: invoiceData.checkout?.membership_type
    });
    return new Response(JSON.stringify({
      success: true,
      invoice: invoiceData
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("💥 Error in get-stripe-invoice function:", error);
    return new Response(JSON.stringify({
      error: "Error retrieving Stripe invoice",
      details: error.message
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
