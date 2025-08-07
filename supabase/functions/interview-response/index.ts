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
      id,
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

    console.log(
      "🔍 Searching for interview with candidateId:",
      candidateId,
      "or interviewId:",
      interviewId
    );

    // Search for the interview by candidateId or interviewId
    const { data: interviews, error: searchError } = await supabase
      .from("interviews" as any)
      .select("*")
      .or(`candidate_id.eq.${candidateId},interview_id.eq.${interviewId}`)
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
      console.error(
        "❌ Interview not found for candidateId:",
        candidateId,
        "or interviewId:",
        interviewId
      );
      return new Response(
        JSON.stringify({
          error: "Interview not found",
          candidateId,
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
