import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import axios from "https://esm.sh/axios@1.6.0";

const openAIApiKey = Deno.env.get("OPENAI_API_KEY_CV_BOOST");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    const { pdfBase64, preferences } = await req.json();
    console.log("Request received:", {
      hasCV: !!pdfBase64,
      preferences,
      cvLength: pdfBase64?.length || 0,
    });

    if (!pdfBase64) {
      throw new Error("No PDF file provided");
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from JWT token
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw new Error("Authorization header is required");
    }

    const { data: userData, error: userError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (userError || !userData.user) {
      throw new Error("Invalid user token");
    }

    const userId = userData.user.id;
    console.log("Processing request for user:", userId);

    // For CV Boost, we always analyze the new CV to avoid reusing previous data
    console.log(
      "CV Boost: Always analyzing new CV data to ensure fresh results"
    );

    let cvContentFile = "";
    let cvContentText = "";
    let personalData = null;
    let finalCvContent = "";

    try {
      console.log("Uploading CV to Supabase storage...");

      // Convert base64 to Uint8Array
      const pdfBuffer = Uint8Array.from(atob(pdfBase64), (c) =>
        c.charCodeAt(0)
      );

      // Generate unique filename
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileName = `cv-boost-${timestamp}-${randomId}.pdf`;

      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("cv-interview")
        .upload(fileName, pdfBuffer, {
          contentType: "application/pdf",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Upload error: ${uploadError.message}`);
      }

      console.log("CV uploaded successfully:", uploadData.path);

      // Create a signed URL (valid for 1 hour)
      const { data: signedUrlData, error: signedUrlError } =
        await supabase.storage
          .from("cv-interview")
          .createSignedUrl(fileName, 3600); // 1 hour expiration

      if (signedUrlError) {
        throw new Error(`Signed URL error: ${signedUrlError.message}`);
      }

      console.log(
        "Signed URL created, analyzing CV with BOTH modes in parallel..."
      );

      // **ANÁLISIS PARALELO** - Ejecutar ambas consultas al mismo tiempo
      const [fileAnalysisPromise, textAnalysisPromise] = [
        axios
          .post(
            "https://interview-api-dev.lapieza.io/api/v1/analize/cv",
            {
              cv_url: signedUrlData.signedUrl,
              mode: "file",
              need_personal_data: true,
            },
            {
              headers: { "Content-Type": "application/json" },
            }
          )
          .catch((error) => ({ error, mode: "file" })),

        axios
          .post(
            "https://interview-api-dev.lapieza.io/api/v1/analize/cv",
            {
              cv_url: signedUrlData.signedUrl,
              mode: "text",
              need_personal_data: true,
            },
            {
              headers: { "Content-Type": "application/json" },
            }
          )
          .catch((error) => ({ error, mode: "text" })),
      ];

      // Esperar ambas consultas
      const [fileResult, textResult] = await Promise.all([
        fileAnalysisPromise,
        textAnalysisPromise,
      ]);

      console.log("=== ANÁLISIS PARALELO COMPLETADO ===");

      // Procesar resultado del modo 'file'
      if (!fileResult.error && fileResult.data?.result) {
        cvContentFile = fileResult.data.result;
        console.log(
          "✅ FILE mode successful, content length:",
          cvContentFile.length
        );
        console.log("dataFile", cvContentFile);
      } else {
        console.log(
          "❌ FILE mode failed:",
          fileResult.error?.message || "No result"
        );
      }

      // Procesar resultado del modo 'text' Y EXTRAER personal_data
      if (!textResult.error && textResult.data?.result) {
        cvContentText = textResult.data.result;
        personalData = textResult.data.personal_data || null; // ← NUEVO: Extraer personal_data
        console.log(
          "✅ TEXT mode successful, content length:",
          cvContentText.length
        );
        console.log("dataText", cvContentText);
        console.log("personalData extraído:", personalData); // ← NUEVO: Log de personal_data
      } else {
        console.log(
          "❌ TEXT mode failed:",
          textResult.error?.message || "No result"
        );
      }

      // Usar 'file' como predeterminado, agregar 'text' solo si tiene contenido
      finalCvContent = cvContentFile;
      console.log("📋 Using FILE mode as default");

      // Agregar contenido de 'text' solo si existe
      if (cvContentText && cvContentText.trim().length > 0) {
        finalCvContent += `\n\n=== INFORMACIÓN COMPLEMENTARIA (TEXT MODE) ===\n${cvContentText}`;
        console.log("📋 Added TEXT mode content as complement");
      }

      // Clean up: delete the temporary file after analysis
      try {
        await supabase.storage.from("cv-interview").remove([fileName]);
        console.log("Temporary CV file deleted successfully");
      } catch (deleteError) {
        console.warn("Failed to delete temporary CV file:", deleteError);
      }
    } catch (cvAnalysisError) {
      console.error("CV analysis API error:", cvAnalysisError);

      // Fallback to basic PDF text extraction
      try {
        const personalPdfBuffer = Uint8Array.from(atob(pdfBase64), (c) =>
          c.charCodeAt(0)
        );
        console.log(
          "Using fallback PDF extraction, buffer size:",
          personalPdfBuffer.length
        );

        // Extract text from PDF
        const pdfString = new TextDecoder("utf-8", {
          ignoreBOM: true,
          fatal: false,
        }).decode(personalPdfBuffer);

        const textMatches = pdfString.match(/\((.*?)\)/g) || [];
        const extractedLines = textMatches
          .map((match) => match.slice(1, -1))
          .filter((text) => text.length > 2 && /[a-zA-Z]/.test(text))
          .join(" ");

        finalCvContent =
          extractedLines.length > 50
            ? extractedLines
            : `CV profesional con experiencia relevante. Documento PDF procesado correctamente con ${Math.round(
                personalPdfBuffer.length / 1024
              )}KB de contenido.`;
      } catch (pdfError) {
        console.error("Personal PDF parsing error:", pdfError);
        finalCvContent =
          "CV content from uploaded PDF file - Error in extraction, using fallback processing";
      }
    }

    // Ensure we have CV content
    if (!finalCvContent) {
      console.error("No CV content available for processing");
      finalCvContent = "CV content not available";
    }

    console.log("=== FINAL CV CONTENT STATS ===");
    console.log("Length:", finalCvContent?.length || 0);
    console.log("Preview:", finalCvContent?.substring(0, 200));

    // ← PROMPT MEJORADO CON ESTRUCTURA DE EXPERIENCIA OPTIMIZADA
    const prompt = `Eres un experto senior en recursos humanos, ATS (Applicant Tracking Systems) y optimización de CVs con más de 15 años de experiencia transformando perfiles profesionales.

A partir del CV del usuario, reorganiza, mejora la redacción y entrega un CV completo ya redactado, siguiendo la estructura definida. Tu objetivo es maximizar el impacto profesional del candidato.

Preferencias del usuario:
- Idioma: ${preferences.language}
- Puesto objetivo: ${preferences.targetPosition}
- Disponible para reubicación: ${preferences.relocation}

CV a analizar:
${finalCvContent}

DATOS PERSONALES EXTRAÍDOS:
${
  personalData
    ? JSON.stringify(personalData, null, 2)
    : "No hay datos personales disponibles"
}

⚠️ REGLAS CRÍTICAS PARA OPTIMIZACIÓN:

1. **ESTRUCTURA DE EXPERIENCIA OBLIGATORIA** - Cada bullet point debe seguir exactamente esta fórmula:
   - QUÉ HICISTE: Acción específica realizada
   - PARA QUÉ: Objetivo o propósito de la acción
   - LOGRO CUANTIFICABLE: Resultado medible con números, porcentajes o métricas

   Ejemplo: "Implementé un sistema de gestión de inventarios (QUÉ) para optimizar el control de stock y reducir pérdidas (PARA QUÉ), logrando una reducción del 25% en discrepancias y ahorro de $50,000 anuales (LOGRO CUANTIFICABLE)."

2. **MEJORAMIENTO CON IA DE LA EXPERIENCIA**:
   - Si una experiencia es básica, mejórala agregando responsabilidades lógicas del puesto
   - Convierte tareas simples en logros profesionales
   - Agrega contexto empresarial relevante
   - Infiere impactos positivos basados en las responsabilidades mencionadas
   - Utiliza verbos de acción potentes y específicos del sector

3. **DATOS PERSONALES**: SIEMPRE usa los datos extraídos para la sección personal

4. **LOGROS CUANTIFICABLES**: Si no hay métricas en el CV original, sugiere rangos realistas basados en el tipo de puesto y sector

5. **OPTIMIZACIÓN INTELIGENTE**:
   - Elimina redundancias y información irrelevante
   - Prioriza experiencias más relevantes al puesto objetivo
   - Adapta el lenguaje al sector y nivel profesional
   - Destaca habilidades transferibles

ESTRUCTURA DE RESPUESTA REQUERIDA:
Responde EXACTAMENTE en el siguiente formato JSON (NO agregues secciones adicionales):

{
  "feedback": [
    "Puntos específicos de mejora aplicados al CV - SIEMPRE EN ESPAÑOL",
    "Menciona si se agregaron logros cuantificables estimados"
  ],
  "optimizedCV": {
    "personal": {
      "name": "Nombre completo desde personal_data",
      "headline": "Título profesional optimizado para el puesto objetivo",
      "contact": {
        "email": "email desde personal_data",
        "phone": "teléfono desde personal_data", 
        "city": "ciudad desde personal_data",
        "linkedin": "linkedin desde personal_data si existe"
      }
    },
    "summary": "Resumen profesional de máximo 4 líneas, enfocado en valor agregado y alineado al puesto objetivo",
    "experience": [
      {
        "company": "Nombre de la empresa",
        "position": "Puesto optimizado",
        "description": "Descripción contextual del rol y responsabilidades principales",
        "bullets": [
          "Acción realizada + propósito + resultado cuantificable (redactado de forma fluida, SIN paréntesis explicativos)",
          "Segunda acción + objetivo + métrica específica",
          "Tercera acción + finalidad + logro medible"
        ]
      }
    ],
    "skills": {
      "hardSkills": {
        "Habilidad técnica 1": "Nivel (Básico/Intermedio/Avanzado)",
        "Habilidad técnica 2": "Nivel"
      },
      "softSkills": {
        "Habilidad blanda 1": "Nivel (Bajo/Medio/Alto)",
        "Habilidad blanda 2": "Nivel"
      }
    },
    "projects": [
      {
        "name": "Nombre del proyecto",
        "description": "Descripción con enfoque en impacto",
        "bullets": ["Resultados específicos del proyecto"]
      }
    ],
    "education": [
      {
        "degree": "Título completo",
        "school": "Institución educativa",
        "location": "Ubicación",
        "startDate": "Año inicio",
        "endDate": "Año fin"
      }
    ],
    "certifications": [
      {
        "name": "Nombre de la certificación",
        "description": "Organización emisora",
        "startDate": "Fecha",
        "endDate": "Fecha de vencimiento si aplica"
      }
    ],
    "languages": [
      "Idioma1: Nivel específico",
      "Idioma2: Nivel específico"
    ]
  },
  "keywords": [
    "Palabras clave específicas del sector y puesto objetivo"
  ],
  "improvements": [
    "Lista de mejoras específicas aplicadas para maximizar el impacto profesional"
  ]
}`;

    console.log("About to call OpenAI API...");
    console.log("OpenAI API Key available:", !!openAIApiKey);
    console.log("Prompt length:", prompt.length);

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Eres un experto en optimización de CVs y recursos humanos. Respondes siempre en formato JSON válido.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 4000,
      },
      {
        headers: {
          Authorization: `Bearer ${openAIApiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("OpenAI API response received");

    let text = response.data.choices[0].message.content;

    // Limpiar etiquetas ```json ... ``` si las trae
    text = text.replace(/```json|```/g, "").trim();

    // Convertir a objeto
    const data = JSON.parse(text);
    console.log("dataGPT", data);

    // Parse JSON response
    let result;
    try {
      result = data;
      console.log("Successfully parsed result");
    } catch (e) {
      console.error("JSON parsing error:", e);
      // Fallback if JSON parsing fails
      result = {
        feedback: ["No se pudo analizar el CV anterior completamente"],
        optimizedCV: {
          personal: {
            name: "Información no disponible",
            headline: "Perfil profesional",
            contact: {
              email: "email@example.com",
              phone: "teléfono",
              city: "ciudad",
            },
          },
          summary: "Perfil profesional optimizado",
          experience: [],
          skills: { hardSkills: {}, softSkills: {} },
          projects: [],
          education: [],
          certifications: [],
          languages: [],
        },
        keywords: ["palabras", "clave", "relevantes"],
        improvements: ["CV optimizado con IA"],
      };
    }

    console.log("Returning result to client");
    return new Response(JSON.stringify(result), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error in cv-boost-ai function:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
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
