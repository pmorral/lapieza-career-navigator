// supabase/functions/create-checkout-session/index.ts
// Deno / Supabase Edge Function – Stripe vía REST (edge-safe)

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const STRIPE_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ====== Config de productos ======
const PRODUCTS: Record<string, any> = {
  // Membresías
  "6months": {
    id: "prod_SvldrwtrNzfFn1",
    name: "Academy 6-Month Membership",
    price: 14900, // cents
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
  // Servicios
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

// ====== Helper para llamar a Stripe REST ======
async function stripeRequest<T = any>(
  path: string,
  opts: RequestInit & { query?: Record<string, string | number | boolean> } = {}
): Promise<T> {
  const base = "https://api.stripe.com/v1";
  const headers: HeadersInit = {
    Authorization: `Bearer ${STRIPE_KEY}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };

  const query = opts.query
    ? "?" +
      Object.entries(opts.query)
        .map(
          ([k, v]) =>
            `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`
        )
        .join("&")
    : "";

  const body =
    typeof opts.body === "string" || opts.body == null
      ? opts.body
      : new URLSearchParams(opts.body as Record<string, string>).toString();

  const res = await fetch(`${base}${path}${query}`, {
    method: opts.method ?? "GET",
    headers,
    body,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      `Stripe ${opts.method ?? "GET"} ${path} ${res.status}: ${
        data.error?.message ?? JSON.stringify(data)
      }`
    );
  }
  return data as T;
}

// ====== Utilidades Stripe REST ======
async function getOrCreateCustomer(
  email: string,
  name: string | null,
  userId: string
) {
  // Busca en tu DB
  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .single();

  if (profile?.stripe_customer_id) {
    // Devuelve estructura mínima
    return { id: profile.stripe_customer_id };
  }

  // Crea en Stripe
  const created = await stripeRequest<{ id: string }>("/customers", {
    method: "POST",
    body: {
      email,
      ...(name ? { name } : {}),
      "metadata[user_id]": userId,
      "metadata[source]": "academy",
    },
  });

  // Guarda en tu DB
  await supabase
    .from("profiles")
    .update({ stripe_customer_id: created.id })
    .eq("user_id", userId);

  return created;
}

async function findActivePrice(productId: string) {
  const list = await stripeRequest<{ data: Array<{ id: string }> }>("/prices", {
    query: { product: productId, active: true, limit: 1 },
  });
  return list.data[0]?.id ?? null;
}

async function createPrice(
  productId: string,
  unitAmount: number,
  months?: number,
  membershipType?: string
) {
  const created = await stripeRequest<{ id: string }>("/prices", {
    method: "POST",
    body: {
      product: productId,
      currency: "usd",
      unit_amount: String(unitAmount),
      "metadata[source]": "academy",
      ...(membershipType
        ? { "metadata[membership_type]": membershipType }
        : {}),
      ...(months ? { "metadata[months]": String(months) } : {}),
    },
  });
  return created.id;
}

async function ensureFirstTimeConsultationDiscount(): Promise<string | null> {
  let couponId = Deno.env.get("CONSULTATION_FIRST_TIME_50_COUPON_ID") ?? null;
  if (couponId) return couponId;

  // Intenta encontrar uno existente con ese nombre
  const list = await stripeRequest<{
    data: Array<{
      id: string;
      name: string;
      percent_off: number;
      valid: boolean;
    }>;
  }>("/coupons", { query: { limit: 100 } });
  const found = list.data.find(
    (c) =>
      c.name === "CONSULTATION_FIRST_TIME_50" && c.percent_off === 50 && c.valid
  );
  if (found) return found.id;

  // Crea uno
  const created = await stripeRequest<{ id: string }>("/coupons", {
    method: "POST",
    body: {
      name: "CONSULTATION_FIRST_TIME_50",
      percent_off: "50",
      duration: "once",
    },
  });
  return created.id;
}

// ====== Servidor ======
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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
          error: "user_id, email, success_url y cancel_url son requeridos",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Decidir producto
    let productType: "membership" | "service" = "membership";
    let productKey = membership_type;
    if (service_id) {
      productType = "service";
      productKey = service_id;
    }

    const selected = PRODUCTS[productKey];
    if (!selected) {
      return new Response(
        JSON.stringify({
          error: `ID de ${productType} inválido.`,
          available_products: Object.keys(PRODUCTS).filter(
            (k) => PRODUCTS[k].type === productType
          ),
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Cliente de Stripe
    const customer = await getOrCreateCustomer(
      email,
      full_name ?? null,
      user_id
    );

    // ====== Crear sesión para SERVICIO (price_data) ======
    if (productType === "service") {
      let discountsBody: string[] | undefined = undefined;
      let effectiveUnitAmount = selected.price;

      if (productKey === "consultation") {
        // ¿Es primera compra completada de este servicio?
        const { data: prev, error: prevErr } = await supabase
          .from("payments")
          .select("id")
          .eq("user_id", user_id)
          .eq("payment_type", "service")
          .eq("status", "completed")
          .eq("description", selected.name)
          .limit(1);

        const isFirstTime = !prevErr && (!prev || prev.length === 0);
        if (isFirstTime) {
          try {
            const couponId = await ensureFirstTimeConsultationDiscount();
            if (couponId) {
              discountsBody = [
                `discounts[0][coupon]=${encodeURIComponent(couponId)}`,
              ];
              effectiveUnitAmount = Math.round(selected.price / 2);
            }
          } catch (e) {
            console.error("Error creando/obteniendo cupón:", e);
          }
        }
      }

      // Construir body x-www-form-urlencoded
      const form: string[] = [
        `customer=${encodeURIComponent(customer.id)}`,
        "mode=payment",
        `success_url=${encodeURIComponent(success_url)}`,
        `cancel_url=${encodeURIComponent(cancel_url)}`,
        "payment_method_types[0]=card",
        // line_items
        "line_items[0][quantity]=1",
        `line_items[0][price_data][currency]=usd`,
        `line_items[0][price_data][unit_amount]=${selected.price}`,
        `line_items[0][price_data][product_data][name]=${encodeURIComponent(
          selected.name
        )}`,
        selected.duration
          ? `line_items[0][price_data][product_data][description]=${encodeURIComponent(
              selected.duration
            )}`
          : "",
        // Consentimiento de TyC (mostrará checkbox)
        "consent_collection[terms_of_service]=required",
        // Texto personalizado con URL (Stripe lo muestra junto al checkbox)
        `custom_text[terms_of_service_acceptance][message]=${encodeURIComponent(
          "Acepto los términos y condiciones de este servicio: https://talento.lapieza.io/terms-and-conditions-aditional-services"
        )}`,
        // Metadata
        `metadata[user_id]=${encodeURIComponent(user_id)}`,
        "metadata[source]=academy",
        `metadata[service_id]=${encodeURIComponent(productKey)}`,
        "metadata[service_type]=additional_service",
        // Customer update
        "customer_update[address]=auto",
        "customer_update[name]=auto",
        // Billing
        "billing_address_collection=auto",
      ].filter(Boolean) as string[];

      if (discountsBody) form.push(...discountsBody);

      const session = await stripeRequest<{ id: string; url: string }>(
        "/checkout/sessions",
        {
          method: "POST",
          body: form.join("&"),
        }
      );

      // Registrar pago "pending"
      await supabase.from("payments").insert({
        user_id,
        stripe_session_id: session.id,
        amount: (effectiveUnitAmount ?? selected.price) / 100,
        currency: "USD",
        status: "pending",
        payment_type: "service",
        description: selected.name,
      });

      return new Response(
        JSON.stringify({
          success: true,
          session_id: session.id,
          checkout_url: session.url,
          customer_id: customer.id,
          product_type: productType,
          product_key: productKey,
          price: selected.price,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ====== Crear sesión para MEMBRESÍA (price existente o crear)
    let priceId = await findActivePrice(selected.id);
    if (!priceId) {
      priceId = await createPrice(
        selected.id,
        selected.price,
        selected.months,
        productKey
      );
    }

    const bodyMembership = [
      `customer=${encodeURIComponent(customer.id)}`,
      "mode=payment",
      `success_url=${encodeURIComponent(success_url)}`,
      `cancel_url=${encodeURIComponent(cancel_url)}`,
      "payment_method_types[0]=card",
      `line_items[0][price]=${encodeURIComponent(priceId)}`,
      "line_items[0][quantity]=1",
      // Permitir cupones de promoción
      "allow_promotion_codes=true",
      // Metadata
      `metadata[user_id]=${encodeURIComponent(user_id)}`,
      "metadata[source]=academy",
      `metadata[product_id]=${encodeURIComponent(selected.id)}`,
      `metadata[price_id]=${encodeURIComponent(priceId)}`,
      `metadata[membership_type]=${encodeURIComponent(productKey)}`,
      `metadata[months]=${encodeURIComponent(String(selected.months))}`,
      // Customer update / billing
      "customer_update[address]=auto",
      "customer_update[name]=auto",
      "billing_address_collection=auto",
    ].join("&");

    const session = await stripeRequest<{ id: string; url: string }>(
      "/checkout/sessions",
      {
        method: "POST",
        body: bodyMembership,
      }
    );

    return new Response(
      JSON.stringify({
        success: true,
        session_id: session.id,
        checkout_url: session.url,
        customer_id: customer.id,
        product_type: productType,
        product_key: productKey,
        price: selected.price,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("💥 Error in create-checkout-session:", error);
    return new Response(
      JSON.stringify({
        error: "Error creating checkout session",
        details: String(error?.message ?? error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
