import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, password, full_name, whatsapp } = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "email and password are required",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Crear usuario confirmado (sin enviar email de verificación)
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: full_name || null,
        whatsapp: whatsapp || null,
      },
    });

    if (error) {
      console.error("Error creating user:", error);

      // Detectar si el usuario ya existe
      const errorMessage = error.message.toLowerCase();
      if (
        errorMessage.includes("already registered") ||
        errorMessage.includes("user already exists") ||
        errorMessage.includes("already exists") ||
        errorMessage.includes("duplicate") ||
        errorMessage.includes("email already") ||
        error.code === "user_already_exists"
      ) {
        return new Response(
          JSON.stringify({
            success: false,
            user_exists: true,
            error: "User already registered",
            code: "USER_ALREADY_EXISTS",
            message: "Este email ya está registrado en nuestra plataforma",
          }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: error.message,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Crear o actualizar el perfil del usuario con WhatsApp
    if (data.user?.id) {
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          user_id: data.user.id,
          full_name: full_name || null,
          email: email,
          whatsapp: whatsapp || null,
        },
        {
          onConflict: "user_id",
        }
      );

      if (profileError) {
        console.error("Error updating profile:", profileError);
        // No fallamos si hay error en el perfil, solo lo registramos
      }
    }

    return new Response(
      JSON.stringify({ success: true, user_id: data.user?.id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("admin-signup error:", e);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
