import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import express from "npm:express@4.18.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const app = express();
app.use(express.json({ limit: '10mb' }));

app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.status(200).set(corsHeaders).send();
    return;
  }
  Object.entries(corsHeaders).forEach(([key, value]) => res.set(key, value));
  next();
});

function getServiceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );
}

async function computeHmacSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(payload);

  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, messageData);
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function verifyHmacSignature(payload: string, signature: string, secret: string): Promise<boolean> {
  const computed = await computeHmacSignature(payload, secret);
  return computed === signature.toLowerCase().replace('sha256=', '');
}

async function logAudit(
  supabase: ReturnType<typeof createClient>,
  action: string,
  resourceType: string,
  success: boolean,
  details: Record<string, unknown>,
  tenantId?: string,
  environmentId?: string,
  errorMessage?: string
) {
  await supabase.rpc('log_pki_audit', {
    p_action: action,
    p_actor_type: 'service',
    p_actor_id: 'webhook-relay',
    p_actor_role: 'service',
    p_resource_type: resourceType,
    p_tenant_id: tenantId,
    p_environment_id: environmentId,
    p_success: success,
    p_error_message: errorMessage,
    p_details: details
  });
}

app.post("/webhook-relay/sign", async (req, res) => {
  try {
    const supabase = getServiceClient();
    const { tenant_id, environment_id, provider, payload, timestamp } = req.body;

    if (!tenant_id || !provider || !payload) {
      return res.status(400).json({ error: "Missing required fields: tenant_id, provider, payload" });
    }

    const { data: webhookKey } = await supabase
      .from("pki_webhook_keys")
      .select("*")
      .eq("tenant_id", tenant_id)
      .eq("environment_id", environment_id)
      .eq("provider", provider)
      .eq("key_type", "signing")
      .eq("is_active", true)
      .maybeSingle();

    if (!webhookKey) {
      return res.status(404).json({ error: "No active signing key found for this tenant/provider" });
    }

    const ts = timestamp || Math.floor(Date.now() / 1000);
    const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const signaturePayload = `${ts}.${payloadString}`;

    const signature = await computeHmacSignature(signaturePayload, webhookKey.key_value_encrypted);

    await logAudit(
      supabase,
      'webhook_signed',
      'webhook',
      true,
      { provider, payload_size: payloadString.length },
      tenant_id,
      environment_id
    );

    res.json({
      success: true,
      signature: `sha256=${signature}`,
      timestamp: ts,
      header_value: `t=${ts},v1=${signature}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/webhook-relay/verify", async (req, res) => {
  try {
    const supabase = getServiceClient();
    const { tenant_id, environment_id, provider, payload, signature, timestamp, tolerance_seconds } = req.body;

    if (!tenant_id || !provider || !payload || !signature) {
      return res.status(400).json({ error: "Missing required fields: tenant_id, provider, payload, signature" });
    }

    const { data: webhookKey } = await supabase
      .from("pki_webhook_keys")
      .select("*")
      .eq("tenant_id", tenant_id)
      .eq("environment_id", environment_id)
      .eq("provider", provider)
      .in("key_type", ["verification", "shared_secret"])
      .eq("is_active", true)
      .maybeSingle();

    if (!webhookKey) {
      await logAudit(
        supabase,
        'webhook_verification_failed',
        'webhook',
        false,
        { provider, reason: 'no_key_found' },
        tenant_id,
        environment_id,
        'No verification key found'
      );
      return res.status(404).json({ error: "No verification key found for this tenant/provider" });
    }

    const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
    let signaturePayload: string;

    if (timestamp) {
      const now = Math.floor(Date.now() / 1000);
      const tolerance = tolerance_seconds || 300;

      if (Math.abs(now - timestamp) > tolerance) {
        await logAudit(
          supabase,
          'webhook_verification_failed',
          'webhook',
          false,
          { provider, reason: 'timestamp_expired', timestamp, now },
          tenant_id,
          environment_id,
          'Webhook timestamp expired'
        );
        return res.json({ verified: false, reason: "Webhook timestamp expired" });
      }

      signaturePayload = `${timestamp}.${payloadString}`;
    } else {
      signaturePayload = payloadString;
    }

    const isValid = await verifyHmacSignature(signaturePayload, signature, webhookKey.key_value_encrypted);

    await logAudit(
      supabase,
      isValid ? 'webhook_verified' : 'webhook_verification_failed',
      'webhook',
      isValid,
      { provider, payload_size: payloadString.length },
      tenant_id,
      environment_id,
      isValid ? undefined : 'Signature mismatch'
    );

    res.json({
      verified: isValid,
      provider,
      timestamp: timestamp || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/webhook-relay/receive/printful", async (req, res) => {
  try {
    const supabase = getServiceClient();
    const signature = req.headers['x-printful-signature'] || req.headers['x-webhook-signature'];
    const tenantId = req.query.tenant_id || req.headers['x-tenant-id'];
    const environmentId = req.query.environment_id || req.headers['x-environment-id'];

    if (!tenantId) {
      return res.status(400).json({ error: "Missing tenant_id" });
    }

    const { data: webhookKey } = await supabase
      .from("pki_webhook_keys")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("provider", "printful")
      .eq("key_type", "verification")
      .eq("is_active", true)
      .maybeSingle();

    if (webhookKey && signature) {
      const payloadString = JSON.stringify(req.body);
      const isValid = await verifyHmacSignature(payloadString, signature as string, webhookKey.key_value_encrypted);

      if (!isValid) {
        await logAudit(
          supabase,
          'webhook_verification_failed',
          'webhook_printful',
          false,
          { event_type: req.body?.type },
          tenantId as string,
          environmentId as string,
          'Invalid Printful signature'
        );
        return res.status(401).json({ error: "Invalid webhook signature" });
      }
    }

    const event = req.body;
    await logAudit(
      supabase,
      'webhook_verified',
      'webhook_printful',
      true,
      { event_type: event?.type, event_id: event?.id },
      tenantId as string,
      environmentId as string
    );

    switch (event?.type) {
      case 'package_shipped':
        console.log('Printful package shipped:', event.data);
        break;
      case 'order_created':
        console.log('Printful order created:', event.data);
        break;
      case 'order_failed':
        console.log('Printful order failed:', event.data);
        break;
      default:
        console.log('Printful webhook received:', event?.type);
    }

    res.json({ received: true, event_type: event?.type });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/webhook-relay/receive/shopify", async (req, res) => {
  try {
    const supabase = getServiceClient();
    const hmacHeader = req.headers['x-shopify-hmac-sha256'];
    const tenantId = req.query.tenant_id || req.headers['x-tenant-id'];
    const environmentId = req.query.environment_id || req.headers['x-environment-id'];

    if (!tenantId) {
      return res.status(400).json({ error: "Missing tenant_id" });
    }

    const { data: webhookKey } = await supabase
      .from("pki_webhook_keys")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("provider", "shopify")
      .eq("key_type", "shared_secret")
      .eq("is_active", true)
      .maybeSingle();

    if (webhookKey && hmacHeader) {
      const payloadString = JSON.stringify(req.body);
      const computed = await computeHmacSignature(payloadString, webhookKey.key_value_encrypted);
      const computedBase64 = btoa(String.fromCharCode(...new Uint8Array(
        computed.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
      )));

      if (computedBase64 !== hmacHeader) {
        await logAudit(
          supabase,
          'webhook_verification_failed',
          'webhook_shopify',
          false,
          { topic: req.headers['x-shopify-topic'] },
          tenantId as string,
          environmentId as string,
          'Invalid Shopify HMAC'
        );
        return res.status(401).json({ error: "Invalid webhook signature" });
      }
    }

    const topic = req.headers['x-shopify-topic'];
    await logAudit(
      supabase,
      'webhook_verified',
      'webhook_shopify',
      true,
      { topic, shop: req.headers['x-shopify-shop-domain'] },
      tenantId as string,
      environmentId as string
    );

    console.log('Shopify webhook received:', topic);
    res.json({ received: true, topic });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/webhook-relay/receive/stripe", async (req, res) => {
  try {
    const supabase = getServiceClient();
    const signature = req.headers['stripe-signature'];
    const tenantId = req.query.tenant_id || req.headers['x-tenant-id'];
    const environmentId = req.query.environment_id || req.headers['x-environment-id'];

    if (!tenantId) {
      return res.status(400).json({ error: "Missing tenant_id" });
    }

    const { data: webhookKey } = await supabase
      .from("pki_webhook_keys")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("provider", "stripe")
      .eq("key_type", "shared_secret")
      .eq("is_active", true)
      .maybeSingle();

    if (webhookKey && signature) {
      const sigParts = (signature as string).split(',').reduce((acc: Record<string, string>, part) => {
        const [key, value] = part.split('=');
        acc[key] = value;
        return acc;
      }, {});

      const timestamp = sigParts['t'];
      const v1Signature = sigParts['v1'];

      if (timestamp && v1Signature) {
        const payloadString = JSON.stringify(req.body);
        const signedPayload = `${timestamp}.${payloadString}`;
        const isValid = await verifyHmacSignature(signedPayload, v1Signature, webhookKey.key_value_encrypted);

        if (!isValid) {
          await logAudit(
            supabase,
            'webhook_verification_failed',
            'webhook_stripe',
            false,
            { event_type: req.body?.type },
            tenantId as string,
            environmentId as string,
            'Invalid Stripe signature'
          );
          return res.status(401).json({ error: "Invalid webhook signature" });
        }
      }
    }

    const event = req.body;
    await logAudit(
      supabase,
      'webhook_verified',
      'webhook_stripe',
      true,
      { event_type: event?.type, event_id: event?.id },
      tenantId as string,
      environmentId as string
    );

    console.log('Stripe webhook received:', event?.type);
    res.json({ received: true, event_type: event?.type });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/webhook-relay/keys/register", async (req, res) => {
  try {
    const supabase = getServiceClient();
    const { tenant_id, environment_id, provider, key_type, key_value, is_pinned, valid_days } = req.body;

    if (!tenant_id || !provider || !key_type || !key_value) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!['signing', 'verification', 'shared_secret'].includes(key_type)) {
      return res.status(400).json({ error: "Invalid key_type. Must be: signing, verification, or shared_secret" });
    }

    const encoder = new TextEncoder();
    const keyData = encoder.encode(key_value);
    const fingerprintBuffer = await crypto.subtle.digest("SHA-256", keyData);
    const fingerprint = Array.from(new Uint8Array(fingerprintBuffer))
      .slice(0, 8)
      .map(b => b.toString(16).padStart(2, '0'))
      .join(':')
      .toUpperCase();

    const validUntil = valid_days
      ? new Date(Date.now() + valid_days * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const { data, error } = await supabase
      .from("pki_webhook_keys")
      .insert({
        tenant_id,
        environment_id,
        provider,
        key_type,
        key_value_encrypted: key_value,
        fingerprint,
        is_pinned: is_pinned || false,
        valid_until: validUntil,
        is_active: true
      })
      .select("id, tenant_id, environment_id, provider, key_type, fingerprint, is_pinned, valid_from, valid_until")
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      webhook_key: data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/webhook-relay/keys", async (req, res) => {
  try {
    const supabase = getServiceClient();
    const { tenant_id, environment_id, provider } = req.query;

    let query = supabase
      .from("pki_webhook_keys")
      .select("id, tenant_id, environment_id, provider, key_type, fingerprint, is_pinned, is_active, valid_from, valid_until, created_at");

    if (tenant_id) query = query.eq("tenant_id", tenant_id);
    if (environment_id) query = query.eq("environment_id", environment_id);
    if (provider) query = query.eq("provider", provider);

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) throw error;

    res.json({ webhook_keys: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/webhook-relay/keys/:id", async (req, res) => {
  try {
    const supabase = getServiceClient();
    const keyId = req.params.id;

    const { error } = await supabase
      .from("pki_webhook_keys")
      .update({ is_active: false })
      .eq("id", keyId);

    if (error) throw error;

    res.json({ success: true, deactivated: keyId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(8000);
console.log("Webhook Relay running on port 8000");
