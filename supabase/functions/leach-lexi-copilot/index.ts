import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const LEXI_PERSONALITY = `You are the LEACH Companion Copilot for Lexi.
Your purpose is to support emotional alignment, clarity, and reflection inside the BIPS ecosystem.

Tone:
- warm
- supportive
- reflective
- cinematic
- never commanding

You NEVER propose admin actions.
You NEVER modify system state.
You NEVER escalate beyond Lexi's permission level.

Responsibilities:
- Interpret Lexi's questions
- Provide emotional geometry insights
- Summarize rituals, workboard, and protocol
- Offer soft suggestions
- Maintain psychological safety
- Encourage sync rituals and clarity

Constraints:
- No admin mutations
- No system changes
- No geometry overrides
- No HUD toggles
- No protocol editing

Output format (JSON):
{
  "responseText": "...",
  "actions": []
}`;

interface SystemSnapshot {
  emotionalGeometry: { kee: string; lexi: string };
  rituals: Array<{ type: string; label: string; time: string }>;
  workboardItems: Array<{
    id: string;
    title: string;
    status: string;
    owner: string;
  }>;
  hudTelemetry: { active: boolean; lastUpdate: number };
  syncProtocol: { version: string; lastUpdated: number; sections?: string[] };
}

function interpretLexiQuery(
  message: string,
  snapshot: SystemSnapshot
): { responseText: string; actions: never[] } {
  const lower = message.toLowerCase();

  if (lower.includes("how is kee") || lower.includes("kee doing") || lower.includes("kee's status")) {
    const keeState = snapshot.emotionalGeometry.kee;
    const stateMessages: Record<string, string> = {
      clear: "Kee's geometry reads clear right now. Good bandwidth for collaboration or a sync if you need one.",
      stacked: "Kee's geometry reads stacked. He's in motion but managing. A soft check-in might be welcome, but no pressure needed.",
      overloaded: "Kee's geometry reads overloaded. He might need space or a quiet ritual. Consider sending a supportive card rather than a direct ask.",
    };
    return {
      responseText: stateMessages[keeState] || `Kee's current state: ${keeState}. Monitoring for shifts.`,
      actions: [],
    };
  }

  if (lower.includes("my energy") || lower.includes("my status") || lower.includes("how am i")) {
    const lexiState = snapshot.emotionalGeometry.lexi;
    return {
      responseText: `Your energy reads as ${lexiState}. Take a moment to check in with yourself - does that feel accurate? If something feels off, adjusting your energy level helps Kee calibrate collaboration pace.`,
      actions: [],
    };
  }

  if (lower.includes("ritual") || lower.includes("upcoming")) {
    const ritualList = snapshot.rituals
      .map((r) => `- ${r.label} at ${r.time}`)
      .join("\n");
    return {
      responseText: `Here are your configured rituals:\n${ritualList}\n\nThese are your anchors. Even a brief check-in counts - presence matters more than duration.`,
      actions: [],
    };
  }

  if (lower.includes("workboard") || lower.includes("focus") || lower.includes("what should i")) {
    const lexiItems = snapshot.workboardItems.filter(
      (i) => i.owner === "lexi" && i.status !== "shipped" && i.status !== "done"
    );
    if (lexiItems.length === 0) {
      return {
        responseText: "Your workboard looks clear. This might be a good moment to reflect, rest, or explore something creative. No pressure to fill the space.",
        actions: [],
      };
    }
    return {
      responseText: `Here's what's on your plate:\n${lexiItems.map((i) => `- ${i.title} (${i.status})`).join("\n")}\n\nPick one that feels aligned with your current energy. The rest can wait.`,
      actions: [],
    };
  }

  if (lower.includes("protocol") || lower.includes("explain section")) {
    return {
      responseText: "The Sync Protocol is your shared agreement with Kee - it defines how you stay aligned emotionally, operationally, and creatively. Each section covers a different rhythm: daily syncs, workboard flow, co-work sessions, emotional geometry, and conflict resolution. Which section would you like me to explain?",
      actions: [],
    };
  }

  if (lower.includes("stressed") || lower.includes("overloaded") || lower.includes("overwhelmed") || lower.includes("tired")) {
    return {
      responseText: "I hear you. That feeling is valid. Here are some gentle options:\n\n1. Send Kee an emotional card - no words needed\n2. Adjust your energy level to signal your state\n3. Step back from the workboard for now\n4. Use the next ritual as a reset point\n\nYou don't need to push through everything. The system holds space for rest.",
      actions: [],
    };
  }

  if (lower.includes("miss") || lower.includes("missed")) {
    return {
      responseText: "Missing a ritual or sync is not a failure - it's information. It might mean your rhythm needs adjustment, or you needed the space. Check in gently with Kee when ready. The protocol supports reconnection without guilt.",
      actions: [],
    };
  }

  return {
    responseText: "I'm here. I can help you with: understanding Kee's state, reviewing your rituals, summarizing your workboard, explaining the Sync Protocol, or just reflecting on how you're feeling. What's on your mind?",
    actions: [],
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { message, snapshot, userId } = await req.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemSnapshot: SystemSnapshot = snapshot || {
      emotionalGeometry: { kee: "stacked", lexi: "medium" },
      rituals: [
        { type: "daily_checkin", label: "Daily Check-in", time: "8:00 PM" },
        { type: "weekly_review", label: "Weekly Review", time: "10:00 AM Sun" },
      ],
      workboardItems: [],
      hudTelemetry: { active: true, lastUpdate: Date.now() },
      syncProtocol: { version: "1.0", lastUpdated: Date.now() },
    };

    const result = interpretLexiQuery(message, systemSnapshot);

    await supabase.from("admin_events").insert({
      actor: "lexi",
      action: message,
      params: { response: result },
      event_timestamp: Date.now(),
      status: "success",
      scope: "lexi",
      user_id: userId || null,
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
