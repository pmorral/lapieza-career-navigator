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
    "🚀 Trial Interview Request function called with method:",
    req.method
  );

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("📋 Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("📝 Processing trial interview request...");

    // Parse form data
    const formData = await req.formData();

    // Extract form fields
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const whatsapp = formData.get("whatsapp") as string;
    const jobTitle = formData.get("jobTitle") as string;
    const jobDescription = formData.get("jobDescription") as string;
    const language = formData.get("language") as string;
    const cvFile = formData.get("cv") as File;

    console.log("📋 Form data received:", {
      firstName,
      lastName,
      email,
      whatsapp,
      jobTitle,
      jobDescription,
      language,
      cvFileName: cvFile?.name,
    });

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !email ||
      !whatsapp ||
      !jobTitle ||
      !jobDescription ||
      !language ||
      !cvFile
    ) {
      console.error("❌ Missing required fields");
      return new Response(
        JSON.stringify({
          error: "Todos los campos son requeridos",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate CV file
    if (cvFile.type !== "application/pdf") {
      console.error("❌ Invalid file type:", cvFile.type);
      return new Response(
        JSON.stringify({
          error: "Solo se permiten archivos PDF",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (cvFile.size > 2 * 1024 * 1024) {
      // 2MB
      console.error("❌ File too large:", cvFile.size);
      return new Response(
        JSON.stringify({
          error: "El archivo debe ser menor a 2MB",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if email has already been used for trial
    console.log("🔍 Checking email:", email);
    const { data: existingProfile, error: checkError } = await supabase
      .from("profiles" as any)
      .select("email, trial_interview_used")
      .eq("email", email)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 = no rows returned
      console.error("❌ Error checking email:", checkError);
      return new Response(
        JSON.stringify({
          error: "Error verificando el email",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (existingProfile && existingProfile.trial_interview_used) {
      console.error("❌ Email already used for trial:", email);
      return new Response(
        JSON.stringify({
          error:
            "Este email ya ha sido usado para una entrevista de prueba gratuita",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Upload CV to Supabase Storage
    console.log("📤 Uploading CV to storage...");
    const cvFileName = `${uuidv4()}-${cvFile.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("cv-interview")
      .upload(cvFileName, cvFile);

    if (uploadError) {
      console.error("❌ Error uploading CV:", uploadError);
      return new Response(
        JSON.stringify({
          error: "Error subiendo el CV",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate signed URL for CV (1 week expiration)
    console.log("🔗 Generating signed URL...");
    const { data: signedUrlData, error: signedUrlError } =
      await supabase.storage
        .from("cv-interview")
        .createSignedUrl(cvFileName, 7 * 24 * 60 * 60); // 1 week

    if (signedUrlError) {
      console.error("❌ Error generating signed URL:", signedUrlError);
      return new Response(
        JSON.stringify({
          error: "Error generando URL del CV",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const cvUrl = signedUrlData.signedUrl;
    console.log("✅ CV uploaded and URL generated:", cvUrl);

    // Create user account
    console.log("👤 Creating user account...");
    const fullName = `${firstName} ${lastName}`;
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password: uuidv4(), // Generate random password
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          first_name: firstName,
          last_name: lastName,
          whatsapp,
          is_trial_user: true,
        },
      });

    if (authError) {
      console.error("❌ Error creating user:", authError);
      return new Response(
        JSON.stringify({
          error: "Error creando la cuenta de usuario",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const userId = authData.user.id;
    console.log("✅ User created:", userId);

    // Update profile with trial information
    console.log("📝 Updating profile with trial info...");
    const { error: profileError } = await supabase
      .from("profiles" as any)
      .update({
        full_name: fullName,
        email,
        whatsapp,
        is_new_user: true,
        trial_interview_used: true,
        trial_interview_date: new Date().toISOString(),
        interview_credits: 0, // Trial users start with 0 credits
      })
      .eq("user_id", userId);

    if (profileError) {
      console.error("❌ Error updating profile:", profileError);
      return new Response(
        JSON.stringify({
          error: "Error actualizando el perfil",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Call LaPieza API
    console.log("📡 Calling LaPieza API...");
    const apiPayload = {
      job_title: jobTitle,
      job_description: jobDescription,
      cv_url: cvUrl,
      fullname: fullName,
      language,
      enabled_webhook: true,
      source: "academy",
    };

    console.log("📦 API payload:", apiPayload);

    const apiResponse = await fetch(
      "https://interview-api.lapieza.io/api/v1/interview",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiPayload),
      }
    );

    const result = await apiResponse.json();
    console.log("📦 API response:", result);

    if (!result.success) {
      console.error("❌ API error:", result);
      return new Response(
        JSON.stringify({
          error: "Error en el servicio de entrevistas",
          details: result.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Save interview record
    console.log("💾 Saving interview record...");
    const { data: interviewData, error: interviewError } = await supabase
      .from("interviews" as any)
      .insert({
        user_id: userId,
        interview_request_id: result.interview_id || `trial_${Date.now()}`, // Use interview_id or generate one
        task_id: result.candidate_id || `task_${Date.now()}`, // Use candidate_id or generate one
        candidate_id: result.candidate_id,
        interview_id: result.interview_id,
        fullname: fullName,
        email,
        job_title: jobTitle,
        job_description: jobDescription,
        cv_filename: cvFileName,
        cv_url: cvUrl,
        language,
        status: "pending",
        api_message: result.message,
        source: "trial",
      })
      .select()
      .single();

    if (interviewError) {
      console.error("❌ Error saving interview:", interviewError);
      return new Response(
        JSON.stringify({
          error: "Error guardando la entrevista",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("✅ Interview saved:", interviewData.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Entrevista de prueba solicitada exitosamente",
        data: {
          interview_id: interviewData.id,
          candidate_id: result.candidate_id,
          interview_id_external: result.interview_id,
          status: "pending",
          email,
          whatsapp,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("💥 Error in trial-interview-request function:", error);
    return new Response(
      JSON.stringify({
        error: "Error procesando la solicitud",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
