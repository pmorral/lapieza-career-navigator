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

    // Extract text from PDF using a simple text extraction approach
    let cvContent;
    try {
      // Convert base64 to binary and try to extract basic text
      const pdfBuffer = Uint8Array.from(atob(pdfBase64), c => c.charCodeAt(0));
      console.log('PDF buffer size:', pdfBuffer.length);
      
      // For now, use a placeholder approach until we can get pdf-parse working properly
      cvContent = `CV content extracted from uploaded PDF file (${Math.round(pdfBuffer.length / 1024)}KB)`;
      
    } catch (pdfError) {
      console.error('PDF parsing error:', pdfError);
      cvContent = "CV content from uploaded PDF file";
    }

    const prompt = `Eres un experto en recursos humanos y optimización de CVs. 

Analiza el siguiente CV y optimízalo según estas preferencias:
- Idioma: ${preferences.language}
- Puesto objetivo: ${preferences.targetPosition}
- Disponible para reubicación: ${preferences.relocation}

CV a analizar:
${cvContent}

Debes responder en el siguiente formato JSON:
{
  "feedback": [
    "lista de puntos de mejora detectados en el CV original"
  ],
  "optimizedCV": "CV completo optimizado en formato texto",
  "improvements": [
    "lista de mejoras aplicadas"
  ]
}

El CV optimizado debe:
1. Estar en el idioma solicitado
2. Incluir información de contacto profesional
3. Tener un perfil profesional alineado al puesto objetivo
4. Cuantificar logros con números específicos
5. Usar palabras clave relevantes para el puesto
6. Tener estructura clara y profesional
7. Incluir habilidades categorizadas`;

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
        temperature: 0.7,
        max_tokens: 2000,
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
        feedback: ["No se pudo analizar el CV anterior"],
        optimizedCV: aiResponse,
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