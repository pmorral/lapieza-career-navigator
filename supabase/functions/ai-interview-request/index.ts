import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { v4 as uuidv4 } from "https://esm.sh/uuid@10.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  console.log(
    "🚀 AI Interview Request function called with method:",
    req.method
  );

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("📋 Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("📝 Starting form data processing...");
    const formData = await req.formData();

    const jobTitle = formData.get("jobTitle") as string;
    const jobDescription = formData.get("jobDescription") as string;
    const cvFile = formData.get("cv") as File;
    const fullname = formData.get("fullname") as string;
    const language = (formData.get("language") as string) || "es";
    const user_id = formData.get("user_id") as string;

    if (!fullname || !jobTitle || !jobDescription || !cvFile || !user_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get user email from auth.users table
    console.log("🔍 Getting user data for user_id:", user_id);
    const { data: userData, error: userError } =
      await supabase.auth.admin.getUserById(user_id);

    if (userError || !userData.user) {
      console.error("Error getting user data:", userError);
      return new Response(JSON.stringify({ error: "Usuario no encontrado" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("👤 User data retrieved:", {
      id: userData.user.id,
      email: userData.user.email,
      hasEmail: !!userData.user.email,
    });

    const email = userData.user.email;

    if (!email) {
      console.error("User has no email:", userData.user);
      return new Response(
        JSON.stringify({ error: "Usuario no tiene email registrado" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate file type
    if (cvFile.type !== "application/pdf") {
      return new Response(
        JSON.stringify({ error: "Solo se permiten archivos PDF" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate file size (2MB = 2 * 1024 * 1024 bytes)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (cvFile.size > maxSize) {
      return new Response(
        JSON.stringify({ error: "El archivo no puede ser mayor a 2MB" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("📁 Uploading CV to Supabase bucket...");

    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `cv-${user_id}-${uuidv4()}.pdf`;

    // Upload file to Supabase bucket
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("cv-interview")
      .upload(filename, cvFile, {
        contentType: "application/pdf",
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Error uploading file to bucket:", uploadError);
      return new Response(
        JSON.stringify({ error: "Error al subir el archivo" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("✅ File uploaded successfully:", uploadData.path);

    // Generate signed URL with 1 week expiration
    const expiresIn = 60 * 60 * 24 * 7; // 1 week in seconds
    const { data: urlData, error: urlError } = await supabase.storage
      .from("cv-interview")
      .createSignedUrl(filename, expiresIn);

    if (urlError) {
      console.error("Error generating signed URL:", urlError);
      return new Response(
        JSON.stringify({ error: "Error al generar la URL del archivo" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("🔗 Generated signed URL with 1 week expiration");

    // Prepare payload for LaPieza API
    const payload = {
      job_title: jobTitle,
      job_description: jobDescription,
      cv_content: "", // No longer sending content directly
      cv_url: urlData.signedUrl, // Sending the signed URL instead
      fullname,
      language: language,
      enabled_webhook: false,
      source: "academy",
    };

    console.log("Sending request to LaPieza API:", {
      job_title: payload.job_title,
      fullname: payload.fullname,
      user_id,
      language: payload.language,
      has_cv_url: !!payload.cv_url,
      cv_filename: filename,
    });

    // Send to LaPieza API
    const response = await fetch(
      "https://interview-api.lapieza.io/api/v1/interview",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();
    console.log("LaPieza API response:", result);

    // Check if the API returned success: false
    if (!result.success) {
      console.error("LaPieza API error:", {
        status: response.status,
        statusText: response.statusText,
        body: result,
        headers: Object.fromEntries(response.headers.entries()),
      });
      throw new Error(
        `LaPieza API error: ${result.message || "Error desconocido"}`
      );
    }

    // Save interview data to database
    console.log("💾 Saving interview data to database...");
    console.log("📊 Data to insert:", {
      user_id,
      interview_request_id: result.interview_request_id,
      task_id: result.task_id,
      candidate_id: result.candidate_id,
      interview_id: result.interview_id,
      job_title: jobTitle,
      job_description: jobDescription?.substring(0, 100) + "...",
      fullname,
      email,
      language,
      cv_filename: filename,
      cv_url: urlData.signedUrl?.substring(0, 50) + "...",
      status: result.status,
      api_message: result.message,
      source: "academy",
    });

    const { data: interviewData, error: dbError } = await supabase
      .from("interviews")
      .insert({
        user_id: user_id,
        interview_request_id: result.interview_request_id,
        task_id: result.task_id,
        candidate_id: result.candidate_id,
        interview_id: result.interview_id,
        job_title: jobTitle,
        job_description: jobDescription,
        fullname: fullname,
        email: email,
        language: language,
        cv_filename: filename,
        cv_url: urlData.signedUrl,
        status: result.status,
        api_message: result.message,
        source: "academy",
      })
      .select()
      .single();

    if (dbError) {
      console.error("Error saving to database:", dbError);
      // Don't fail the request, just log the error
      // The interview was still created successfully in LaPieza
    } else {
      console.log("✅ Interview data saved to database:", interviewData.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Solicitud enviada exitosamente",
        data: {
          interview_request_id: result.interview_request_id,
          task_id: result.task_id,
          candidate_id: result.candidate_id,
          interview_id: result.interview_id,
          status: result.status,
          api_message: result.message,
          db_id: interviewData?.id || null,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in ai-interview-request function:", error);
    return new Response(
      JSON.stringify({
        error: "Error al procesar la solicitud",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
