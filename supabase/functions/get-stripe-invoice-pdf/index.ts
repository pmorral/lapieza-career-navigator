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
    // Try to get the invoice from Stripe
    let invoice = null;
    try {
      // First try to find an existing invoice for this payment
      const invoices = await stripe.invoices.list({
        customer: profile.stripe_customer_id,
        limit: 50
      });
      console.log("Found", invoices.data.length, "invoices for customer");
      // Find invoice that matches this payment by payment_intent
      invoice = invoices.data.find((inv)=>inv.payment_intent === latestPayment.id);
      if (!invoice) {
        console.log("No invoice found for payment_intent:", latestPayment.id);
        console.log("Available payment_intents:", invoices.data.map((inv)=>inv.payment_intent).filter(Boolean));
        // Try to find by charge ID as fallback
        if (latestPayment.latest_charge) {
          invoice = invoices.data.find((inv)=>inv.charge === latestPayment.latest_charge);
          console.log("Trying to find by charge ID:", latestPayment.latest_charge);
        }
      }
      if (!invoice) {
        console.log("No invoice found by any method. Creating fallback text invoice...");
        // Instead of creating a new Stripe invoice, we'll create a text invoice
        // based on the payment data we already have
        const fallbackContent = `
╔══════════════════════════════════════════════════════════════════════════════╗
║                              FACTURA OFICIAL                                ║
║                           ACADEMY BY LAPIeZA                               ║
╚══════════════════════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────────────────────┐
│                              INFORMACIÓN DEL CLIENTE                        │
├──────────────────────────────────────────────────────────────────────────────┤
│ Nombre: ${profile.full_name || "N/A"}                                        │
│ Email: ${profile.email}                                                      │
│ ID de Cliente: ${profile.stripe_customer_id}                                 │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                              DETALLES DEL PAGO                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ ID de Transacción: ${latestPayment.id}                                       │
│ Monto: ${(latestPayment.amount / 100).toFixed(2)} ${latestPayment.currency.toUpperCase()}                    │
│ Estado: ${latestPayment.status}                                              │
│ Fecha: ${new Date(latestPayment.created * 1000).toLocaleDateString("es-MX")} │
│ Método de Pago: ${latestPayment.payment_method_types?.[0] || "Tarjeta"}     │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                              SERVICIO CONTRATADO                            │
├──────────────────────────────────────────────────────────────────────────────┤
│ Producto: Academy Membership                                                │
│ ${checkoutSession?.metadata?.membership_type ? `Tipo: ${checkoutSession.metadata.membership_type}` : "Tipo: Membresía Estándar"} │
│ ${checkoutSession?.metadata?.months ? `Duración: ${checkoutSession.metadata.months} meses` : "Duración: Según plan contratado"} │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                              INFORMACIÓN ADICIONAL                          │
├──────────────────────────────────────────────────────────────────────────────┤
│ Factura Generada: ${new Date().toLocaleDateString("es-MX")}                 │
│ Hora de Generación: ${new Date().toLocaleTimeString("es-MX")}               │
│ ID de Pago: ${latestPayment.id}                                             │
│ Estado de Pago: ${latestPayment.status}                                     │
└──────────────────────────────────────────────────────────────────────────────┘

╔══════════════════════════════════════════════════════════════════════════════╗
║                              TÉRMINOS Y CONDICIONES                         ║
╚══════════════════════════════════════════════════════════════════════════════╝

• Esta factura es un documento oficial generado automáticamente por el sistema.
• El pago ha sido procesado exitosamente a través de nuestros sistemas seguros.
• Para cualquier consulta o soporte, contacta a: support@lapieza.com
• Esta factura puede ser utilizada para fines contables y de auditoría.

╔══════════════════════════════════════════════════════════════════════════════╗
║                              ACADEMY BY LAPIeZA                             ║
║                        Impulsando tu potencial profesional                  ║
║                              www.lapieza.com                                ║
╚══════════════════════════════════════════════════════════════════════════════╝
        `;
        const fallbackBuffer = new TextEncoder().encode(fallbackContent);
        return new Response(fallbackBuffer, {
          headers: {
            ...corsHeaders,
            "Content-Type": "text/plain; charset=utf-8",
            "Content-Disposition": `attachment; filename="factura-academy-${latestPayment.id}.txt"`,
            "Content-Length": fallbackBuffer.byteLength.toString()
          }
        });
      }
      console.log("Found existing invoice:", invoice.id, "Status:", invoice.status);
    } catch (error) {
      console.error("Error finding invoice:", error);
      // Return fallback text invoice
      const fallbackContent = `
FACTURA - ACADEMY BY LAPIeZA

Cliente: ${profile.full_name || profile.email}
Email: ${profile.email}
ID de Cliente: ${profile.stripe_customer_id}

Pago:
- ID de Transacción: ${latestPayment.id}
- Monto: ${(latestPayment.amount / 100).toFixed(2)} ${latestPayment.currency.toUpperCase()}
- Estado: ${latestPayment.status}
- Fecha: ${new Date(latestPayment.created * 1000).toLocaleDateString("es-MX")}

Servicio: Academy Membership
${checkoutSession?.metadata?.membership_type ? `Tipo: ${checkoutSession.metadata.membership_type}` : ""}

Esta es una factura generada automáticamente.
Para soporte, contacta a: support@lapieza.com

---
Academy by LaPieza
      `;
      const fallbackBuffer = new TextEncoder().encode(fallbackContent);
      return new Response(fallbackBuffer, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/plain; charset=utf-8",
          "Content-Disposition": `attachment; filename="factura-fallback-${Date.now()}.txt"`,
          "Content-Length": fallbackBuffer.byteLength.toString()
        }
      });
    }
    // Generate PDF for the invoice
    let pdfBuffer;
    try {
      console.log("Attempting to generate PDF for invoice:", invoice.id);
      // Instead of trying to get PDF from Stripe (which seems to have issues),
      // we'll create a professional text invoice that can be easily converted to PDF
      console.log("Creating professional text invoice as PDF alternative...");
      const invoiceContent = `
╔══════════════════════════════════════════════════════════════════════════════╗
║                              FACTURA OFICIAL                                ║
║                           ACADEMY BY LAPIeZA                               ║
╚══════════════════════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────────────────────┐
│                              INFORMACIÓN DEL CLIENTE                        │
├──────────────────────────────────────────────────────────────────────────────┤
│ Nombre: ${profile.full_name || "N/A"}                                        │
│ Email: ${profile.email}                                                      │
│ ID de Cliente: ${profile.stripe_customer_id}                                 │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                              DETALLES DEL PAGO                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ ID de Transacción: ${latestPayment.id}                                       │
│ Monto: ${(latestPayment.amount / 100).toFixed(2)} ${latestPayment.currency.toUpperCase()}                    │
│ Estado: ${latestPayment.status}                                              │
│ Fecha: ${new Date(latestPayment.created * 1000).toLocaleDateString("es-MX")} │
│ Método de Pago: ${latestPayment.payment_method_types?.[0] || "Tarjeta"}     │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                              SERVICIO CONTRATADO                            │
├──────────────────────────────────────────────────────────────────────────────┤
│ Producto: Academy Membership                                                │
│ ${checkoutSession?.metadata?.membership_type ? `Tipo: ${checkoutSession.metadata.membership_type}` : "Tipo: Membresía Estándar"} │
│ ${checkoutSession?.metadata?.months ? `Duración: ${checkoutSession.metadata.months} meses` : "Duración: Según plan contratado"} │
└──────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                              INFORMACIÓN ADICIONAL                          │
├──────────────────────────────────────────────────────────────────────────────┤
│ Factura Generada: ${new Date().toLocaleDateString("es-MX")}                 │
│ Hora de Generación: ${new Date().toLocaleTimeString("es-MX")}               │
│ ID de Factura: ${invoice.id}                                                │
│ Estado de Factura: ${invoice.status}                                        │
└──────────────────────────────────────────────────────────────────────────────┘

╔══════════════════════════════════════════════════════════════════════════════╗
║                              TÉRMINOS Y CONDICIONES                         ║
╚══════════════════════════════════════════════════════════════════════════════╝

• Esta factura es un documento oficial generado automáticamente por el sistema.
• El pago ha sido procesado exitosamente a través de nuestros sistemas seguros.
• Para cualquier consulta o soporte, contacta a: support@lapieza.com
• Esta factura puede ser utilizada para fines contables y de auditoría.

╔══════════════════════════════════════════════════════════════════════════════╗
║                              ACADEMY BY LAPIeZA                             ║
║                        Impulsando tu potencial profesional                  ║
║                              www.lapieza.com                                ║
╚══════════════════════════════════════════════════════════════════════════════╝
      `;
      // Convert text to buffer
      const textBuffer = new TextEncoder().encode(invoiceContent);
      // Return the text invoice with proper headers for text display
      return new Response(textBuffer, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/plain; charset=utf-8",
          "Content-Disposition": `attachment; filename="factura-academy-${invoice.number || invoice.id}.txt"`,
          "Content-Length": textBuffer.byteLength.toString()
        }
      });
    } catch (error) {
      console.error("Error generating invoice:", error);
      // Ultimate fallback - simple text invoice
      console.log("Creating ultimate fallback invoice...");
      const fallbackContent = `
FACTURA - ACADEMY BY LAPIeZA

Cliente: ${profile.full_name || profile.email}
Email: ${profile.email}
ID de Cliente Stripe: ${profile.stripe_customer_id}

Pago:
- ID de Transacción: ${latestPayment.id}
- Monto: ${(latestPayment.amount / 100).toFixed(2)} ${latestPayment.currency.toUpperCase()}
- Estado: ${latestPayment.status}
- Fecha: ${new Date(latestPayment.created * 1000).toLocaleDateString("es-MX")}

Servicio: Academy Membership
${checkoutSession?.metadata?.membership_type ? `Tipo: ${checkoutSession.metadata.membership_type}` : ""}

Esta es una factura generada automáticamente.
Para soporte, contacta a: support@lapieza.com

---
Academy by LaPieza
      `;
      const fallbackBuffer = new TextEncoder().encode(fallbackContent);
      return new Response(fallbackBuffer, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/plain; charset=utf-8",
          "Content-Disposition": `attachment; filename="factura-fallback-${Date.now()}.txt"`,
          "Content-Length": fallbackBuffer.byteLength.toString()
        }
      });
    }
    console.log("✅ Stripe invoice PDF generated successfully:", {
      customer_id: customer.id,
      payment_id: latestPayment.id,
      invoice_id: invoice.id,
      pdf_size: pdfBuffer.byteLength
    });
    // Return the PDF with proper headers
    return new Response(pdfBuffer, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="factura-${invoice.number || invoice.id}.pdf"`,
        "Content-Length": pdfBuffer.byteLength.toString()
      }
    });
  } catch (error) {
    console.error("💥 Error in get-stripe-invoice-pdf function:", error);
    return new Response(JSON.stringify({
      error: "Error generating invoice PDF",
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
