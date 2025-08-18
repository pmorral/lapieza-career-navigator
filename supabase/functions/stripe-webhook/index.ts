import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Configuración de productos para identificar servicios
const PRODUCTS = {
  // Membresías
  prod_SrQL4oLcpuKNV8: {
    name: "Academy 6-Month Membership",
    type: "membership",
    months: 6,
  },
  prod_SrQMnG1v3ilHY4: {
    name: "Academy 12-Month Membership",
    type: "membership",
    months: 12,
  },
  // Servicios adicionales
  prod_SrrFzevNeQh7HO: {
    name: "Asesoría General de Empleabilidad",
    type: "service",
    duration: "60 minutos",
  },
  prod_SrrGIYm0shK6wZ: {
    name: "Entrevista con Career Coach",
    type: "service",
    duration: "45 minutos",
  },
  prod_SrrG1esLfVgD0a: {
    name: "20 Vacantes Personalizadas",
    type: "service",
    duration: "48 horas",
  },
};
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Methods": "*",
};
// Initialize Stripe
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"), {
  apiVersion: "2024-12-18.acacia",
});
// Initialize Supabase
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Función para enviar emails
async function sendEmail(to: string, subject: string, htmlContent: string) {
  try {
    const { data, error } = await supabase.functions.invoke(
      "send-verification-code",
      {
        body: {
          to_email: to,
          subject: subject,
          html_content: htmlContent,
        },
      }
    );

    if (error) {
      console.error("❌ Error sending email:", error);
      return false;
    }

    console.log("✅ Email sent successfully to:", to);
    return true;
  } catch (error) {
    console.error("❌ Exception sending email:", error);
    return false;
  }
}

// Función para procesar pagos de membresía
async function handleMembershipPayment(session: any, productInfo: any) {
  console.log("💳 Processing membership payment");

  // Calcular fecha de expiración basada en el plan
  const months =
    productInfo?.months || parseInt(session.metadata.months || "6");
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + months);
  console.log("📅 Subscription expires at:", expiresAt.toISOString());

  // Definir créditos de entrevistas según el plan
  const interviewCredits = months >= 12 ? 10 : 5;
  console.log("🎫 Interview credits set to:", interviewCredits);

  // 1. Insertar en la tabla de suscripciones
  const { data: subscriptionData, error: subscriptionError } = await supabase
    .from("subscriptions")
    .insert({
      user_id: session.metadata.user_id,
      stripe_session_id: session.id,
      stripe_customer_id: session.customer,
      plan_type: session.metadata.membership_type || "6months",
      amount_paid: session.amount_total || 0,
      currency: session.currency || "usd",
      status: "active",
      started_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    })
    .select();

  if (subscriptionError) {
    console.error("❌ Error creating subscription:", subscriptionError);
  } else {
    console.log("✅ Subscription created successfully:", subscriptionData);
  }

  // 2. Actualizar la tabla de perfiles
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .update({
      subscription_status: "active",
      subscription_plan: session.metadata.membership_type || "premium",
      payment_completed_at: new Date().toISOString(),
      stripe_session_id: session.id,
      stripe_customer_id: session.customer,
      subscription_months: months,
      interview_credits: interviewCredits,
    })
    .eq("user_id", session.metadata.user_id)
    .select();

  if (profileError) {
    console.error("❌ Error updating user profile:", profileError);
  } else {
    console.log("✅ User profile updated successfully:", profileData);
  }
}

