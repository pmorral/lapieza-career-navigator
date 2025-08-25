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
    return new Response(null, { headers: corsHeaders });
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
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

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
    console.log("CV Boost: Always analyzing new CV data to ensure fresh results");
    
    let cvContent;
    let shouldAnalyzeCV = true;
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
          "Signed URL created, analyzing CV using CV analysis API..."
        );

        // Now call the CV analysis API with the URL
        const cvAnalysisResponse = await axios.post(
          "https://interview-api-dev.lapieza.io/api/v1/analize/cv",
          {
            cv_url: signedUrlData.signedUrl,
            mode: "file",
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (cvAnalysisResponse.data && cvAnalysisResponse.data.result) {
          cvContent = cvAnalysisResponse.data.result;
          console.log(
            "CV analysis successful, content length:",
            cvContent.length
          );

          // CV Boost: Skip caching to ensure fresh analysis for each CV
          console.log("CV Boost: Skipping cache to ensure fresh results");
        } else {
          throw new Error("No result from CV analysis API");
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
          console.log("Personal PDF buffer size:", personalPdfBuffer.length);

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

          cvContent =
            extractedLines.length > 50
              ? extractedLines
              : `CV profesional con experiencia relevante. Documento PDF procesado correctamente con ${Math.round(
                  personalPdfBuffer.length / 1024
                )}KB de contenido.`;
        } catch (pdfError) {
          console.error("Personal PDF parsing error:", pdfError);
          cvContent =
            "CV content from uploaded PDF file - Error in extraction, using fallback processing";
        }
      }

    // Ensure we have CV content
    if (!cvContent) {
      console.error("No CV content available for processing");
      cvContent = "CV content not available";
    }

    console.log("Final CV content length:", cvContent?.length || 0);

    const prompt = `Eres un experto senior en recursos humanos, ATS (Applicant Tracking Systems) y optimización de CVs. 

A partir del CV del usuario, reorganiza, mejora la redacción y entrega un CV completo ya redactado, siguiendo la estructura definida. No expliques cómo hacerlo ni des plantillas vacías: redacta directamente el contenido final.

Preferencias del usuario:
- Idioma: ${preferences.language}
- Puesto objetivo: ${preferences.targetPosition}
- Disponible para reubicación: ${preferences.relocation}

CV a analizar:
${cvContent}

⚠️ IMPORTANTE: No inventes información nueva. Solo utiliza lo que ya existe en el CV original. Si faltan logros cuantificables, menciona en el feedback final que el usuario debe agregarlos.

A. ENCABEZADO:
Incluye el nombre del candidato y sus datos de contacto.
Agrega un headline profesional debajo del nombre con la posición deseada o una frase breve que resuma el perfil.

B. PERFIL PROFESIONAL (máx. 4 líneas):
Redacta un resumen profesional breve:
- Menciona años de experiencia (solo si son más de 2).
- Principales habilidades y sector.
- Objetivo profesional alineado al puesto buscado.

C. EXPERIENCIA PROFESIONAL:
Incluye únicamente las 4 experiencias más recientes (5 si el perfil es Senior con +8 años).
Limita la extensión:
- Perfil junior/intermedio (<8 años): máximo 1 página.
- Perfil senior (>8 años): máximo 2 páginas.
Cada experiencia con 3 a 7 viñetas.
Redacción según idioma:
- Inglés: verbos en pasado; trabajo actual en gerundio.
- Español: verbos en pasado en primera persona; trabajo actual en infinitivo.
Cada viñeta debe responder: qué hiciste y para qué, destacando logros y resultados medibles.

D. SKILLS:
Clasifica las competencias extraídas del CV en:
- Hard Skills (con nivel: Básico, Intermedio, Avanzado).
- Soft Skills (con nivel: Bajo, Medio, Alto).

E. ESTRUCTURA FINAL DEL CV:
El resultado final debe tener este orden:
1. Nombre
2. Datos de contacto (Email, Tel, Ciudad, LinkedIn, Portafolio si aplica, Disponibilidad de reubicación solo si se indicó)
2. Headline profesional
3. Perfil profesional
4. Experiencia profesional
5. Proyectos (solo si es perfil junior o en transición)
6. Skills
7. Cursos
8. Educación
9. Idiomas

F. CAMBIO DE CARRERA O CV MAL ORIENTADO:
Si el perfil indica un cambio de área o está poco enfocado:
- Reescribe la experiencia resaltando habilidades transferibles y tareas relacionadas con el nuevo objetivo.
- Ajusta la redacción priorizando lo que aporta al puesto meta, no solo lo que la persona hizo.

FEEDBACK: Agrega un bloque con recomendaciones puntuales para mejorar (ejemplo: "Agrega logros cuantificables como % de mejora, métricas de ahorro o crecimiento alcanzado").

FEEDBACK SIEMPRE EN ESPAÑOL: La sección "feedback" SIEMPRE debe estar en español, independientemente del idioma solicitado para el CV.

Responde en el siguiente formato JSON:
{
  "feedback": [
    "lista detallada de puntos de mejora detectados en el CV original - SIEMPRE EN ESPAÑOL. Si no hay logros cuantificables, menciona que debe agregarlos"
  ],
  "optimizedCV": "CV completo optimizado siguiendo la estructura especificada",
  "sections": {
    "personal": "Nombre + headline + datos de contacto",
    "summary": "Perfil profesional",
    "experience": [
      {
        "company": "Nombre de la empresa",
        "position": "Puesto",
        "description": "Descripción de la experiencia",
        "bullets": ["Bullets de la experiencia"]
      }
    ],
    "skills": "Hard Skills (Básico/Intermedio/Avanzado) y Soft Skills (Bajo/Medio/Alto)",
    "projects": "Proyectos (solo para perfiles junior o en transición) array de objetos con los siguientes campos: 'name', 'description', 'bullets'",
    "education": "Formación académica array de objetos con los siguientes campos: 'degree', 'school', 'location', 'startDate', 'endDate'",
    "certifications": "Cursos y certificaciones array de objetos con los siguientes campos: 'name', 'description', 'startDate', 'endDate'",
    "languages": "Aqui debe de mandarse los lenguages detectados en el CV, para poder optimizar y poner niveles de habilidad ejemplo: 'Inglés: Intermedio', 'Español: Nativo'"
  },
  "keywords": [
    "palabras clave específicas del sector incluidas en el CV"
  ],
  "improvements": [
    "mejoras aplicadas siguiendo la estructura especificada"
  ]
}`;

    console.log("About to call OpenAI API...");
    console.log("OpenAI API Key available:", !!openAIApiKey);
    console.log("Prompt length:", prompt);

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
          { role: "user", content: prompt },
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
    console.log("OpenAI API response:", JSON.stringify(response.data));

    let text = response.data.choices[0].message.content;

    // Limpiar etiquetas ```json ... ``` si las trae
    text = text.replace(/```json|```/g, "").trim();

    // Convertir a objeto
    const data = JSON.parse(text);

    // Parse JSON response
    let result;

    try {
      result = data;
      console.log("result", result);
    } catch (e) {
      console.error("JSON parsing error:", e);
      // Fallback if JSON parsing fails
      result = {
        feedback: ["No se pudo analizar el CV anterior completamente"],
        optimizedCV: text,
        sections: {
          personal: "Información de contacto profesional",
          summary: "Perfil profesional optimizado",
          experience: "Experiencia profesional destacada",
          education: "Formación académica relevante",
          skills: "Habilidades técnicas y blandas",
          certifications: "Certificaciones profesionales",
          languages: "Idiomas",
          projects: "Proyectos destacados",
          achievements: "Logros profesionales",
          volunteer: "Experiencia de voluntariado",
          interests: "Intereses profesionales",
          additional: "Información adicional",
        },
        keywords: ["palabras", "clave", "relevantes"],
        improvements: ["CV optimizado con IA"],
      };
    }

    console.log("Returning result to client");
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in cv-boost-ai function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
