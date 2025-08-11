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
  console.log("🚀 Interview Webhook function called with method:", req.method);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("📋 Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("📝 Processing webhook data...");

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

    console.log("📦 Webhook payload:", body);

    const { candidateID, url, interviewID } = body;

    // Validate required fields
    if (!candidateID || !url || !interviewID) {
      console.error("❌ Missing required fields:", {
        candidateID,
        url,
        interviewID,
      });
      return new Response(
        JSON.stringify({
          error: "Missing required fields: candidateID, url, interviewID",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("🔍 Searching for interview with interviewID:", interviewID);

    // Search for the interview by interviewID only
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
        "❌ Interview not found for candidateID:",
        candidateID,
        "or interviewID:",
        interviewID
      );
      return new Response(
        JSON.stringify({
          error: "Interview not found",
          candidateID,
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

    // Get candidate email from profiles table using user_id
    const { data: profile, error: profileError } = await supabase
      .from("profiles" as any)
      .select("email")
      .eq("user_id", interview.user_id)
      .single();

    if (profileError) {
      console.error("❌ Error fetching profile:", profileError);
      return new Response(
        JSON.stringify({
          error: "Error fetching candidate profile",
          details: profileError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const candidateEmail = profile?.email;

    // Validate that we have the candidate's email
    if (!candidateEmail) {
      console.error("❌ No email found for user:", interview.user_id);
      return new Response(
        JSON.stringify({
          error: "Candidate email not found",
          user_id: interview.user_id,
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("✅ Found candidate email:", candidateEmail);

    // Update the interview with new status and URL
    const { data: updatedInterview, error: updateError } = await supabase
      .from("interviews" as any)
      .update({
        status: "created-pending",
        interview_url: url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", interview.id)
      .select()
      .single();

    if (updateError) {
      console.error("❌ Error updating interview:", updateError);
      return new Response(
        JSON.stringify({
          error: "Error updating interview",
          details: updateError.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("✅ Interview updated successfully:", {
      id: updatedInterview.id,
      new_status: updatedInterview.status,
      interview_url: updatedInterview.interview_url,
    });

    // Send email notification to candidate
    try {
      console.log("📧 Sending email notification to candidate...");

      const sendable = {
        email: candidateEmail, // Email from the profiles table
        templateID: "d-598226c9e4d645ceb04979cfaeda952e",
        bcc: [],
        replyTo: [],
        isHTML: false,
        attachments: [],
        variables: {
          link: url,
        },
      };

      console.log("📤 Email payload:", {
        email: sendable.email,
        templateID: sendable.templateID,
        url: sendable.variables.link,
      });

      await fetch(
        "https://us-central1-pieza-development.cloudfunctions.net/onlySendEmailSendgrid",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(sendable),
        }
      );
    } catch (emailError) {
      console.error("❌ Error sending email:", emailError);
      // Don't fail the webhook if email fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Interview status updated successfully",
        data: {
          interview_id: updatedInterview.id,
          candidate_id: updatedInterview.candidate_id,
          interview_id_external: updatedInterview.interview_id,
          status: updatedInterview.status,
          interview_url: updatedInterview.interview_url,
          email_sent: true,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("💥 Error in interview-webhook function:", error);
    return new Response(
      JSON.stringify({
        error: "Error processing webhook",
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
