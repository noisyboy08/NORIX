import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ExplanationRequest {
  detectionId: string;
  threatIndicators: any[];
  riskScore: number;
  content: string;
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
    const geminiKey = Deno.env.get("GEMINI_API_KEY");

    const { detectionId, threatIndicators, riskScore, content }: ExplanationRequest = await req.json();

    if (!geminiKey) {
      return new Response(
        JSON.stringify({
          explanation: generateLocalExplanation(threatIndicators, riskScore),
          riskFactors: generateRiskFactors(threatIndicators),
          recommendedAction: getRecommendedAction(riskScore),
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const prompt = generatePrompt(threatIndicators, riskScore, content);

    const geminiResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": geminiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 500,
        },
      }),
    });

    let explanation = generateLocalExplanation(threatIndicators, riskScore);

    if (geminiResponse.ok) {
      const geminiData = await geminiResponse.json();
      if (geminiData.candidates?.[0]?.content?.parts?.[0]?.text) {
        explanation = geminiData.candidates[0].content.parts[0].text;
      }
    }

    if (!supabaseKey) {
      // Explanation can still be returned without storing in DB
      return new Response(
        JSON.stringify({
          explanation: geminiKey ? "Explanation generated, but storage is unavailable (missing Supabase key)." : generateLocalExplanation(threatIndicators, riskScore),
          riskFactors: generateRiskFactors(threatIndicators),
          recommendedAction: getRecommendedAction(riskScore),
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase.from("threat_explanations").insert({
      detection_id: detectionId,
      gemini_explanation: explanation,
      risk_factors: generateRiskFactors(threatIndicators),
      recommended_action: getRecommendedAction(riskScore),
    });

    return new Response(
      JSON.stringify({
        explanation,
        riskFactors: generateRiskFactors(threatIndicators),
        recommendedAction: getRecommendedAction(riskScore),
      }),
      {
        status: 200,
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

function generatePrompt(threatIndicators: any[], riskScore: number, content: string): string {
  const indicators = threatIndicators.map(t => `- ${t.rule}: ${t.description}`).join("\n");

  return `You are a cybersecurity expert analyzing a potential phishing/scam attempt.

Risk Score: ${riskScore}%

Detected Threats:
${indicators}

Content analyzed: ${content.substring(0, 500)}

Provide a clear, non-technical explanation of:
1. Why this is flagged as potentially dangerous (2-3 sentences max)
2. Specific warning signs detected
3. What the attacker might be trying to do
4. What the user should do to protect themselves

Be concise and actionable.`;
}

function generateLocalExplanation(threatIndicators: any[], riskScore: number): string {
  if (riskScore >= 80) {
    return `This content shows strong indicators of a phishing or scam attempt. Multiple warning signs have been detected: ${threatIndicators
      .slice(0, 3)
      .map(t => t.rule.toLowerCase())
      .join(", ")}. Do not interact with this content or provide any personal information.`;
  } else if (riskScore >= 60) {
    return `This content appears suspicious and may be attempting to trick you. Detected warnings include: ${threatIndicators
      .slice(0, 2)
      .map(t => t.rule.toLowerCase())
      .join(", ")}. Be cautious before clicking links or entering information.`;
  } else if (riskScore >= 40) {
    return `This content has some potentially suspicious characteristics. While not definitively malicious, exercise caution. Main concerns: ${threatIndicators
      .slice(0, 1)
      .map(t => t.rule.toLowerCase())
      .join(", ")}.`;
  } else {
    return "This content appears relatively safe, but always verify sender information and be cautious with unsolicited requests.";
  }
}

function generateRiskFactors(threatIndicators: any[]): Record<string, any> {
  const factors: Record<string, any> = {};

  threatIndicators.forEach(indicator => {
    factors[indicator.rule] = {
      severity: indicator.weight > 20 ? "high" : indicator.weight > 10 ? "medium" : "low",
      weight: indicator.weight,
      description: indicator.description,
    };
  });

  return factors;
}

function getRecommendedAction(riskScore: number): string {
  if (riskScore >= 80) {
    return "Do not interact with this content. Delete it immediately. If you received this from someone you know, contact them through another channel to verify.";
  } else if (riskScore >= 60) {
    return "Be cautious. Do not click links or download attachments. Verify any requests by contacting the organization directly using official contact information.";
  } else if (riskScore >= 40) {
    return "Exercise normal caution. Verify sender information before interacting. Don't provide personal information unless you initiated contact.";
  } else {
    return "Appears safe to interact with, but maintain standard security practices.";
  }
}
