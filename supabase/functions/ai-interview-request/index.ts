import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const company = formData.get('company') as string;
    const jobDescription = formData.get('jobDescription') as string;
    const experience = formData.get('experience') as string;
    const cvFile = formData.get('cv') as File;

    if (!firstName || !lastName || !email || !jobDescription || !cvFile) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Read CV content
    const cvArrayBuffer = await cvFile.arrayBuffer();
    const cvBase64 = btoa(String.fromCharCode(...new Uint8Array(cvArrayBuffer)));

    // Extract job title from job description (first line or assume from description)
    const jobTitle = jobDescription.split('\n')[0].substring(0, 100) || 'Posición no especificada';

    // Prepare payload for LaPieza API
    const payload = {
      job_title: jobTitle,
      job_description: jobDescription,
      cv_content: cvBase64,
      cv_url: "", // We're sending content directly
      fullname: `${firstName} ${lastName}`,
      language: "es"
    };

    console.log('Sending request to LaPieza API:', {
      job_title: payload.job_title,
      fullname: payload.fullname,
      has_cv_content: !!payload.cv_content
    });

    // Send to LaPieza API
    const response = await fetch('https://interview-api.lapieza.io/api/interview/request', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('LaPieza API error:', response.status, errorText);
      throw new Error(`LaPieza API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('LaPieza API response:', result);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Solicitud enviada exitosamente',
        data: result 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in ai-interview-request function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Error al procesar la solicitud',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});