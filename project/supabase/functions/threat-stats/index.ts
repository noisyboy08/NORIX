import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

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
    const action = url.searchParams.get("action") || "stats";

    if (action === "stats") {
      const { data: allDetections } = await supabase
        .from("threat_detections")
        .select("risk_level, is_phishing, created_at")
        .order("created_at", { ascending: false });

      const totalScans = allDetections?.length || 0;
      const threatsDetected = allDetections?.filter(d => d.is_phishing).length || 0;
      const safeResults = allDetections?.filter(d => !d.is_phishing).length || 0;

      const riskDistribution = {
        critical: allDetections?.filter(d => d.risk_level === 'critical').length || 0,
        high: allDetections?.filter(d => d.risk_level === 'high').length || 0,
        medium: allDetections?.filter(d => d.risk_level === 'medium').length || 0,
        low: allDetections?.filter(d => d.risk_level === 'low').length || 0,
        safe: allDetections?.filter(d => d.risk_level === 'safe').length || 0,
      };

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const scansToday = allDetections?.filter(d => new Date(d.created_at) >= today).length || 0;

      const stats = {
        totalScans,
        threatsDetected,
        safeResults,
        scansToday,
        riskDistribution,
        detectionRate: totalScans > 0 ? ((threatsDetected / totalScans) * 100).toFixed(1) : 0,
      };

      return new Response(JSON.stringify(stats), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "recent") {
      const limit = parseInt(url.searchParams.get("limit") || "10");

      const { data: recentDetections } = await supabase
        .from("threat_detections")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      return new Response(JSON.stringify(recentDetections || []), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "top-threats") {
      const { data: topThreats } = await supabase
        .from("known_threats")
        .select("*")
        .eq("is_active", true)
        .order("times_detected", { ascending: false })
        .limit(10);

      return new Response(JSON.stringify(topThreats || []), {
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
