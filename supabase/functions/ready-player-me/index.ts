import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RPMUploadRequest {
  gamewearId: string;
  designUrl: string;
  clothingType: string;
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

    const { gamewearId, designUrl, clothingType }: RPMUploadRequest = await req.json();

    const rpmApiUrl = "https://api.readyplayer.me/v2/assets";
    const rpmApiKey = Deno.env.get("RPM_API_KEY");

    const rpmResponse = await fetch(rpmApiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${rpmApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "clothing",
        clothingType: clothingType,
        textureUrl: designUrl,
        name: `GameWear-${gamewearId}`,
      }),
    });

    if (!rpmResponse.ok) {
      throw new Error(`RPM API error: ${rpmResponse.statusText}`);
    }

    const rpmData = await rpmResponse.json();

    const { error: updateError } = await supabaseClient
      .from("gamewear")
      .update({
        rpm_asset_id: rpmData.id,
        rpm_glb_url: rpmData.glbUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", gamewearId)
      .eq("creator_id", user.id);

    if (updateError) throw updateError;

    await supabaseClient.from("gamewear_assets").insert({
      gamewear_id: gamewearId,
      platform: "ReadyPlayerMe",
      rpm_asset_id: rpmData.id,
      rpm_glb_url: rpmData.glbUrl,
      rpm_user_id: rpmData.userId,
    });

    return new Response(
      JSON.stringify({
        success: true,
        assetId: rpmData.id,
        glbUrl: rpmData.glbUrl,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error uploading to Ready Player Me:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});