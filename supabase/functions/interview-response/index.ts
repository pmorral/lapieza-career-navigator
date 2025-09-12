import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Function to generate HTML for trial interview email
function generateTrialInterviewHTML(
  interview: any,
  analysis: any,
  summary: any
): string {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "success-interview":
        return "Completada";
      case "pending":
        return "Pendiente";
      case "in-progress":
        return "En progreso";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success-interview":
        return "#10B981"; // green-500
      case "pending":
        return "#F59E0B"; // amber-500
      case "in-progress":
        return "#3B82F6"; // blue-500
      default:
        return "#6B7280"; // gray-500
    }
  };

  return `
    <div class="interview-email-container">
      <style>
        .interview-email-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #374151;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f9fafb;
        }
        .container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        /* Mobile optimizations */
        @media only screen and (max-width: 600px) {
          .interview-email-container {
            padding: 10px;
            max-width: 100%;
          }
          .header {
            padding: 20px 15px !important;
          }
          .header h1 {
            font-size: 24px !important;
          }
          .header p {
            font-size: 14px !important;
          }
          .content {
            padding: 20px 15px !important;
          }
          .interview-meta {
            flex-direction: column !important;
            gap: 10px !important;
          }
          .interview-header {
            padding: 15px !important;
          }
          .interview-body {
            padding: 15px !important;
          }
          .section-content {
            padding: 12px !important;
          }
          .feedback-item {
            padding: 12px !important;
          }
          .cta-button {
            padding: 10px 20px !important;
            font-size: 14px !important;
          }
        }
        
        @media only screen and (max-width: 480px) {
          .interview-email-container {
            padding: 5px;
          }
          .header {
            padding: 15px 10px !important;
          }
          .header h1 {
            font-size: 20px !important;
          }
          .content {
            padding: 15px 10px !important;
          }
          .interview-header {
            padding: 10px !important;
          }
          .interview-body {
            padding: 10px !important;
          }
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
        }
        .header p {
          margin: 10px 0 0 0;
          opacity: 0.9;
          font-size: 16px;
        }
        .content {
          padding: 30px;
        }
        .interview-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          margin-bottom: 20px;
          overflow: hidden;
        }
        .interview-header {
          background: #f8fafc;
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
        }
        .interview-title {
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 10px 0;
        }
        .interview-meta {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
          margin-top: 15px;
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #6b7280;
        }
        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          color: white;
        }
        .interview-body {
          padding: 20px;
        }
        .section {
          margin-bottom: 25px;
        }
        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 15px 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .section-content {
          background: #f8fafc;
          padding: 15px;
          border-radius: 6px;
          border-left: 4px solid #667eea;
        }
        .feedback-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .feedback-item {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 15px;
          margin-bottom: 10px;
        }
        .feedback-question {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 8px;
        }
        .feedback-answer {
          color: #4b5563;
          margin-bottom: 10px;
        }
        .feedback-analysis {
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 4px;
          padding: 10px;
          font-size: 14px;
        }
        .footer {
          background: #f8fafc;
          padding: 20px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 14px;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 12px 24px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 600;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 ¡Tu entrevista AI está lista!</h1>
          <p>Has completado exitosamente tu entrevista de prueba gratuita</p>
        </div>
        
        <div class="content">
          <div class="interview-card">
            <div class="interview-header">
              <h2 class="interview-title">Entrevista AI - ${
                interview.job_title || "Posición"
              }</h2>
              <div class="interview-meta">
                <div class="meta-item">
                  <span>📅</span>
                  <span>Fecha: ${formatDate(interview.created_at)}</span>
                </div>
                <div class="meta-item">
                  <span>⏱️</span>
                  <span>Duración: ${interview.duration || "N/A"}</span>
                </div>
                <div class="meta-item">
                  <span class="status-badge" style="background-color: ${getStatusColor(
                    interview.status
                  )}">
                    ${getStatusText(interview.status)}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="interview-body">
              ${
                summary
                  ? `
                <div class="section">
                  <h3 class="section-title">📋 Resumen de la Entrevista</h3>
                  <div class="section-content">
                    <p>${summary}</p>
                  </div>
                </div>
              `
                  : ""
              }
              
              ${
                analysis && analysis.feedback
                  ? `
                <div class="section">
                  <h3 class="section-title">💡 Feedback Detallado</h3>
                  <div class="feedback-list">
                    ${analysis.feedback
                      .map(
                        (item: any, index: number) => `
                      <li class="feedback-item">
                        <div class="feedback-question">Pregunta ${index + 1}: ${
                          item.question || "Pregunta no disponible"
                        }</div>
                        ${
                          item.answer
                            ? `<div class="feedback-answer"><strong>Tu respuesta:</strong> ${item.answer}</div>`
                            : ""
                        }
                        ${
                          item.analysis
                            ? `
                          <div class="feedback-analysis">
                            <strong>Análisis:</strong> ${item.analysis}
                          </div>
                        `
                            : ""
                        }
                      </li>
                    `
                      )
                      .join("")}
                  </div>
                </div>
              `
                  : ""
              }
              
              ${
                analysis && analysis.overall_feedback
                  ? `
                <div class="section">
                  <h3 class="section-title">🎯 Evaluación General</h3>
                  <div class="section-content">
                    <p>${analysis.overall_feedback}</p>
                  </div>
                </div>
              `
                  : ""
              }
              
              ${
                analysis && analysis.recommendations
                  ? `
                <div class="section">
                  <h3 class="section-title">🚀 Recomendaciones</h3>
                  <div class="section-content">
                    <ul>
                      ${analysis.recommendations
                        .map((rec: string) => `<li>${rec}</li>`)
                        .join("")}
                    </ul>
                  </div>
                </div>
              `
                  : ""
              }
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://academy.lapieza.io/login" class="cta-button">
              🚀 Acceder a la Plataforma Completa
            </a>
         
          </div>
        </div>
        
        <div class="footer">
          <p>Este es un email automático de <strong>Academy by LaPieza</strong></p>
          <p>Si tienes preguntas, no dudes en contactarnos</p>
        </div>
      </div>
    </div>
  `;
}

