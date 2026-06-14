import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import express from "npm:express@4.18.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.status(200).set(corsHeaders).send();
    return;
  }
  Object.entries(corsHeaders).forEach(([key, value]) => res.set(key, value));
  next();
});

app.post("/gamewear-api/create", async (req, res) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.authorization! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { base_art, platforms } = req.body;

    const { data, error } = await supabaseClient
      .from("gamewear")
      .insert({
        creator_id: user.id,
        base_art: base_art,
        platforms: platforms || [],
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      gamewear: data,
    });
  } catch (error) {
    console.error("Error creating GameWear:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/gamewear-api/upload-to-rpm", async (req, res) => {
  try {
    const { gamewearId, clothingType } = req.body;
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    
    const rpmResponse = await fetch(`${supabaseUrl}/functions/v1/ready-player-me`, {
      method: "POST",
      headers: {
        "Authorization": req.headers.authorization!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await rpmResponse.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/gamewear-api/upload-to-metamarker", async (req, res) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    
    const mmResponse = await fetch(`${supabaseUrl}/functions/v1/metamarker-fit`, {
      method: "POST",
      headers: {
        "Authorization": req.headers.authorization!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await mmResponse.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/gamewear-api/export-printful", async (req, res) => {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    
    const printfulResponse = await fetch(`${supabaseUrl}/functions/v1/printful-upload`, {
      method: "POST",
      headers: {
        "Authorization": req.headers.authorization!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await printfulResponse.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/gamewear-api/list", async (req, res) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.authorization! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { data, error } = await supabaseClient
      .from("gamewear")
      .select("*")
      .eq("creator_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({ gamewears: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/gamewear-api/:id", async (req, res) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.authorization! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { data, error } = await supabaseClient
      .from("gamewear")
      .select("*, gamewear_assets(*)")
      .eq("id", req.params.id)
      .eq("creator_id", user.id)
      .single();

    if (error) throw error;

    res.json({ gamewear: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/gamewear-api/generate-assets", async (req, res) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.authorization! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { gamewearId, platforms } = req.body;

    const assets = [];

    if (platforms.includes("unity")) {
      assets.push({
        gamewear_id: gamewearId,
        platform: "Unity",
        upm_asset_id: `upm-${gamewearId}`,
        upm_install_url: `https://package-installer.glitch.me/v1/installer/...`,
      });
    }

    if (platforms.includes("unreal")) {
      assets.push({
        gamewear_id: gamewearId,
        platform: "Unreal",
        ufn_package_url: `https://unrealengine.com/marketplace/...`,
      });
    }

    const { data, error } = await supabaseClient
      .from("gamewear_assets")
      .insert(assets)
      .select();

    if (error) throw error;

    res.json({ success: true, assets: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/gamewear-api/games/list", async (req, res) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { data, error } = await supabaseClient
      .from("games")
      .select("*, locations(*)")
      .order("date", { ascending: false });

    if (error) throw error;

    res.json({ games: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/gamewear-api/games/create", async (req, res) => {
  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.authorization! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { title, location_id, date, ticket_sales_enabled, gamewear_enabled } = req.body;

    const { data, error } = await supabaseClient
      .from("games")
      .insert({
        title,
        organizer_id: user.id,
        location_id,
        date,
        ticket_sales_enabled: ticket_sales_enabled || false,
        gamewear_enabled: gamewear_enabled || false,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, game: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(8000);
console.log("GameWear API running on port 8000");