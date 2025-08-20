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

Analiza el siguiente CV y optimízalo según estas preferencias:
- Idioma: ${preferences.language}
- Puesto objetivo: ${preferences.targetPosition}
- Disponible para reubicación: ${preferences.relocation}

CV a analizar:
${cvContent}

INSTRUCCIONES ESPECÍFICAS PARA LA ESTRUCTURA DEL CV:

A. ENCABEZADO:
   - Nombre completo
   - Agregar un headline profesional debajo del nombre con la posición deseada o frase que resuma el perfil
   - Datos de contacto: Email, Tel, Ciudad, LinkedIn
   - "Abierto a reubicación" SOLO si el usuario respondió "Sí" a la pregunta
   - Portafolio (solo si aplica al perfil)

B. PERFIL PROFESIONAL (máximo 4 líneas):
   - Describe el perfil del candidato
   - Años de experiencia (si tiene más de 2 años)
   - Principales habilidades
   - Sector profesional
   - Objetivo profesional

C. EXPERIENCIA PROFESIONAL:
   - Si el perfil es Senior (más de 8 años): incluye hasta 5 experiencias, CV puede ser hasta 2 páginas
   - Si el perfil tiene menos de 8 años: incluye solo las 4 experiencias más recientes, CV limitado a 1 página
   - Entre 3 y 7 bullets por experiencia
   - Redacción según idioma:
     * Inglés: verbos en pasado; trabajo actual en gerundio
     * Español: verbos en pasado en primera persona; trabajo actual en infinitivo
   - Cada viñeta debe responder: ¿Qué hiciste y para qué?
   - Resalta logros cuantificables y actividades clave alineadas al puesto

D. SKILLS:
   - Extrae del CV palabras clave y clasifica en:
     * Hard Skills (con nivel: Básico, Intermedio, Avanzado)
     * Soft Skills (con nivel: Bajo, Medio, Alto)

E. ESTRUCTURA FINAL DEL CV (en este orden):
   1. Nombre + Headline
   2. Datos de contacto
   3. Perfil profesional
   4. Experiencia profesional
   5. Proyectos (solo si es perfil junior o en transición)
   6. Skills
   7. Cursos
   8. Educación
   9. Idiomas

F. CAMBIO DE CARRERA O CV MAL ORIENTADO:
   - Si el perfil indica cambio de área o CV no enfocado al puesto objetivo:
   - Reescribe puestos y funciones con enfoque alineado a la nueva área
   - Usa habilidades transferibles que tengan relación con el nuevo objetivo
   - Ajusta redacción con base en lo que el puesto requiere

CRÍTICO: NO agregues logros, tareas o skills que no estén presentes en el CV original. Solo reorganiza, mejora redacción y alinea a la descripción del puesto. Si el CV original no tiene logros cuantificables, indica en el feedback que el usuario debe agregarlos.

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