serve(async (req) => {
  console.log("🚀 Interview Response function called with method:", req.method);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("📋 Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("📝 Processing interview response data...");

    // Parse JSON body
    const body = await req.json();
    console.log("📦 Interview response payload received");

    const {
      candidateId,
      interviewId,
      assistantId,
      type,
      isProd,
      startedAt,
      endedAt,
      transcript,
      recordingUrl,
      summary,
      createdAt,
      updatedAt,
      orgId,
      cost,
      costBreakdown,
      costs,
      analysis,
      webCallUrl,
      status,
      endedReason,
      stereoRecordingUrl,
      summaryTranslations,
      aiSummary,
      monitor,
      transport,
    } = body;

    // Validate required fields
    if (!candidateId || !interviewId) {
      console.error("❌ Missing required fields:", {
        candidateId,
        interviewId,
      });
      return new Response(
        JSON.stringify({
          error: "Missing required fields: candidateId, interviewId",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("🔍 Searching for interview with interviewId:", interviewId);

    // Search for the interview by interviewId only
    const { data: interviews, error: searchError } = await supabase
      .from("interviews" as any)
      .select("*")
      .eq("interview_id", interviewId)
      .limit(1);

    if (searchError) {
      console.error("❌ Error searching for interview:", searchError);
      return new Response(
        JSON.stringify({
          error: "Error searching for interview",
          details: searchError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!interviews || interviews.length === 0) {
      console.error("❌ Interview not found for interviewId:", interviewId);
      return new Response(
        JSON.stringify({
          error: "Interview not found",
          interviewId,
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const interview = interviews[0];
    console.log("✅ Found interview:", {
      id: interview.id,
      candidate_id: interview.candidate_id,
      interview_id: interview.interview_id,
      current_status: interview.status,
    });

    // First, update the interview status to success-interview
    const { error: updateError } = await supabase
      .from("interviews" as any)
      .update({
        status: "success-interview",
        updated_at: new Date().toISOString(),
      })
      .eq("id", interview.id);

    if (updateError) {
      console.error("❌ Error updating interview status:", updateError);
      return new Response(
        JSON.stringify({
          error: "Error updating interview status",
          details: updateError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("✅ Interview status updated to success-interview");

    // Now save the complete interview response data
    console.log("💾 Saving interview response data...");

    const responseData = {
      interview_id: interview.id,
      candidate_id: candidateId,
      interview_id_external: interviewId,
      assistant_id: assistantId,
      type,
      is_prod: isProd,
      started_at: startedAt,
      ended_at: endedAt,
      transcript,
      recording_url: recordingUrl,
      stereo_recording_url: stereoRecordingUrl,
      web_call_url: webCallUrl,
      status,
      ended_reason: endedReason,
      created_at_external: createdAt,
      updated_at_external: updatedAt,
      org_id: orgId,
      cost,
      cost_breakdown: costBreakdown,
      costs,
      summary,
      summary_translations: summaryTranslations,
      ai_summary: aiSummary,
      analysis,
      monitor,
      transport,
    };

    console.log("📊 Response data to insert:", {
      interview_id: interview.id,
      candidate_id: candidateId,
      interview_id_external: interviewId,
      transcript_length: transcript?.length || 0,
      summary_length: summary?.length || 0,
      has_ai_summary: !!aiSummary,
      cost,
    });

    const { data: responseRecord, error: insertError } = await supabase
      .from("interview_responses" as any)
      .insert(responseData)
      .select()
      .single();

    if (insertError) {
      console.error("❌ Error saving interview response:", insertError);
      return new Response(
        JSON.stringify({
          error: "Error saving interview response",
          details: insertError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("✅ Interview response saved successfully:", {
      response_id: responseRecord.id,
      interview_id: responseRecord.interview_id,
      candidate_id: responseRecord.candidate_id,
    });

    // Update the interview record to reference the response
    const { error: linkError } = await supabase
      .from("interviews" as any)
      .update({
        response_id: responseRecord.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", interview.id);

    if (linkError) {
      console.error("❌ Error linking response to interview:", linkError);
      // Don't fail the whole request, just log the error
    } else {
      console.log("✅ Interview linked to response:", responseRecord.id);
    }

    // Get user email to send feedback completion notification
    console.log("📧 Getting user email for feedback notification...");
    const { data: profileData, error: profileError } = await supabase
      .from("profiles" as any)
      .select("email, full_name")
      .eq("user_id", interview.user_id)
      .single();

    if (profileError) {
      console.error("❌ Error getting user profile:", profileError);
      // Don't fail the request, just log the error
    } else if (profileData?.email) {
      console.log(
        "📨 Sending feedback completion email to:",
        profileData.email
      );

      try {
        // Check if this is a trial interview
        const isTrialInterview = interview.source === "trial";
        console.log(
          "🔍 Interview source:",
          interview.source,
          "Is trial:",
          isTrialInterview
        );

        let sendable;

        if (isTrialInterview) {
          // For trial interviews, use specific template and HTML body
          console.log("🎯 Processing trial interview email");

          // Generate HTML content for trial interview (similar to platform history view)
          const htmlBody = generateTrialInterviewHTML(
            interview,
            analysis,
            summary
          );

          sendable = {
            email: profileData.email,
            templateID: "d-fa0c16c6714a421692ebca9c34fcf301",
            attachments: [],
            data: {
              body: htmlBody, // HTML content for the trial interview
            },
            fromLocal: {
              name: "Academy by LaPieza",
              email: "tulia.valdez@lapieza.io",
            },
          };
        } else {
          // For regular interviews, use existing template
          sendable = {
            email: profileData.email,
            templateID: "d-1a77707a26874cd197b22f48e16b37f0",
            attachments: [],
            data: {
              // Template doesn't need variables according to the user
            },
            fromLocal: {
              name: "Academy by LaPieza",
              email: "tulia.valdez@lapieza.io",
            },
          };
        }

        // Send email via SendGrid
        const emailResponse = await fetch(
          "https://us-central1-pieza-development.cloudfunctions.net/onlySendEmailSendgrid",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(sendable),
          }
        );

        if (emailResponse.ok) {
          console.log("✅ Feedback completion email sent successfully");
        } else {
          console.error(
            "❌ Error sending feedback email:",
            await emailResponse.text()
          );
        }
      } catch (emailError) {
        console.error("❌ Exception sending feedback email:", emailError);
      }
    } else {
      console.log("⚠️ No email found for user, skipping notification");
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Interview response processed successfully",
        data: {
          interview_id: interview.id,
          response_id: responseRecord.id,
          candidate_id: candidateId,
          interview_id_external: interviewId,
          status: "success-interview",
          summary: summary?.substring(0, 100) + "...",
          cost,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("💥 Error in interview-response function:", error);
    return new Response(
      JSON.stringify({
        error: "Error processing interview response",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
