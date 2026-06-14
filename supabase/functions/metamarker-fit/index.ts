import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface MetaMarkerRequest {
  gamewearId: string;
  designUrl: string;
  layerConfig: {
    baseTexture: string;
    uvAligned: boolean;
    overlays?: string[];
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { gamewearId, designUrl, layerConfig }: MetaMarkerRequest = await req.json();

    const metaMarkerApiUrl = "https://api.metamarker.io/v1/auto-fit";
    const metaMarkerApiKey = Deno.env.get("METAMARKER_API_KEY");

    const metaMarkerResponse = await fetch(metaMarkerApiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${metaMarkerApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        designUrl: designUrl,
        baseTexture: layerConfig.baseTexture,
        uvAligned: layerConfig.uvAligned,
        overlays: layerConfig.overlays || [],
        outputFormat: "glb",
      }),
    });

    if (!metaMarkerResponse.ok) {
      throw new Error(`MetaMarker API error: ${metaMarkerResponse.statusText}`);
    }

    const metaMarkerData = await metaMarkerResponse.json();

    const { error: updateError } = await supabaseClient
      .from("gamewear")
      .update({
        metaMarker_id: metaMarkerData.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", gamewearId)
      .eq("creator_id", user.id);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({
        success: true,
        metaMarkerId: metaMarkerData.id,
        fittedAssetUrl: metaMarkerData.assetUrl,
        preview: metaMarkerData.previewUrl,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error with MetaMarker auto-fitting:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});