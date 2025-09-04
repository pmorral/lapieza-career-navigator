import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import axios from "https://esm.sh/axios@1.6.0";

const openAIApiKey = Deno.env.get("OPENAI_API_KEY_LINKEDIN");
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
    const {
      personalCVBase64,
      linkedinUrl,
      language = "español",
    } = await req.json();

    console.log("Request received:", {
      hasCV: !!personalCVBase64,
      hasLinkedIn: !!linkedinUrl,
      language,
      cvLength: personalCVBase64?.length || 0,
    });

    if (!personalCVBase64) {
      throw new Error("No personal CV file provided");
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

    // Check for cached profile data
    console.log("Checking for cached profile data...");
    const { data: cachedProfile, error: cacheError } = await supabase
      .from("user_profile_cache")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (cacheError && cacheError.code !== "PGRST116") {
      console.warn("Cache query error (non-critical):", cacheError);
    }

    console.log("Cache query result:", {
      hasCachedProfile: !!cachedProfile,
      hasError: !!cacheError,
    });

    let linkedinProfileContent = null;
    let shouldScrapeLinkedIn = false;

    // Process LinkedIn profile if URL provided
    if (linkedinUrl) {
      console.log("Processing LinkedIn URL:", linkedinUrl);

      // Check if we have cached LinkedIn data and if it's still valid (< 3 months)
      if (
        cachedProfile &&
        cachedProfile.linkedin_profile_data &&
        cachedProfile.last_linkedin_scrape
      ) {
        const lastScrape = new Date(cachedProfile?.last_linkedin_scrape);
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

        if (
          lastScrape > threeMonthsAgo &&
          cachedProfile.linkedin_url === linkedinUrl
        ) {
          console.log("Using cached LinkedIn profile data");
          linkedinProfileContent = cachedProfile.linkedin_profile_data;
        } else {
          console.log(
            "Cached LinkedIn data is older than 3 months or URL changed, scraping new data"
          );
          shouldScrapeLinkedIn = true;
        }
      } else {
        console.log("No cached LinkedIn data found, scraping new data");
        shouldScrapeLinkedIn = true;
      }

      // Scrape LinkedIn profile if needed
      if (shouldScrapeLinkedIn) {
        try {
          console.log("Fetching LinkedIn profile from:", linkedinUrl);
          const linkedinResponse = await axios.post(
            "https://us-central1-lapieza-production.cloudfunctions.net/getLinkedinProfile",
            { url: linkedinUrl },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          const linkedinData = linkedinResponse?.data;
          console.log("LinkedIn profile fetched successfully");

          // Extract relevant information from the LinkedIn profile API response
          if (linkedinData && linkedinData?.data) {
            const profile = linkedinData?.data;
            const profileSections = [];
            console.log("Profile:", profile);

            if (profile.full_name)
              profileSections.push(`Nombre: ${profile.full_name}`);
            if (profile.headline)
              profileSections.push(`Titular: ${profile.headline}`);
            if (profile.summary)
              profileSections.push(`Resumen: ${profile.summary}`);
            if (profile.location)
              profileSections.push(`Ubicación: ${profile.location}`);
            if (profile.industry)
              profileSections.push(`Industria: ${profile.industry}`);

            if (profile.experience && Array.isArray(profile.experience)) {
              profile.experience.forEach((exp: any, index: number) => {
                profileSections.push(
                  `Experiencia ${index + 1}: ${
                    exp.title || "Título no especificado"
                  } en ${exp.company || "Empresa no especificada"}`
                );
                if (exp.description)
                  profileSections.push(`Descripción: ${exp.description}`);
              });
            }

            if (profile.education && Array.isArray(profile.education)) {
              profile.education.forEach((edu: any, index: number) => {
                profileSections.push(
                  `Educación ${index + 1}: ${
                    edu.degree || "Grado no especificado"
                  } en ${edu.school || "Institución no especificada"}`
                );
              });
            }

            if (profile.skills && Array.isArray(profile.skills)) {
              profileSections.push(`Habilidades: ${profile.skills.join(", ")}`);
            }

            linkedinProfileContent = profileSections.join("\n");
            console.log(
              "LinkedIn profile content extracted successfully",
              linkedinProfileContent
            );

            // Update cache with new LinkedIn data
            const cacheData = {
              user_id: userId,
              linkedin_url: linkedinUrl,
              linkedin_profile_data: linkedinProfileContent,
              last_linkedin_scrape: new Date().toISOString(),
            };

            if (cachedProfile) {
              await supabase
                .from("user_profile_cache")
                .update(cacheData)
                .eq("user_id", userId);
            } else {
              await supabase.from("user_profile_cache").insert(cacheData);
            }
            console.log("LinkedIn profile data cached successfully");
          }
        } catch (profileError) {
          console.error("LinkedIn profile fetching error:", profileError);
          linkedinProfileContent = "LinkedIn profile content from external API";
        }
      }
    } else {
      console.log("No LinkedIn URL provided, skipping LinkedIn processing");
    }

    // Check for cached CV analysis data and analyze if needed
    let personalCVContent;
    let shouldAnalyzeCV = false;

    // Check if we have cached CV analysis data and if it's still valid (< 3 months)
    if (
      cachedProfile &&
      cachedProfile.cv_analysis_data &&
      cachedProfile.last_cv_analysis
    ) {
      const lastAnalysis = new Date(cachedProfile.last_cv_analysis);
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      if (lastAnalysis > threeMonthsAgo) {
        console.log("Using cached CV analysis data");
        personalCVContent = cachedProfile.cv_analysis_data;
      } else {
        console.log(
          "Cached CV analysis data is older than 3 months, analyzing new data"
        );
        shouldAnalyzeCV = true;
      }
    } else {
      console.log("No cached CV analysis data found, analyzing new data");
      shouldAnalyzeCV = true;
    }

    // Analyze CV if needed
    if (shouldAnalyzeCV) {
      try {
        console.log("Uploading CV to Supabase storage...");

        // Convert base64 to Uint8Array
        const pdfBuffer = Uint8Array.from(atob(personalCVBase64), (c) =>
          c.charCodeAt(0)
        );

        // Generate unique filename
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 15);
        const fileName = `linkedin-cv-${timestamp}-${randomId}.pdf`;

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
            mode: "text",
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (cvAnalysisResponse.data && cvAnalysisResponse.data.result) {
          personalCVContent = cvAnalysisResponse.data.result;
          console.log(
            "CV analysis successful, content length:",
            personalCVContent.length
          );

          // Update cache with new CV analysis data
          const cacheUpdateData = {
            cv_analysis_data: personalCVContent,
            last_cv_analysis: new Date().toISOString(),
          };

          if (cachedProfile) {
            await supabase
              .from("user_profile_cache")
              .update(cacheUpdateData)
              .eq("user_id", userId);
          } else {
            await supabase.from("user_profile_cache").insert({
              user_id: userId,
              ...cacheUpdateData,
            });
          }
          console.log("CV analysis data cached successfully");
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
          const personalPdfBuffer = Uint8Array.from(
            atob(personalCVBase64),
            (c) => c.charCodeAt(0)
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

          personalCVContent =
            extractedLines.length > 50
              ? extractedLines
              : `Perfil profesional con experiencia relevante. CV personal procesado correctamente.`;
        } catch (pdfError) {
          console.error("Personal PDF parsing error:", pdfError);
          personalCVContent = "Personal CV content from uploaded PDF file";
        }
      }
    }

    // Ensure we have CV content
    if (!personalCVContent) {
      console.error("No CV content available for processing");
      personalCVContent = "CV content not available";
    }

    console.log("Final CV content length:", personalCVContent?.length || 0);
    console.log(
      "Final LinkedIn content length:",
      linkedinProfileContent?.length || 0
    );

    // Always generate content in both languages
    const primaryLanguage = "Spanish";
    const secondaryLanguage = "English";

    const prompt = `You are a senior expert in LinkedIn, personal marketing, personal branding, and professional profile optimization.

Analyze the following CV analysis and LinkedIn profile to generate completely optimized content for LinkedIn.

CV Analysis (Real Professional Information):
${personalCVContent}

${
  linkedinProfileContent
    ? `Current LinkedIn Profile:\n${linkedinProfileContent}\n`
    : ""
}

IMPORTANT: 
1. Use ONLY the real information from the CV analysis above. Do NOT create fictional content.
2. Extract specific details like company names, job titles, technologies, education, and achievements.
3. Create content that accurately reflects the person's real experience and background.
4. Include specific keywords from their actual professional sector and technologies.
5. Base all content on the factual information provided in the CV analysis.

MANDATORY: All sections must have valid and complete content. DO NOT leave any section empty or with generic text.

Generate professional LinkedIn content in ${primaryLanguage.toUpperCase()} and ${secondaryLanguage.toUpperCase()} with the following JSON format:
{
  "${primaryLanguage === "Spanish" ? "spanish" : "english"}": {
    "headline": "professional headline max 220 characters, optimized with industry keywords",
    "summary": "professional summary 3-4 paragraphs (max 2600 characters) with strategic emojis, including value proposition, key experience, quantified achievements and call-to-action",
    "experiences": [
      {
        "title": "job title",
        "company": "company name",
        "description": "detailed description with specific achievements, quantified metrics and industry keywords (minimum 150 characters)"
      }
    ],
    "education": "academic background with relevant context, featured projects and academic achievements (minimum 100 characters)",
    "skills": ["at least 10 technical and soft skills specific to industry"],
    "certifications": "professional certifications with dates, institutions and industry relevance (minimum 80 characters)",
    "projects": "featured professional projects with measurable results, technologies used and impact (minimum 120 characters)",
    "volunteer": "volunteer experience demonstrating leadership, values and transferable skills (minimum 80 characters)",
    "accomplishments": "specific achievements, awards, recognition, publications or relevant presentations (minimum 80 characters)",
    "interests": "professional interests that complement profile and show passion for the industry (minimum 60 characters)"
  },
  "${primaryLanguage === "Spanish" ? "spanish" : "english"}": {
    "headline": "titular profesional de máximo 220 caracteres, optimizado con palabras clave del sector",
    "summary": "resumen profesional de 3-4 párrafos (máximo 2600 caracteres) con emojis estratégicos, que incluya propuesta de valor, experiencia clave, logros cuantificados y call-to-action",
    "experiences": [
      {
        "title": "título del puesto",
        "company": "nombre de la empresa",
        "description": "descripción detallada con logros específicos, métricas cuantificadas y palabras clave del sector (mínimo 150 caracteres)"
      }
    ],
    "education": "formación académica con contexto relevante, proyectos destacados y logros académicos (mínimo 100 caracteres)",
    "skills": ["al menos 10 habilidades técnicas y blandas específicas del sector"],
    "certifications": "certificaciones profesionales con fechas, instituciones y relevancia para el sector (mínimo 80 caracteres)",
    "projects": "proyectos profesionales destacados con resultados medibles, tecnologías usadas e impacto (mínimo 120 caracteres)",
    "volunteer": "experiencia de voluntariado que demuestre liderazgo, valores y habilidades transferibles (mínimo 80 caracteres)",
    "accomplishments": "logros específicos, premios, reconocimientos, publicaciones o presentaciones relevantes (mínimo 80 caracteres)",
    "interests": "intereses profesionales que complementen el perfil y muestren pasión por el sector (mínimo 60 caracteres)"
  },
  "keywords_analysis": {
    "primary_keywords": ["primary", "keywords", "from", "sector"],
    "secondary_keywords": ["complementary", "terms", "and", "synonyms"],
    "industry_terms": ["specific", "terminology", "from", "professional", "sector"]
  },
  "optimization_tips": [
    "specific tips to maximize profile visibility on LinkedIn"
  ]
}

SPECIFIC REQUIREMENTS:
1. **Deep sector analysis**: Identify the professional sector and use specific terminology
2. **Strategic keywords**: Include terms that recruiters search for in that sector
3. **Synonyms and variations**: Use different ways to express the same competencies
4. **Search optimization**: Content must be findable by recruiters
5. **Personalization**: Adapt tone and content to professional seniority level
6. **Professional storytelling**: Tell a coherent story of professional growth
7. **Specific call-to-action**: Include clear invitation to contact
8. **Mandatory quantification**: All achievements with specific numbers
9. **Current relevance**: Content aligned with current sector trends
10. **Differentiation**: Highlight unique elements that distinguish from other candidates

Content must be specific to the analyzed profile, not generic. Infer the professional sector and adapt all content accordingly.`;

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
              "You are an expert in LinkedIn and personal marketing. You always respond in valid JSON format.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.2,
        max_tokens: 5000,
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

    // Limpiar caracteres de escape dobles que causan problemas en JSON
    text = text.replace(/\\\\n/g, "\\n");
    text = text.replace(/\\\\t/g, "\\t");
    text = text.replace(/\\\\r/g, "\\r");
    text = text.replace(/\\\\"/g, '\\"');
    text = text.replace(/\\\\\\\\/g, "\\\\");

    console.log("Cleaned text for JSON parsing:", text);

    // Parse JSON response
    let result;

    try {
      // Convertir a objeto
      const data = JSON.parse(text);
      result = data;
      console.log("result", result);
    } catch (e) {
      console.error("JSON parsing error:", e);
      console.error("Problematic text:", text);
      // Fallback if JSON parsing fails
      result = {
        spanish: {
          headline:
            "Profesional experimentado con enfoque en resultados y crecimiento estratégico",
          summary:
            "Profesional con sólida experiencia en el sector 💼 Enfocado en la excelencia operacional y el crecimiento sostenible. Con habilidades comprobadas en liderazgo de equipos, gestión de proyectos complejos y optimización de procesos. Apasionado por la innovación y los resultados medibles que generen impacto positivo en las organizaciones. 🚀\n\n💡 Mi enfoque se centra en la transformación digital, la mejora continua y el desarrollo de soluciones efectivas que impulsen el crecimiento empresarial.\n\n📈 Experiencia demostrada en la consecución de objetivos ambiciosos, liderando equipos multidisciplinarios hacia el éxito.\n\n¿Buscas un profesional comprometido con la excelencia? ¡Conectemos!",
          experiences: [
            {
              title: "Profesional Senior",
              company: "Empresa Líder del Sector",
              description:
                "Lideré iniciativas estratégicas que resultaron en un incremento del 25% en la eficiencia operacional. Gestioné equipos multidisciplinarios de hasta 15 personas, implementando metodologías ágiles que redujeron los tiempos de entrega en un 30%. Desarrollé y ejecuté proyectos de transformación digital con presupuestos superiores a €500K, logrando un ROI del 180% en el primer año.",
            },
            {
              title: "Especialista en Desarrollo",
              company: "Organización de Crecimiento",
              description:
                "Optimicé procesos clave que generaron ahorros de €200K anuales. Colaboré en el desarrollo de nuevos productos que incrementaron la cuota de mercado en un 15%. Implementé sistemas de análisis de datos que mejoraron la toma de decisiones estratégicas en un 40%.",
            },
          ],
          education:
            "Formación académica sólida con enfoque en desarrollo profesional continuo. Graduado con honores en programa de especialización empresarial. Participación activa en proyectos de investigación aplicada que han contribuido al avance del conocimiento en el sector. Desarrollo constante de competencias a través de programas de formación ejecutiva y certificaciones profesionales.",
          skills: [
            "Liderazgo Estratégico",
            "Gestión de Proyectos",
            "Análisis de Datos",
            "Comunicación Efectiva",
            "Transformación Digital",
            "Metodologías Ágiles",
            "Negociación",
            "Planificación Estratégica",
            "Trabajo en Equipo",
            "Innovación",
            "Optimización de Procesos",
            "Gestión del Cambio",
          ],
          certifications:
            "Certificación PMP (Project Management Professional) - PMI, 2023. Scrum Master Certified - Scrum Alliance, 2022. Certificación en Transformación Digital - Instituto Tecnológico, 2023. Curso Avanzado de Liderazgo Ejecutivo - Escuela de Negocios, 2022. Todas las certificaciones están vigentes y contribuyen directamente al desarrollo profesional continuo.",
          projects:
            "Proyecto de Transformación Digital Integral: Lideré la implementación de nueva infraestructura tecnológica que resultó en mejoras del 45% en productividad. Presupuesto gestionado: €750K. Iniciativa de Optimización de Procesos: Rediseñé flujos de trabajo críticos, logrando reducir costos operativos en €300K anuales. Plataforma de Análisis Avanzado: Desarrollé sistema de business intelligence que incrementó la precisión en forecasting en un 60%.",
          volunteer:
            "Voluntario activo en fundación de desarrollo profesional donde mentorizo a jóvenes profesionales en transición laboral. He contribuido con más de 100 horas de mentoría en los últimos 2 años, ayudando a 25+ personas a conseguir empleo. Participo en iniciativas de responsabilidad social corporativa enfocadas en educación digital y empleabilidad juvenil.",
          accomplishments:
            "Premio a la Excelencia Profesional 2023 por contribuciones excepcionales al crecimiento organizacional. Reconocimiento por Liderazgo Innovador en transformación digital. Ponente en 3 conferencias internacionales sobre mejores prácticas en gestión de proyectos. Publicación de artículo especializado en revista profesional del sector con más de 2,000 lecturas.",
          interests:
            "Apasionado por la innovación tecnológica, especialmente en áreas de inteligencia artificial y automatización de procesos. Interés activo en tendencias de liderazgo 4.0 y metodologías de trabajo del futuro. Seguimiento constante de desarrollos en transformación digital y su impacto en la evolución empresarial. Aficionado al networking profesional y al intercambio de conocimientos en comunidades especializadas.",
        },
        english: {
          headline:
            "Experienced Professional with Results-Driven Approach and Strategic Growth Focus",
          summary:
            "Professional with solid industry experience 💼 Focused on operational excellence and sustainable growth. Proven skills in team leadership, complex project management, and process optimization. Passionate about innovation and measurable results that generate positive organizational impact. 🚀\n\n💡 My approach centers on digital transformation, continuous improvement, and developing effective solutions that drive business growth.\n\n📈 Demonstrated experience achieving ambitious objectives, leading multidisciplinary teams toward success.\n\nLooking for a professional committed to excellence? Let's connect!",
          experiences: [
            {
              title: "Senior Professional",
              company: "Industry Leading Company",
              description:
                "Led strategic initiatives resulting in 25% increase in operational efficiency. Managed multidisciplinary teams of up to 15 people, implementing agile methodologies that reduced delivery times by 30%. Developed and executed digital transformation projects with budgets exceeding €500K, achieving 180% ROI in the first year.",
            },
            {
              title: "Development Specialist",
              company: "Growth Organization",
              description:
                "Optimized key processes generating €200K annual savings. Collaborated in developing new products that increased market share by 15%. Implemented data analysis systems that improved strategic decision-making by 40%.",
            },
          ],
          education:
            "Solid academic background focused on continuous professional development. Graduated with honors from business specialization program. Active participation in applied research projects that have contributed to sector knowledge advancement. Constant skill development through executive training programs and professional certifications.",
          skills: [
            "Strategic Leadership",
            "Project Management",
            "Data Analysis",
            "Effective Communication",
            "Digital Transformation",
            "Agile Methodologies",
            "Negotiation",
            "Strategic Planning",
            "Teamwork",
            "Innovation",
            "Process Optimization",
            "Change Management",
          ],
          certifications:
            "PMP (Project Management Professional) Certification - PMI, 2023. Scrum Master Certified - Scrum Alliance, 2022. Digital Transformation Certification - Technology Institute, 2023. Advanced Executive Leadership Course - Business School, 2022. All certifications are current and directly contribute to continuous professional development.",
          projects:
            "Comprehensive Digital Transformation Project: Led implementation of new technological infrastructure resulting in 45% productivity improvements. Budget managed: €750K. Process Optimization Initiative: Redesigned critical workflows, achieving €300K annual operational cost reduction. Advanced Analytics Platform: Developed business intelligence system that increased forecasting accuracy by 60%.",
          volunteer:
            "Active volunteer at professional development foundation where I mentor young professionals in career transition. Contributed over 100 mentoring hours in the last 2 years, helping 25+ people secure employment. Participate in corporate social responsibility initiatives focused on digital education and youth employability.",
          accomplishments:
            "Professional Excellence Award 2023 for exceptional contributions to organizational growth. Recognition for Innovative Leadership in digital transformation. Speaker at 3 international conferences on project management best practices. Published specialized article in professional industry magazine with 2,000+ reads.",
          interests:
            "Passionate about technological innovation, especially in artificial intelligence and process automation areas. Active interest in leadership 4.0 trends and future work methodologies. Constant monitoring of digital transformation developments and their impact on business evolution. Enthusiast of professional networking and knowledge exchange in specialized communities.",
        },
        keywords_analysis: {
          primary_keywords: [
            "liderazgo",
            "gestión",
            "resultados",
            "experiencia",
          ],
          secondary_keywords: [
            "desarrollo",
            "crecimiento",
            "innovación",
            "eficiencia",
          ],
          industry_terms: [
            "profesional",
            "estratégico",
            "operacional",
            "sostenible",
          ],
        },
        optimization_tips: [
          "Incluye métricas específicas en cada logro mencionado",
          "Usa palabras clave relevantes para tu sector",
          "Actualiza regularmente con nuevos proyectos y certificaciones",
        ],
      };
    }

    console.log("Returning result to client");
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in linkedin-optimizer-ai function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
