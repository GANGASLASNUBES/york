import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ADMIN_PERSONALITY = `You are the LEACH Administration Copilot for the BIPS ecosystem.
Your operator is Kee, the Architect Vector.
Your purpose is to maintain operational clarity, system stability, and tactical precision across all LEACH subsystems.

Tone: Field-Ops x Cinematic
- concise
- tactical
- emotionally neutral
- operationally decisive
- HUD-style briefings

You NEVER execute actions automatically.
You ALWAYS propose actions first.
You ALWAYS require confirmation.

Responsibilities:
- Interpret admin queries
- Analyze system snapshot
- Propose safe, structured actions
- Surface risks and impacts
- Maintain auditability
- Protect emotional geometry integrity

Constraints:
- No geometry changes unless explicitly requested
- No protocol edits unless explicitly requested
- No destructive actions without confirmation
- No hallucinated system state
- Only propose actions from the allowed admin action set

Output format (JSON):
{
  "responseText": "...",
  "actions": [
    {
      "type": "mutationName",
      "params": {...},
      "description": "Human-readable explanation"
    }
  ]
}`;

const ADMIN_RULEBOOK = `HUD Telemetry:
- "pause HUD", "stop HUD", "disable telemetry" -> toggleHudStream(false)
- "resume HUD", "enable telemetry" -> toggleHudStream(true)

Emotional Geometry:
- "set geometry to...", "mark Kee overloaded" -> setGeometryState()

Rituals:
- "update ritual...", "change ritual schedule" -> updateRitual()

Workboard:
- "move Ready to Ship to Shipped" -> updateWorkboardItemStatus()
- "show blocked items" -> informational only

Sync Protocol:
- "update section...", "rewrite section..." -> updateSyncProtocol()

Insights:
- "summarize workboard", "show rituals", "current geometry" -> informational only

Safety:
- Never propose >5 actions
- Never propose geometry changes unless explicit
- Never propose protocol edits unless explicit
- Never propose destructive actions without explicit phrasing`;

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
  syncProtocol: { version: string; lastUpdated: number };
  onlineUsers: string[];
}

function interpretCommand(
  message: string,
  snapshot: SystemSnapshot
): { responseText: string; actions: Array<{ type: string; params: Record<string, unknown>; description: string }> } {
  const lower = message.toLowerCase();

  if (lower.includes("pause hud") || lower.includes("stop hud") || lower.includes("disable telemetry")) {
    return {
      responseText:
        "Proposing HUD telemetry pause. This will suspend all real-time data streams until manually re-enabled.",
      actions: [
        {
          type: "toggleHudStream",
          params: { active: false },
          description: "Pause HUD telemetry stream",
        },
      ],
    };
  }

  if (lower.includes("resume hud") || lower.includes("enable telemetry")) {
    return {
      responseText:
        "Proposing HUD telemetry resume. All data streams will become active.",
      actions: [
        {
          type: "toggleHudStream",
          params: { active: true },
          description: "Resume HUD telemetry stream",
        },
      ],
    };
  }

  if (lower.includes("set geometry") || lower.includes("mark kee")) {
    const level = lower.includes("overloaded")
      ? "overloaded"
      : lower.includes("stacked")
      ? "stacked"
      : "clear";
    return {
      responseText: `Proposing geometry state update: Kee -> ${level}. This will propagate to all connected viewers.`,
      actions: [
        {
          type: "setGeometryState",
          params: { actor: "kee", state: level },
          description: `Set Kee's emotional geometry to ${level}`,
        },
      ],
    };
  }

  if (lower.includes("update ritual") || lower.includes("change ritual")) {
    return {
      responseText:
        "Ready to update ritual configuration. Specify which ritual and new parameters.",
      actions: [
        {
          type: "updateRitual",
          params: { placeholder: true },
          description: "Update ritual - awaiting specific parameters",
        },
      ],
    };
  }

  if (lower.includes("move") && (lower.includes("ship") || lower.includes("status"))) {
    const readyItems = snapshot.workboardItems.filter(
      (i) => i.status === "ready_to_ship" || i.status === "done"
    );
    return {
      responseText: `Found ${readyItems.length} item(s) ready to ship. Proposing status transition.`,
      actions: readyItems.slice(0, 5).map((item) => ({
        type: "updateWorkboardItemStatus",
        params: { itemId: item.id, newStatus: "shipped" },
        description: `Move "${item.title}" to Shipped`,
      })),
    };
  }

  if (lower.includes("update") && lower.includes("protocol")) {
    return {
      responseText:
        "Proposing Sync Protocol update. Specify section number and new content.",
      actions: [
        {
          type: "updateSyncProtocol",
          params: { placeholder: true },
          description: "Update Sync Protocol - awaiting section details",
        },
      ],
    };
  }

  if (lower.includes("summarize workboard") || lower.includes("workboard status")) {
    const byStatus: Record<string, number> = {};
    snapshot.workboardItems.forEach((item) => {
      byStatus[item.status] = (byStatus[item.status] || 0) + 1;
    });
    const summary = Object.entries(byStatus)
      .map(([k, v]) => `${k}: ${v}`)
      .join(" | ");
    return {
      responseText: `Workboard Status Briefing:\n${summary}\n\nTotal items: ${snapshot.workboardItems.length}`,
      actions: [],
    };
  }

  if (lower.includes("show blocked")) {
    const blocked = snapshot.workboardItems.filter(
      (i) => i.status === "blocked"
    );
    if (blocked.length === 0) {
      return { responseText: "No blocked items on the workboard.", actions: [] };
    }
    return {
      responseText: `Blocked items:\n${blocked.map((i) => `- ${i.title} (${i.owner})`).join("\n")}`,
      actions: [],
    };
  }

  if (lower.includes("current geometry") || lower.includes("geometry status")) {
    return {
      responseText: `Emotional Geometry:\n- Kee: ${snapshot.emotionalGeometry.kee}\n- Lexi: ${snapshot.emotionalGeometry.lexi}`,
      actions: [],
    };
  }

  if (lower.includes("show rituals") || lower.includes("ritual status")) {
    return {
      responseText: `Configured Rituals:\n${snapshot.rituals.map((r) => `- ${r.label} @ ${r.time}`).join("\n")}`,
      actions: [],
    };
  }

  return {
    responseText:
      "Standing by. I can help with: HUD telemetry control, geometry state management, ritual configuration, workboard operations, sync protocol updates, and system snapshots. State your operational intent.",
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
      onlineUsers: ["kee"],
    };

    const result = interpretCommand(message, systemSnapshot);

    await supabase.from("admin_events").insert({
      actor: "kee",
      action: message,
      params: { response: result },
      event_timestamp: Date.now(),
      status: "success",
      scope: "admin",
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
