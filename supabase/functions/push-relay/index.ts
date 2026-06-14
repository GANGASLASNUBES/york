import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// ─── VAPID helpers ─────────────────────────────────────────────────────────────

function base64urlToUint8Array(base64url: string): Uint8Array {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function uint8ArrayToBase64url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function makeVapidHeaders(
  endpoint: string,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  subject: string,
): Promise<{ Authorization: string; "Crypto-Key": string }> {
  const url = new URL(endpoint);
  const audience = `${url.protocol}//${url.host}`;
  const now = Math.floor(Date.now() / 1000);

  const header = { typ: "JWT", alg: "ES256" };
  const payload = { aud: audience, exp: now + 12 * 3600, sub: subject };

  const encoder = new TextEncoder();
  const headerB64 = uint8ArrayToBase64url(encoder.encode(JSON.stringify(header)));
  const payloadB64 = uint8ArrayToBase64url(encoder.encode(JSON.stringify(payload)));
  const signingInput = `${headerB64}.${payloadB64}`;

  const privateKeyBytes = base64urlToUint8Array(vapidPrivateKey);
  const privateKey = await crypto.subtle.importKey(
    "raw",
    privateKeyBytes,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: { name: "SHA-256" } },
    privateKey,
    encoder.encode(signingInput),
  );

  const token = `${signingInput}.${uint8ArrayToBase64url(new Uint8Array(signature))}`;

  return {
    Authorization: `vapid t=${token},k=${vapidPublicKey}`,
    "Crypto-Key": `p256ecdh=${vapidPublicKey}`,
  };
}

// ─── Payload encryption (Web Push Protocol - AESGCM) ─────────────────────────

async function encryptPayload(
  payload: string,
  p256dh: string,
  authKey: string,
): Promise<{ ciphertext: Uint8Array; salt: Uint8Array; serverPublicKey: Uint8Array }> {
  const encoder = new TextEncoder();

  // Generate server ECDH key pair
  const serverKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"],
  );

  const clientPublicKey = await crypto.subtle.importKey(
    "raw",
    base64urlToUint8Array(p256dh),
    { name: "ECDH", namedCurve: "P-256" },
    false,
    [],
  );

  const sharedBits = await crypto.subtle.deriveBits(
    { name: "ECDH", public: clientPublicKey },
    serverKeyPair.privateKey,
    256,
  );

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const authBytes = base64urlToUint8Array(authKey);

  // HKDF for content encryption key and nonce
  const ikm = await crypto.subtle.importKey("raw", sharedBits, "HKDF", false, ["deriveBits"]);
  const prk = await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt: authBytes, info: encoder.encode("Content-Encoding: auth\x00") },
    ikm,
    256,
  );

  const prkKey = await crypto.subtle.importKey("raw", prk, "HKDF", false, ["deriveBits"]);

  const serverPublicKeyRaw = new Uint8Array(
    await crypto.subtle.exportKey("raw", serverKeyPair.publicKey),
  );
  const clientPublicKeyRaw = base64urlToUint8Array(p256dh);

  const keyInfo = new Uint8Array([
    ...encoder.encode("Content-Encoding: aesgcm\x00"),
    0x00, 0x41,
    ...clientPublicKeyRaw,
    0x00, 0x41,
    ...serverPublicKeyRaw,
  ]);

  const nonceInfo = new Uint8Array([
    ...encoder.encode("Content-Encoding: nonce\x00"),
    0x00, 0x41,
    ...clientPublicKeyRaw,
    0x00, 0x41,
    ...serverPublicKeyRaw,
  ]);

  const [keyBits, nonceBits] = await Promise.all([
    crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info: keyInfo }, prkKey, 128),
    crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info: nonceInfo }, prkKey, 96),
  ]);

  const aesKey = await crypto.subtle.importKey("raw", keyBits, "AES-GCM", false, ["encrypt"]);

  const paddedPayload = new Uint8Array([0, 0, ...encoder.encode(payload)]);
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonceBits }, aesKey, paddedPayload),
  );

  return { ciphertext, salt, serverPublicKey: serverPublicKeyRaw };
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
  domain: string; // 'LEXI_SITE' | 'BIPS_SITE' | 'GEAR_SITE' | 'ALL'
  level?: 'info' | 'warning' | 'critical';
  pki_sig?: string; // optional PKI signature for payload verification
}