// Función para procesar pagos de servicios adicionales
async function handleServicePayment(session: any, productInfo: any) {
  console.log("🛠️ Processing service payment");

  // 1. Actualizar el pago en la tabla payments
  const { data: paymentData, error: paymentError } = await supabase
    .from("payments")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      stripe_payment_intent_id: session.payment_intent,
    })
    .eq("stripe_session_id", session.id)
    .select();

  if (paymentError) {
    console.error("❌ Error updating payment:", paymentError);
  } else {
    console.log("✅ Payment updated successfully:", paymentData);
  }

  // 2. Guardar el servicio en la tabla de servicios (si existe) o crear una nueva tabla
  const { data: serviceData, error: serviceError } = await supabase
    .from("services")
    .insert({
      user_id: session.metadata.user_id,
      stripe_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent,
      service_name: productInfo.name,
      service_type: productInfo.type,
      duration: productInfo.duration,
      amount_paid: session.amount_total || 0,
      currency: session.currency || "usd",
      status: "active",
      purchased_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 días para agendar
      metadata: {
        product_id: session.line_items?.data?.[0]?.price?.product,
        service_id: session.metadata.service_id,
        customer_email: session.customer_details?.email,
        customer_name: session.customer_details?.name,
      },
    })
    .select();

  if (serviceError) {
    console.error("❌ Error creating service record:", serviceError);
  } else {
    console.log("✅ Service record created successfully:", serviceData);
  }

  // 3. Obtener información del usuario
  const { data: userData, error: userError } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("user_id", session.metadata.user_id)
    .single();

  if (userError) {
    console.error("❌ Error getting user data:", userError);
    return;
  }

  // 4. Enviar email al candidato
  const candidateEmailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">¡Pago Exitoso!</h2>
      <p>Hola ${userData.full_name || "Usuario"},</p>
      <p>Tu pago por el servicio <strong>${
        productInfo.name
      }</strong> ha sido procesado exitosamente.</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Detalles del servicio:</h3>
        <ul>
          <li><strong>Servicio:</strong> ${productInfo.name}</li>
          <li><strong>Duración:</strong> ${productInfo.duration}</li>
          <li><strong>Monto:</strong> $${(session.amount_total / 100).toFixed(
            2
          )} USD</li>
        </ul>
      </div>
      <p>El equipo de Academy by LaPieza se pondrá en contacto contigo en un plazo no mayor a 24 horas hábiles para agendar tu sesión y coordinar los detalles.</p>
      <p>Revisa tu correo electrónico (incluyendo la bandeja de spam) y/o WhatsApp para asegurar una comunicación oportuna.</p>
      <p>¡Gracias por confiar en nosotros!</p>
      <p>Saludos,<br>El equipo de Academy by LaPieza</p>
    </div>
  `;

  await sendEmail(
    userData.email,
    `Pago Exitoso - ${productInfo.name}`,
    candidateEmailHtml
  );

  // 5. Enviar email a tulia@lapieza.io
  const adminEmailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Nuevo Servicio Adicional Pagado</h2>
      <p>Se ha procesado un nuevo pago de servicio adicional:</p>
      <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
        <h3 style="margin-top: 0;">Detalles del pago:</h3>
        <ul>
          <li><strong>Cliente:</strong> ${userData.full_name || "N/A"}</li>
          <li><strong>Email:</strong> ${userData.email}</li>
          <li><strong>Servicio:</strong> ${productInfo.name}</li>
          <li><strong>Duración:</strong> ${productInfo.duration}</li>
          <li><strong>Monto:</strong> $${(session.amount_total / 100).toFixed(
            2
          )} USD</li>
          <li><strong>ID de Sesión:</strong> ${session.id}</li>
          <li><strong>Fecha:</strong> ${new Date().toLocaleString("es-ES")}</li>
        </ul>
      </div>
      <p>Por favor, contacta al cliente en las próximas 24 horas hábiles para agendar la sesión.</p>
    </div>
  `;

  await sendEmail(
    "tulia@lapieza.io",
    `Nuevo Servicio Pagado - ${productInfo.name}`,
    adminEmailHtml
  );

  console.log("✅ Service payment processed and emails sent");
}
serve(async (req) => {
  console.log("🔔 Webhook request received:", {
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
  });
  // Log all headers for debugging
  const headers = Object.fromEntries(req.headers.entries());
  console.log("📋 All request headers:", headers);
  if (req.method === "OPTIONS") {
    console.log("✅ OPTIONS request handled");
    return new Response(null, {
      headers: corsHeaders,
    });
  }
  if (req.method !== "POST") {
    console.log("❌ Method not allowed:", req.method);
    return new Response(
      JSON.stringify({
        error: "Method not allowed",
        method: req.method,
        allowed: "POST, OPTIONS",
      }),
      {
        status: 405,
        headers: corsHeaders,
      }
    );
  }
  try {
    // Check if we have the required environment variables
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    console.log("🔐 Environment check:", {
      has_webhook_secret: !!webhookSecret,
      has_stripe_key: !!stripeKey,
      webhook_secret_length: webhookSecret?.length || 0,
      stripe_key_length: stripeKey?.length || 0,
    });
    if (!webhookSecret) {
      console.error("❌ STRIPE_WEBHOOK_SECRET not configured");
      return new Response(
        JSON.stringify({
          error: "Webhook secret not configured",
          timestamp: new Date().toISOString(),
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }
    if (!stripeKey) {
      console.error("❌ STRIPE_SECRET_KEY not configured");
      return new Response(
        JSON.stringify({
          error: "Stripe key not configured",
          timestamp: new Date().toISOString(),
        }),
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }
    // Get the signature header
    const signature = req.headers.get("stripe-signature");
    console.log("🔍 Stripe signature check:", {
      has_signature: !!signature,
      signature_length: signature?.length || 0,
      signature_preview: signature
        ? `${signature.substring(0, 20)}...`
        : "none",
    });
    if (!signature) {
      console.error("❌ No stripe-signature header found");
      console.error("Available headers:", Object.keys(headers));
      return new Response(
        JSON.stringify({
          error: "No signature provided",
          available_headers: Object.keys(headers),
          required_header: "stripe-signature",
          timestamp: new Date().toISOString(),
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }
    // Get the request body
    const body = await req.text();
    console.log("📦 Request body info:", {
      body_length: body.length,
      body_preview: body.substring(0, 200) + "...",
      content_type: req.headers.get("content-type"),
    });
    // Try to verify the webhook signature
    let event;
    try {
      console.log("🔐 Attempting to verify webhook signature...");
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret
      );
      console.log("✅ Webhook signature verified successfully");
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", {
        error: err.message,
        signature_length: signature.length,
        body_length: body.length,
        secret_length: webhookSecret.length,
      });
      return new Response(
        JSON.stringify({
          error: "Invalid signature",
          details: err.message,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }
    // Log the verified event
    console.log("📦 Verified webhook event:", {
      type: event.type,
      id: event.id,
      created: event.created,
      object: event.object,
    });
    // Handle the event based on type
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        console.log("✅ Processing checkout.session.completed:", {
          session_id: session.id,
          customer_id: session.customer,
          amount_total: session.amount_total,
          metadata: session.metadata,
        });

        if (session.metadata?.user_id) {
          try {
            // Obtener información del producto
            let productInfo = null;
            let productType = "unknown";

            // Obtener la sesión completa con line_items expandidos
            const expandedSession = await stripe.checkout.sessions.retrieve(
              session.id,
              {
                expand: ["line_items"],
              }
            );

            console.log("📦 Expanded session line_items:", {
              has_line_items: !!expandedSession.line_items,
              line_items_count: expandedSession.line_items?.data?.length || 0,
            });

            // Buscar el producto en los line_items
            if (
              expandedSession.line_items?.data &&
              expandedSession.line_items.data.length > 0
            ) {
              const lineItem = expandedSession.line_items.data[0];
              console.log("📦 Line item details:", {
                price_id: lineItem.price?.id,
                product_id: lineItem.price?.product,
                description: lineItem.description,
              });

              if (lineItem.price?.product) {
                const productId =
                  typeof lineItem.price.product === "string"
                    ? lineItem.price.product
                    : lineItem.price.product.id;
                productInfo = PRODUCTS[productId];
                if (productInfo) {
                  productType = productInfo.type;
                  console.log("📦 Product identified:", {
                    product_id: productId,
                    product_name: productInfo.name,
                    product_type: productInfo.type,
                  });
                } else {
                  console.warn(
                    "⚠️ Product not found in PRODUCTS config:",
                    productId
                  );
                }
              }
            }

            // Fallback: intentar identificar por metadata
            if (productType === "unknown" && session.metadata.membership_type) {
              const membershipType = session.metadata.membership_type;
              if (
                membershipType === "6months" ||
                membershipType === "12months"
              ) {
                productInfo = PRODUCTS[membershipType];
                productType = "membership";
                console.log("📦 Product identified from metadata:", {
                  membership_type: membershipType,
                  product_name: productInfo?.name,
                  product_type: productType,
                });
              }
            }

            if (productType === "membership") {
              // Procesar membresía
              await handleMembershipPayment(session, productInfo);
            } else if (productType === "service") {
              // Procesar servicio adicional
              await handleServicePayment(session, productInfo);
            } else {
              console.warn("⚠️ Unknown product type:", productType);
              console.log("📦 Available metadata:", session.metadata);
              console.log("📦 Available PRODUCTS keys:", Object.keys(PRODUCTS));
            }
          } catch (updateError) {
            console.error("❌ Exception processing payment:", updateError);
          }
        } else {
          console.warn("⚠️ No user_id in session metadata:", session.metadata);
        }
        break;
      }
      default:
        console.log("ℹ️ Unhandled event type:", event.type);
    }
    console.log("✅ Webhook processed successfully");
    return new Response(
      JSON.stringify({
        received: true,
        event_type: event.type,
        event_id: event.id,
        processed_at: new Date().toISOString(),
      }),
      {
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("💥 Unexpected error in webhook:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
    });
    return new Response(
      JSON.stringify({
        error: "Webhook processing failed",
        details: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});
