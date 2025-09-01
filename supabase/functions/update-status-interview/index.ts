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
  console.log("🚀 Update Status Interview function called with method:", req.method);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("📋 Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("📝 Processing update status request...");

    // Check if request has content
    const contentType = req.headers.get("content-type");
    console.log("📋 Content-Type:", contentType);

    if (!contentType || !contentType.includes("application/json")) {
      console.error("❌ Invalid content type:", contentType);
      return new Response(
        JSON.stringify({
          error: "Content-Type must be application/json",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get request body as text first
    const bodyText = await req.text();
    console.log("📄 Raw body text:", bodyText);

    if (!bodyText || bodyText.trim() === "") {
      console.error("❌ Empty request body");
      return new Response(
        JSON.stringify({
          error: "Request body is empty",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse JSON body
    let body;
    try {
      body = JSON.parse(bodyText);
    } catch (parseError) {
      console.error("❌ JSON parse error:", parseError);
      return new Response(
        JSON.stringify({
          error: "Invalid JSON format",
          details: parseError.message,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("📦 Request payload:", body);

    const { candidateID, status, interviewID } = body;

    // Validate required fields
    if (!candidateID || !status || !interviewID) {
      console.error("❌ Missing required fields:", {
        candidateID,
        status,
        interviewID,
      });
      return new Response(
        JSON.stringify({
          error: "Missing required fields: candidateID, status, interviewID",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate status value
    const validStatuses = ["analyzing-interview", "created-pending", "completed", "failed"];
    if (!validStatuses.includes(status)) {
      console.error("❌ Invalid status:", status);
      return new Response(
        JSON.stringify({
          error: "Invalid status. Must be one of: analyzing-interview, created-pending, completed, failed",
          receivedStatus: status,
          validStatuses,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("🔍 Searching for interview with interviewID:", interviewID);

    // Search for the interview by interviewID
    const { data: interviews, error: searchError } = await supabase
      .from("interviews" as any)
      .select("*")
      .eq("interview_id", interviewID)
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
        "❌ Interview not found for interviewID:",
        interviewID
      );
      return new Response(
        JSON.stringify({
          error: "Interview not found",
          interviewID,
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
      user_id: interview.user_id,
    });

    // Verify that the candidateID matches
    if (interview.candidate_id !== candidateID) {
      console.error("❌ Candidate ID mismatch:", {
        provided: candidateID,
        found: interview.candidate_id,
      });
      return new Response(
        JSON.stringify({
          error: "Candidate ID mismatch",
          provided: candidateID,
          found: interview.candidate_id,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("✅ Candidate ID verified successfully");

    // Update the interview status
    const { data: updatedInterview, error: updateError } = await supabase
      .from("interviews" as any)
      .update({
        status: status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", interview.id)
      .select()
      .single();

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

    console.log("✅ Interview status updated successfully:", {
      id: updatedInterview.id,
      old_status: interview.status,
      new_status: updatedInterview.status,
      updated_at: updatedInterview.updated_at,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Interview status updated successfully",
        data: {
          interview_id: updatedInterview.id,
          candidate_id: updatedInterview.candidate_id,
          interview_id_external: updatedInterview.interview_id,
          old_status: interview.status,
          new_status: updatedInterview.status,
          updated_at: updatedInterview.updated_at,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("💥 Error in update-status-interview function:", error);
    return new Response(
      JSON.stringify({
        error: "Error processing status update request",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