async function sendPushToSubscription(
  sub: { endpoint: string; p256dh: string; auth_key: string },
  payload: PushPayload,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  subject: string,
): Promise<{ ok: boolean; status?: number; error?: string }> {
  try {
    const body = JSON.stringify(payload);
    const { ciphertext, salt, serverPublicKey } = await encryptPayload(body, sub.p256dh, sub.auth_key);
    const vapidHeaders = await makeVapidHeaders(sub.endpoint, vapidPublicKey, vapidPrivateKey, subject);

    const res = await fetch(sub.endpoint, {
      method: "POST",
      headers: {
        ...vapidHeaders,
        "Content-Type": "application/octet-stream",
        "Content-Encoding": "aesgcm",
        "Encryption": `salt=${uint8ArrayToBase64url(salt)}`,
        "Crypto-Key": `${vapidHeaders["Crypto-Key"]};dh=${uint8ArrayToBase64url(serverPublicKey)}`,
        "TTL": "86400",
      },
      body: ciphertext,
    });

    return { ok: res.ok, status: res.status };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const vapidPublicKey = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
    const vapidSubject = Deno.env.get("VAPID_SUBJECT") ?? "mailto:ops@bipsgear.com";

    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/push-relay/, "");

    // ── POST /subscribe ──────────────────────────────────────────────────────
    if (req.method === "POST" && path === "/subscribe") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        return new Response(JSON.stringify({ error: "No authorization" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const userClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } },
      );

      const { data: { user } } = await userClient.auth.getUser();
      if (!user) {
        return new Response(JSON.stringify({ error: "Not authenticated" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { endpoint, keys, channel = "ALL", userAgent } = await req.json();

      const { error } = await supabase
        .from("push_subscriptions")
        .upsert({
          user_id: user.id,
          endpoint,
          p256dh: keys.p256dh,
          auth_key: keys.auth,
          channel: channel ?? "ALL",
          user_agent: userAgent,
          last_used_at: new Date().toISOString(),
        }, { onConflict: "endpoint" });

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── DELETE /unsubscribe ──────────────────────────────────────────────────
    if (req.method === "DELETE" && path === "/unsubscribe") {
      const { endpoint } = await req.json();
      await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── POST /dispatch ───────────────────────────────────────────────────────
    // Called by Convex actions or admin clients to fan out a push notification
    if (req.method === "POST" && path === "/dispatch") {
      // Require service role or valid JWT with admin role
      const apiKey = req.headers.get("X-Service-Key");
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (apiKey !== serviceKey) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const payload: PushPayload = await req.json();
      const domain = payload.domain ?? "ALL";

      // Fan out to all subscriptions for this channel
      let query = supabase.from("push_subscriptions").select("endpoint, p256dh, auth_key");
      if (domain !== "ALL") {
        query = query.in("channel", [domain, "ALL"]);
      }
      const { data: subs, error } = await query;

      if (error || !subs) {
        return new Response(JSON.stringify({ error: error?.message ?? "No subs" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const results = await Promise.allSettled(
        subs.map((sub) => sendPushToSubscription(sub, payload, vapidPublicKey, vapidPrivateKey, vapidSubject)),
      );

      const sent = results.filter((r) => r.status === "fulfilled" && (r.value as { ok: boolean }).ok).length;
      const failed = results.length - sent;

      // Clean up expired subscriptions (410 Gone)
      const gone: string[] = [];
      results.forEach((r, i) => {
        if (r.status === "fulfilled" && (r.value as { status?: number }).status === 410) {
          gone.push(subs[i].endpoint);
        }
      });
      if (gone.length > 0) {
        await supabase.from("push_subscriptions").delete().in("endpoint", gone);
      }

      return new Response(JSON.stringify({ sent, failed, total: subs.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── GET /vapid-public-key ────────────────────────────────────────────────
    if (req.method === "GET" && path === "/vapid-public-key") {
      return new Response(JSON.stringify({ key: vapidPublicKey }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
