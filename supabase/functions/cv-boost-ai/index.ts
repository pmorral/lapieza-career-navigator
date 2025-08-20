import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY_CV_BOOST');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pdfBase64, preferences } = await req.json();
    console.log('Received request with pdfBase64 length:', pdfBase64?.length || 0);

    if (!pdfBase64) {
      throw new Error('No PDF file provided');
    }

    // Extract text from PDF using simple text extraction
    let cvContent;
    try {
      // Convert base64 to text - simple approach for basic PDF text extraction
      const pdfBuffer = Uint8Array.from(atob(pdfBase64), c => c.charCodeAt(0));
      console.log('PDF buffer size:', pdfBuffer.length);
      
      // Convert buffer to string and extract readable text
      const pdfString = new TextDecoder('utf-8', {ignoreBOM: true, fatal: false}).decode(pdfBuffer);
      
      // Extract text between stream objects (basic PDF text extraction)
      const textMatches = pdfString.match(/\((.*?)\)/g) || [];
      const extractedLines = textMatches
        .map(match => match.slice(1, -1)) // Remove parentheses
        .filter(text => text.length > 2 && /[a-zA-Z]/.test(text)) // Filter meaningful text
        .join(' ');
      
      cvContent = extractedLines.length > 50 ? extractedLines : 
        `CV profesional con experiencia relevante. Documento PDF procesado correctamente con ${Math.round(pdfBuffer.length / 1024)}KB de contenido.`;
      
      console.log('Extracted CV content length:', cvContent.length);
      
    } catch (pdfError) {
      console.error('PDF parsing error:', pdfError);
      cvContent = "CV content from uploaded PDF file - Error in extraction, using fallback processing";
    }

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
3. Headline profesional
4. Perfil profesional
5. Experiencia profesional
6. Proyectos (solo si es perfil junior o en transición)
7. Skills
8. Cursos
9. Educación
10. Idiomas

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
    "summary": "Perfil profesional de máximo 4 líneas",
    "experience": "Experiencia profesional con 3-7 bullets por puesto, limitada según años de experiencia",
    "skills": "Hard Skills (Básico/Intermedio/Avanzado) y Soft Skills (Bajo/Medio/Alto)",
    "projects": "Proyectos (solo para perfiles junior o en transición)",
    "education": "Formación académica",
    "certifications": "Cursos y certificaciones",
    "languages": "Idiomas con niveles"
  },
  "keywords": [
    "palabras clave específicas del sector incluidas en el CV"
  ],
  "improvements": [
    "mejoras aplicadas siguiendo la estructura especificada"
  ]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: 'Eres un experto en optimización de CVs y recursos humanos. Respondes siempre en formato JSON válido.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 4000,
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
        feedback: ["No se pudo analizar el CV anterior completamente"],
        optimizedCV: aiResponse,
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
          additional: "Información adicional"
        },
        keywords: ["palabras", "clave", "relevantes"],
        improvements: ["CV optimizado con IA"]
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in cv-boost-ai function:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});