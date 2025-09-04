import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, type = "trial_interview" } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration to 10 minutes from now
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    console.log("📝 Generated code:", {
      email,
      code,
      type,
      expiresAt: expiresAt.toISOString(),
    });

    // Store verification code in database
    const { data: insertData, error: dbError } = await supabase
      .from("verification_codes")
      .insert({
        email,
        code,
        type,
        expires_at: expiresAt.toISOString(),
      })
      .select();

    console.log("💾 Database insert result:", { insertData, dbError });

    if (dbError) {
      console.error("❌ Database error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to store verification code" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Send email with verification code
    const emailPayload = {
      email,
      templateID: "d-d60f5f78f1bb47a197487e23b27b321b", // You'll need to create this template
      bcc: [],
      replyTo: [],
      isHTML: false,
      attachments: [],
      data: {
        code,
        expires_in: "10 minutos",
      },
    };

    console.log("📤 Sending verification email to:", email);

    // Send email using your GCP function
    const emailResponse = await fetch(
      "https://us-central1-pieza-development.cloudfunctions.net/onlySendEmailSendgrid",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailPayload),
      }
    );

    if (!emailResponse) {
      console.error("❌ Email service error:", await emailResponse);
      // Don't fail the request if email fails, but log it
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Verification code sent successfully",
        data: {
          email,
          expires_at: expiresAt.toISOString(),
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("💥 Unexpected error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
