import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received webhook request from Resend");

    const event = await req.json();
    console.log("Event type:", event.type);

    // Process email.received events
    if (event.type === "email.received") {
      const emailData = event.data;
      
      console.log("Received email:", {
        from: emailData.from,
        to: emailData.to,
        subject: emailData.subject,
        email_id: emailData.email_id,
      });

      // Here you can implement different logic based on the recipient
      // For example, route support emails differently than other emails
      const recipient = emailData.to[0] || "";
      
      if (recipient.includes("support@")) {
        console.log("Support email received - processing support request");
        // TODO: Process support email
        // - Fetch email content from Resend API
        // - Store in database
        // - Send notification to admin
      } else if (recipient.includes("noreply@")) {
        console.log("Reply to noreply address - could be auto-reply or bounce");
        // TODO: Handle replies to noreply
      } else {
        console.log("General email received");
        // TODO: Handle general emails
      }

      // Optionally fetch the full email content and attachments
      // if you need to process them
      const resendApiKey = Deno.env.get("RESEND_API_KEY");
      if (resendApiKey && emailData.email_id) {
        try {
          // Fetch email content
          const emailResponse = await fetch(
            `https://api.resend.com/emails/${emailData.email_id}`,
            {
              headers: {
                Authorization: `Bearer ${resendApiKey}`,
              },
            }
          );

          if (emailResponse.ok) {
            const fullEmail = await emailResponse.json();
            console.log("Full email content retrieved");
            
            // Process email content
            // Example: Save to database, forward to team, etc.
            
          } else {
            console.error("Failed to fetch email content:", await emailResponse.text());
          }
        } catch (error) {
          console.error("Error fetching email content:", error);
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Email received and processed" 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Handle other event types if needed
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Event received" 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});