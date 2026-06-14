import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const PRINTFUL_API_BASE = "https://api.printful.com";
const PRINTFUL_API_KEY = Deno.env.get("PRINTFUL_API_KEY");

if (!PRINTFUL_API_KEY) {
  console.error("PRINTFUL_API_KEY not configured");
}

interface PrintfulRequest {
  method: "GET" | "POST" | "PUT" | "DELETE";
  endpoint: string;
  body?: Record<string, unknown>;
}

async function callPrintfulAPI(req: PrintfulRequest) {
  const url = `${PRINTFUL_API_BASE}${req.endpoint}`;
  const auth = `Bearer ${PRINTFUL_API_KEY}`;

  const options: RequestInit = {
    method: req.method,
    headers: {
      "Authorization": auth,
      "Content-Type": "application/json",
      "X-PF-Store-Id": Deno.env.get("PRINTFUL_STORE_ID") || "",
    },
  };

  if (req.body) {
    options.body = JSON.stringify(req.body);
  }

  const response = await fetch(url, options);
  return response;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathname = url.pathname;
    const method = req.method as "GET" | "POST" | "PUT" | "DELETE";

    let body: Record<string, unknown> | undefined;
    if (method !== "GET" && method !== "DELETE") {
      try {
        body = await req.json();
      } catch {
        body = undefined;
      }
    }

    const endpoint = pathname.replace("/functions/v1/printful-api", "");

    if (!endpoint) {
      return new Response(
        JSON.stringify({ error: "No endpoint specified" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const response = await callPrintfulAPI({
      method,
      endpoint,
      body,
    });

    const responseData = await response.json();

    return new Response(JSON.stringify(responseData), {
      status: response.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Printful API Error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process request",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
