import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};
// Initialize Stripe
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"), {
  apiVersion: "2024-12-18.acacia",
});
// Product configuration - using production products
const PRODUCTS = {
  "6months": {
    id: "prod_SvldrwtrNzfFn1",
    name: "Academy 6-Month Membership",
    price: 14900,
    months: 6,
    description: "Acceso completo a Academy por 6 meses",
    features: [
      "Acceso completo a todas las herramientas por 6 meses",
      "Sesiones grupales cada 2 semanas",
      "Templates profesionales",
      "Actualizaciones gratuitas",
      "Soporte prioritario",
      "Comunidad exclusiva",
    ],
  },
  "12months": {
    id: "prod_SvlfRUPYDiOlEv",
    name: "Academy 12-Month Membership",
    price: 19900,
    months: 12,
    description: "Acceso completo a Academy por 12 meses",
    features: [
      "Acceso completo a todas las herramientas por 12 meses",
      "Sesiones grupales cada 2 semanas",
      "Templates profesionales",
      "Actualizaciones gratuitas",
      "Soporte prioritario",
      "Comunidad exclusiva",
      "2 meses adicionales gratis",
    ],
  },
};
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }
  try {
    const plans = Object.entries(PRODUCTS).map(([key, product]) => ({
      id: key,
      name: product.name,
      price: product.price / 100,
      price_cents: product.price,
      months: product.months,
      description: product.description,
      features: product.features,
      currency: "USD",
      popular: key === "12months",
      savings: key === "12months" ? 149 * 2 - 199 : 0,
    }));
    console.log("✅ Stripe plans retrieved successfully:", {
      count: plans.length,
      plans: plans.map((p) => ({
        id: p.id,
        name: p.name,
        price: `$${p.price}`,
      })),
    });
    return new Response(
      JSON.stringify({
        success: true,
        plans,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("💥 Error in get-stripe-plans function:", error);
    return new Response(
      JSON.stringify({
        error: "Error retrieving Stripe plans",
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
