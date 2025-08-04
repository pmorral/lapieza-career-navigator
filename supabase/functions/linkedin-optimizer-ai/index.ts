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
    const { personalCVContent, linkedinCVContent } = await req.json();

    const prompt = `Eres un experto en LinkedIn y marketing personal. 

Analiza el siguiente CV personal${linkedinCVContent ? ' y el CV de LinkedIn' : ''} para generar contenido optimizado para LinkedIn.

CV Personal:
${personalCVContent}

${linkedinCVContent ? `CV de LinkedIn actual:\n${linkedinCVContent}\n` : ''}

Genera contenido profesional para LinkedIn en ESPAÑOL y INGLÉS con el siguiente formato JSON:
{
  "spanish": {
    "headline": "titular profesional optimizado para LinkedIn",
    "summary": "resumen profesional de 2-3 párrafos con emojis relevantes",
    "experience": "descripción de experiencia con logros cuantificados",
    "education": "educación y certificaciones",
    "skills": ["lista", "de", "habilidades", "relevantes"],
    "certifications": "certificaciones profesionales",
    "projects": "proyectos destacados",
    "volunteer": "experiencia de voluntariado"
  },
  "english": {
    "headline": "professional headline optimized for LinkedIn",
    "summary": "professional summary 2-3 paragraphs with relevant emojis",
    "experience": "experience description with quantified achievements",
    "education": "education and certifications",
    "skills": ["list", "of", "relevant", "skills"],
    "certifications": "professional certifications",
    "projects": "featured projects",
    "volunteer": "volunteer experience"
  }
}

El contenido debe:
1. Ser atractivo y profesional
2. Incluir palabras clave relevantes
3. Mostrar logros cuantificados
4. Usar emojis apropiados en el resumen
5. Ser optimizado para búsquedas de LinkedIn`;

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
        temperature: 0.7,
        max_tokens: 2500,
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
          headline: "Profesional experimentado",
          summary: "Profesional con experiencia en el área 💼",
          experience: "Experiencia profesional destacada",
          education: "Educación profesional",
          skills: ["Habilidad 1", "Habilidad 2"],
          certifications: "Certificaciones profesionales",
          projects: "Proyectos destacados",
          volunteer: "Experiencia de voluntariado"
        },
        english: {
          headline: "Experienced Professional",
          summary: "Professional with area experience 💼",
          experience: "Outstanding professional experience",
          education: "Professional education",
          skills: ["Skill 1", "Skill 2"],
          certifications: "Professional certifications",
          projects: "Featured projects",
          volunteer: "Volunteer experience"
        }
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