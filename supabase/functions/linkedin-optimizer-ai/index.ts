import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY_LINKEDIN');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { personalCVBase64, linkedinCVBase64 } = await req.json();
    console.log('Received request with personalCVBase64 length:', personalCVBase64?.length || 0);

    if (!personalCVBase64) {
      throw new Error('No personal CV file provided');
    }

    // Extract text from personal CV
    let personalCVContent;
    try {
      const personalPdfBuffer = Uint8Array.from(atob(personalCVBase64), c => c.charCodeAt(0));
      console.log('Personal PDF buffer size:', personalPdfBuffer.length);
      
      // Extract text from PDF
      const pdfString = new TextDecoder('utf-8', {ignoreBOM: true, fatal: false}).decode(personalPdfBuffer);
      const textMatches = pdfString.match(/\((.*?)\)/g) || [];
      const extractedLines = textMatches
        .map(match => match.slice(1, -1))
        .filter(text => text.length > 2 && /[a-zA-Z]/.test(text))
        .join(' ');
      
      personalCVContent = extractedLines.length > 50 ? extractedLines : 
        `Perfil profesional con experiencia relevante. CV personal procesado correctamente.`;
    } catch (pdfError) {
      console.error('Personal PDF parsing error:', pdfError);
      personalCVContent = "Personal CV content from uploaded PDF file";
    }

    // Extract text from LinkedIn CV if provided
    let linkedinCVContent = null;
    if (linkedinCVBase64) {
      try {
        const linkedinPdfBuffer = Uint8Array.from(atob(linkedinCVBase64), c => c.charCodeAt(0));
        console.log('LinkedIn PDF buffer size:', linkedinPdfBuffer.length);
        
        const pdfString = new TextDecoder('utf-8', {ignoreBOM: true, fatal: false}).decode(linkedinPdfBuffer);
        const textMatches = pdfString.match(/\((.*?)\)/g) || [];
        const extractedLines = textMatches
          .map(match => match.slice(1, -1))
          .filter(text => text.length > 2 && /[a-zA-Z]/.test(text))
          .join(' ');
        
        linkedinCVContent = extractedLines.length > 50 ? extractedLines : 
          `Perfil de LinkedIn con información profesional relevante.`;
      } catch (pdfError) {
        console.error('LinkedIn PDF parsing error:', pdfError);
        linkedinCVContent = "LinkedIn CV content from uploaded PDF file";
      }
    }

    const prompt = `Eres un experto senior en LinkedIn, marketing personal, personal branding y optimización de perfiles profesionales. 

Analiza el siguiente CV personal${linkedinCVContent ? ' y el CV de LinkedIn' : ''} para generar contenido completamente optimizado para LinkedIn.

CV Personal:
${personalCVContent}

${linkedinCVContent ? `CV de LinkedIn actual:\n${linkedinCVContent}\n` : ''}

IMPORTANTE: Debes crear contenido profesional específico y relevante, no genérico. Analiza el perfil e incluye palabras clave específicas del sector profesional detectado.

Genera contenido profesional para LinkedIn en ESPAÑOL y INGLÉS con el siguiente formato JSON:
{
  "spanish": {
    "headline": "titular profesional de máximo 220 caracteres, optimizado con palabras clave del sector",
    "summary": "resumen profesional de 3-4 párrafos (máximo 2600 caracteres) con emojis estratégicos, que incluya propuesta de valor, experiencia clave, logros cuantificados y call-to-action",
    "experience": "descripciones de experiencia laboral con logros específicos, métricas cuantificadas y palabras clave del sector",
    "education": "formación académica con contexto relevante, proyectos destacados y logros académicos",
    "skills": ["lista", "de", "habilidades", "técnicas", "y", "blandas", "específicas", "del", "sector"],
    "certifications": "certificaciones profesionales con fechas, instituciones y relevancia para el sector",
    "projects": "proyectos profesionales destacados con resultados medibles, tecnologías usadas y impacto",
    "volunteer": "experiencia de voluntariado que demuestre liderazgo, valores y habilidades transferibles",
    "accomplishments": "logros específicos, premios, reconocimientos, publicaciones o presentaciones relevantes",
    "interests": "intereses profesionales que complementen el perfil y muestren pasión por el sector"
  },
  "english": {
    "headline": "professional headline max 220 characters, optimized with industry keywords",
    "summary": "professional summary 3-4 paragraphs (max 2600 characters) with strategic emojis, including value proposition, key experience, quantified achievements and call-to-action",
    "experience": "job experience descriptions with specific achievements, quantified metrics and industry keywords",
    "education": "academic background with relevant context, featured projects and academic achievements",
    "skills": ["list", "of", "technical", "and", "soft", "skills", "specific", "to", "industry"],
    "certifications": "professional certifications with dates, institutions and industry relevance",
    "projects": "featured professional projects with measurable results, technologies used and impact",
    "volunteer": "volunteer experience demonstrating leadership, values and transferable skills",
    "accomplishments": "specific achievements, awards, recognition, publications or relevant presentations",
    "interests": "professional interests that complement profile and show passion for the industry"
  },
  "keywords_analysis": {
    "primary_keywords": ["palabras", "clave", "principales", "del", "sector"],
    "secondary_keywords": ["términos", "complementarios", "y", "sinónimos"],
    "industry_terms": ["terminología", "específica", "del", "sector", "profesional"]
  },
  "optimization_tips": [
    "consejos específicos para maximizar la visibilidad del perfil en LinkedIn"
  ]
}

REQUISITOS ESPECÍFICOS:
1. **Análisis sectorial profundo**: Identifica el sector profesional y usa terminología específica
2. **Palabras clave estratégicas**: Incluye términos que los reclutadores buscan en ese sector
3. **Sinónimos y variaciones**: Usa diferentes formas de expresar las mismas competencias
4. **Optimización de búsqueda**: El contenido debe ser encontrable por reclutadores
5. **Personalización**: Adapta el tono y contenido al nivel de seniority del profesional
6. **Storytelling profesional**: Cuenta una historia coherente de crecimiento profesional
7. **Call-to-action específico**: Incluye invitación clara para contactar
8. **Cuantificación obligatoria**: Todos los logros con números específicos
9. **Relevancia actual**: Contenido alineado con tendencias actuales del sector
10. **Diferenciación**: Destaca elementos únicos que distingan del resto de candidatos

El contenido debe ser específico al perfil analizado, no genérico. Infiere el sector profesional y adapta todo el contenido en consecuencia.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: 'Eres un experto en LinkedIn y marketing personal. Respondes siempre en formato JSON válido.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 4500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Parse JSON response
    let result;
    try {
      result = JSON.parse(aiResponse);
    } catch (e) {
      // Fallback if JSON parsing fails
      result = {
        spanish: {
          headline: "Profesional experimentado con enfoque en resultados",
          summary: "Profesional con sólida experiencia en el sector 💼 Enfocado en la excelencia operacional y el crecimiento sostenible.",
          experience: "Experiencia profesional destacada con logros cuantificados y resultados medibles",
          education: "Formación académica sólida con enfoque en desarrollo profesional continuo",
          skills: ["Liderazgo", "Gestión de Proyectos", "Análisis de Datos", "Comunicación Efectiva"],
          certifications: "Certificaciones profesionales relevantes para el crecimiento en el sector",
          projects: "Proyectos estratégicos con impacto medible en los resultados organizacionales",
          volunteer: "Experiencia de voluntariado que demuestra compromiso social y liderazgo",
          accomplishments: "Logros profesionales destacados con métricas específicas",
          interests: "Intereses profesionales alineados con tendencias del sector"
        },
        english: {
          headline: "Experienced Professional with Results-Driven Approach",
          summary: "Professional with solid industry experience 💼 Focused on operational excellence and sustainable growth.",
          experience: "Outstanding professional experience with quantified achievements and measurable results",
          education: "Solid academic background focused on continuous professional development",
          skills: ["Leadership", "Project Management", "Data Analysis", "Effective Communication"],
          certifications: "Professional certifications relevant for sector growth",
          projects: "Strategic projects with measurable impact on organizational results",
          volunteer: "Volunteer experience demonstrating social commitment and leadership",
          accomplishments: "Outstanding professional achievements with specific metrics",
          interests: "Professional interests aligned with industry trends"
        },
        keywords_analysis: {
          primary_keywords: ["liderazgo", "gestión", "resultados", "experiencia"],
          secondary_keywords: ["desarrollo", "crecimiento", "innovación", "eficiencia"],
          industry_terms: ["profesional", "estratégico", "operacional", "sostenible"]
        },
        optimization_tips: [
          "Incluye métricas específicas en cada logro mencionado",
          "Usa palabras clave relevantes para tu sector",
          "Actualiza regularmente con nuevos proyectos y certificaciones"
        ]
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in linkedin-optimizer-ai function:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});