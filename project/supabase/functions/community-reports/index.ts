import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ReportRequest {
  urlOrContent: string;
  reportType: string;
  threatCategory: string;
  description: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
      Deno.env.get("SUPABASE_ANON_KEY");
    if (!supabaseKey) {
      return new Response(
        JSON.stringify({ error: "Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "submit";

    if (action === "submit" && req.method === "POST") {
      const { urlOrContent, reportType, threatCategory, description }: ReportRequest = await req.json();

      const { data: existing } = await supabase
        .from("user_reports")
        .select("id, report_count")
        .eq("url_or_content", urlOrContent)
        .eq("threat_category", threatCategory)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("user_reports")
          .update({ report_count: existing.report_count + 1 })
          .eq("id", existing.id);

        return new Response(
          JSON.stringify({ success: true, message: "Report added to existing threat", reportCount: existing.report_count + 1 }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } else {
        const { data: newReport, error } = await supabase
          .from("user_reports")
          .insert({
            url_or_content: urlOrContent,
            report_type: reportType,
            threat_category: threatCategory,
            description,
          })
          .select()
          .single();

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        return new Response(
          JSON.stringify({ success: true, message: "Report submitted successfully", reportId: newReport.id }),
          {
            status: 201,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    if (action === "top-reported") {
      const { data: topReports } = await supabase
        .from("user_reports")
        .select("*")
        .order("report_count", { ascending: false })
        .limit(20);

      return new Response(JSON.stringify(topReports || []), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "by-category") {
      const category = url.searchParams.get("category");
      if (!category) {
        return new Response(
          JSON.stringify({ error: "Category parameter required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: reports } = await supabase
        .from("user_reports")
        .select("*")
        .eq("threat_category", category)
        .order("report_count", { ascending: false })
        .limit(50);

      return new Response(JSON.stringify(reports || []), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "scam-patterns") {
      const { data: patterns } = await supabase
        .from("scam_patterns")
        .select("*")
        .eq("is_active", true);

      return new Response(JSON.stringify(patterns || []), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
