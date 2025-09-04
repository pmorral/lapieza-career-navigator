import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Initialize Stripe
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"), {
  apiVersion: "2024-12-18.acacia",
});

// Initialize Supabase
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Product configuration - using existing products
const PRODUCTS = {
  // Membresías
  "6months": {
    id: "prod_SvldrwtrNzfFn1",
    name: "Academy 6-Month Membership",
    price: 14900,
    months: 6,
    type: "membership",
  },
  "12months": {
    id: "prod_SvlfRUPYDiOlEv",
    name: "Academy 12-Month Membership",
    price: 19900,
    months: 12,
    type: "membership",
  },
  // Servicios adicionales
  consultation: {
    id: "prod_SvlhK9ysej83lH",
    name: "Asesoría General de Empleabilidad",
    price: 15000,
    duration: "60 minutos",
    type: "service",
  },
  "interview-45": {
    id: "prod_SvlgrTbgc3irnc",
    name: "Entrevista con Career Coach",
    price: 10000,
    duration: "45 minutos",
    type: "service",
  },
  "job-vacancies": {
    id: "prod_SvlgvWI3gsj8Qf",
    name: "20 Vacantes Personalizadas",
    price: 10000,
    duration: "48 horas",
    type: "service",
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    const {
      user_id,
      email,
      full_name,
      success_url,
      cancel_url,
      membership_type = "6months",
      service_id,
    } = await req.json();

    if (!user_id || !email || !success_url || !cancel_url) {
      return new Response(
        JSON.stringify({
          error: "user_id, email, success_url, and cancel_url are required",
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

    // Determinar el tipo de producto (membresía o servicio)
    let productType = "membership";
    let productKey = membership_type;

    if (service_id) {
      productType = "service";
      productKey = service_id;
    }

    // Validar que el producto existe
    if (!PRODUCTS[productKey]) {
      return new Response(
        JSON.stringify({
          error: `Invalid ${productType}_id. Available options:`,
          available_products: Object.keys(PRODUCTS).filter(
            (key) => PRODUCTS[key].type === productType
          ),
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

    const selectedProduct = PRODUCTS[productKey];

    // Get or create Stripe customer
    let customer;
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("user_id", user_id)
      .single();

    if (profile?.stripe_customer_id) {
      customer = await stripe.customers.retrieve(profile.stripe_customer_id);
    } else {
      customer = await stripe.customers.create({
        email,
        name: full_name,
        metadata: {
          user_id,
          source: "academy",
        },
      });
      // Update profile with Stripe customer ID
      await supabase
        .from("profiles")
        .update({
          stripe_customer_id: customer.id,
        })
        .eq("user_id", user_id);
    }

    // Crear sesión de checkout
    let session;

    if (productType === "service") {
      // Lógica de descuento interno para primera compra de Asesoría General
      let discountsParam: Array<{ coupon: string }> | undefined = undefined;
      let effectiveUnitAmount = selectedProduct.price; // en centavos

      if (productKey === "consultation") {
        // Verificar si el usuario ya compró este servicio previamente (completado)
        const { data: previousPayments, error: previousError } = await supabase
          .from("payments")
          .select("id")
          .eq("user_id", user_id)
          .eq("payment_type", "service")
          .eq("status", "completed")
          .eq("description", selectedProduct.name)
          .limit(1);

        const isFirstTime =
          !previousError &&
          (!previousPayments || previousPayments.length === 0);

        if (isFirstTime) {
          try {
            let couponId = Deno.env.get("CONSULTATION_FIRST_TIME_50_COUPON_ID");

            // Si no hay un cupón configurado por env, crear uno (50% una sola vez)
            if (!couponId) {
              // Intentar encontrar uno existente por nombre (lista limitada)
              const existing = await stripe.coupons.list({ limit: 100 });
              const found = existing.data.find(
                (c: any) =>
                  c.name === "CONSULTATION_FIRST_TIME_50" &&
                  c.percent_off === 50 &&
                  c.valid
              );
              if (found) {
                couponId = found.id;
              } else {
                const created = await stripe.coupons.create({
                  name: "CONSULTATION_FIRST_TIME_50",
                  percent_off: 50,
                  duration: "once",
                });
                couponId = created.id;
              }
            }

            if (couponId) {
              discountsParam = [{ coupon: couponId }];
              // Para nuestro registro interno, reflejar el monto con descuento
              effectiveUnitAmount = Math.round(selectedProduct.price / 2);
            }
          } catch (err) {
            console.error("❌ Error ensuring discount coupon:", err);
          }
        }
      }

      // Para servicios, crear directamente con price_data
      session = await stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: selectedProduct.name,
                description: selectedProduct.duration,
              },
              unit_amount: selectedProduct.price,
            },
            quantity: 1,
          },
        ],
        // Aplicar descuento interno sólo si corresponde
        discounts: discountsParam,
        mode: "payment",
        success_url: success_url,
        cancel_url: cancel_url,
        metadata: {
          user_id,
          source: "academy",
          service_id: productKey,
          service_type: "additional_service",
        },
        billing_address_collection: "auto",
        customer_update: {
          address: "auto",
          name: "auto",
        },
      });

      // Registrar el pago en la base de datos
      await supabase.from("payments").insert({
        user_id: user_id,
        stripe_session_id: session.id,
        amount: (effectiveUnitAmount ?? selectedProduct.price) / 100, // Convertir de centavos a dólares
        currency: "USD",
        status: "pending",
        payment_type: "service",
        description: selectedProduct.name,
      });
    } else {
      // Para membresías, usar el flujo existente
      let price;
      try {
        // First try to find existing price for this product
        const prices = await stripe.prices.list({
          product: selectedProduct.id,
          active: true,
        });
        if (prices.data.length > 0) {
          price = prices.data[0];
          console.log("✅ Existing price found:", price.id);
        } else {
          // Create new price if none exists
          console.log("💰 Creating new price for product:", selectedProduct.id);
          price = await stripe.prices.create({
            product: selectedProduct.id,
            unit_amount: selectedProduct.price,
            currency: "usd",
            metadata: {
              source: "academy",
              membership_type,
              months: selectedProduct.months.toString(),
            },
          });
          console.log("✅ New price created:", price.id);
        }
      } catch (error) {
        console.error("Error with product/price:", error);
        return new Response(
          JSON.stringify({
            error: "Error accessing Stripe product or price",
            details: error.message,
            product_id: selectedProduct.id,
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

      session = await stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ["card"],
        line_items: [
          {
            price: price.id,
            quantity: 1,
          },
        ],
        mode: "payment",
        // Permitir que el usuario ingrese un código de promoción en Stripe Checkout (solo membresías)
        allow_promotion_codes: true,
        success_url: success_url,
        cancel_url: cancel_url,
        metadata: {
          user_id,
          source: "academy",
          product_id: selectedProduct.id,
          price_id: price.id,
          membership_type,
          months: selectedProduct.months.toString(),
        },
        billing_address_collection: "auto",
        customer_update: {
          address: "auto",
          name: "auto",
        },
      });
    }

    console.log("✅ Checkout session created successfully:", {
      session_id: session.id,
      product_type: productType,
      product_key: productKey,
      customer_id: customer.id,
      price: `$${(selectedProduct.price / 100).toFixed(2)}`,
    });

    return new Response(
      JSON.stringify({
        success: true,
        session_id: session.id,
        checkout_url: session.url,
        customer_id: customer.id,
        product_type: productType,
        product_key: productKey,
        price: selectedProduct.price,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("💥 Error in create-checkout-session function:", error);
    return new Response(
      JSON.stringify({
        error: "Error creating checkout session",
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
