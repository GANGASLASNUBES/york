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

function getServiceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );
}

function getUserClient(authHeader: string) {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } }
  );
}

function generateSerialNumber(): string {
  const timestamp = Date.now().toString(16);
  const random = crypto.getRandomValues(new Uint8Array(8));
  const randomHex = Array.from(random).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${timestamp}-${randomHex}`.toUpperCase();
}

async function generateKeyPair(): Promise<{ publicKey: string; privateKey: string; fingerprint: string }> {
  const keyPair = await crypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign", "verify"]
  );

  const publicKeyRaw = await crypto.subtle.exportKey("spki", keyPair.publicKey);
  const privateKeyRaw = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

  const publicKey = btoa(String.fromCharCode(...new Uint8Array(publicKeyRaw)));
  const privateKey = btoa(String.fromCharCode(...new Uint8Array(privateKeyRaw)));

  const fingerprintBuffer = await crypto.subtle.digest("SHA-256", publicKeyRaw);
  const fingerprint = Array.from(new Uint8Array(fingerprintBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join(':')
    .toUpperCase()
    .match(/.{1,2}/g)?.slice(0, 16).join(':') ?? '';

  return { publicKey, privateKey, fingerprint };
}

async function logAudit(
  supabase: ReturnType<typeof createClient>,
  action: string,
  actorType: string,
  actorId: string,
  actorRole: string,
  resourceType: string,
  resourceId?: string,
  resourceName?: string,
  tenantId?: string,
  environmentId?: string,
  success = true,
  errorCode?: string,
  errorMessage?: string,
  details: Record<string, unknown> = {},
  ipAddress?: string
) {
  await supabase.rpc('log_pki_audit', {
    p_action: action,
    p_actor_type: actorType,
    p_actor_id: actorId,
    p_actor_role: actorRole,
    p_resource_type: resourceType,
    p_resource_id: resourceId,
    p_resource_name: resourceName,
    p_tenant_id: tenantId,
    p_environment_id: environmentId,
    p_success: success,
    p_error_code: errorCode,
    p_error_message: errorMessage,
    p_details: details,
    p_ip_address: ipAddress
  });
}

app.get("/pki-api/tenants", async (req, res) => {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("pki_tenants")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error) throw error;
    res.json({ tenants: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/pki-api/environments", async (req, res) => {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("pki_environments")
      .select("*")
      .order("code");

    if (error) throw error;
    res.json({ environments: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/pki-api/cas", async (req, res) => {
  try {
    const supabase = getServiceClient();
    const { tenant_id, environment_id, ca_type } = req.query;

    let query = supabase
      .from("pki_certificate_authorities")
      .select("id, tenant_id, environment_id, ca_type, name, subject_dn, fingerprint, serial_number, valid_from, valid_until, is_active, parent_ca_id")
      .eq("is_active", true);

    if (tenant_id) query = query.eq("tenant_id", tenant_id);
    if (environment_id) query = query.eq("environment_id", environment_id);
    if (ca_type) query = query.eq("ca_type", ca_type);

    const { data, error } = await query.order("ca_type");
    if (error) throw error;
    res.json({ certificate_authorities: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/pki-api/cas/create", async (req, res) => {
  try {
    const supabase = getServiceClient();
    const userClient = getUserClient(req.headers.authorization!);
    const { data: { user } } = await userClient.auth.getUser();

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { tenant_id, environment_id, ca_type, name, subject_dn, valid_days, parent_ca_id, path_length_constraint } = req.body;

    const { publicKey, privateKey, fingerprint } = await generateKeyPair();
    const serialNumber = generateSerialNumber();
    const validFrom = new Date();
    const validUntil = new Date(validFrom.getTime() + (valid_days || 3650) * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from("pki_certificate_authorities")
      .insert({
        tenant_id,
        environment_id,
        ca_type,
        name,
        subject_dn,
        public_key: publicKey,
        private_key_encrypted: privateKey,
        fingerprint,
        serial_number: serialNumber,
        parent_ca_id,
        valid_from: validFrom.toISOString(),
        valid_until: validUntil.toISOString(),
        key_algorithm: 'ecdsa-p256',
        signature_algorithm: 'ecdsa-p256-sha256',
        path_length_constraint,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;

    await logAudit(supabase, 'ca_created', 'user', user.id, 'kee', 'ca', data.id, name, tenant_id, environment_id, true, undefined, undefined, { ca_type, fingerprint });

    res.status(201).json({
      success: true,
      certificate_authority: {
        id: data.id,
        tenant_id: data.tenant_id,
        environment_id: data.environment_id,
        ca_type: data.ca_type,
        name: data.name,
        subject_dn: data.subject_dn,
        fingerprint: data.fingerprint,
        serial_number: data.serial_number,
        valid_from: data.valid_from,
        valid_until: data.valid_until,
        public_key: data.public_key
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/pki-api/certificates/issue-service", async (req, res) => {
  try {
    const supabase = getServiceClient();
    const userClient = getUserClient(req.headers.authorization!);
    const { data: { user } } = await userClient.auth.getUser();

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { tenant_id, environment_id, service_name, valid_days, scopes, enable_mtls } = req.body;

    if (!['auth', 'affiliate-registry', 'gifting', 'promo', 'webhook-relay', 'cdn-edge'].includes(service_name)) {
      return res.status(400).json({ error: "Invalid service name. Allowed: auth, affiliate-registry, gifting, promo, webhook-relay, cdn-edge" });
    }

    const { data: ca } = await supabase
      .from("pki_certificate_authorities")
      .select("*")
      .eq("tenant_id", tenant_id)
      .eq("environment_id", environment_id)
      .eq("ca_type", "intermediate-api")
      .eq("is_active", true)
      .maybeSingle();

    if (!ca) {
      return res.status(400).json({ error: "No active intermediate-api CA found for this tenant/environment" });
    }

    const { publicKey, privateKey, fingerprint } = await generateKeyPair();
    const serialNumber = generateSerialNumber();
    const validFrom = new Date();
    const validUntil = new Date(validFrom.getTime() + (valid_days || 365) * 24 * 60 * 60 * 1000);
    const subjectCn = `${service_name}.service.${tenant_id}.bips.io`;
    const subjectDn = `CN=${subjectCn},O=BIPS,OU=Services`;

    const { data: cert, error: certError } = await supabase
      .from("pki_certificates")
      .insert({
        tenant_id,
        environment_id,
        issuing_ca_id: ca.id,
        cert_type: 'service',
        subject_cn: subjectCn,
        subject_dn: subjectDn,
        public_key: publicKey,
        private_key_encrypted: privateKey,
        fingerprint,
        serial_number: serialNumber,
        status: 'active',
        valid_from: validFrom.toISOString(),
        valid_until: validUntil.toISOString(),
        key_algorithm: 'ecdsa-p256',
        service_name,
        is_mtls_enabled: enable_mtls || false,
        created_by: user.id
      })
      .select()
      .single();

    if (certError) throw certError;

    if (scopes && scopes.length > 0) {
      const claims = scopes.map((scope: string) => ({
        certificate_id: cert.id,
        claim_type: 'scope',
        claim_value: scope,
        is_critical: false
      }));
      await supabase.from("pki_certificate_claims").insert(claims);
    }

    await logAudit(supabase, 'cert_issued', 'user', user.id, 'kee', 'certificate', cert.id, subjectCn, tenant_id, environment_id, true, undefined, undefined, { cert_type: 'service', service_name, fingerprint });

    const { data: rotationSchedule } = await supabase
      .from("pki_rotation_schedules")
      .insert({
        name: `Auto-rotate ${service_name} service cert`,
        target_type: 'certificate',
        target_id: cert.id,
        rotation_type: 'time_based',
        interval_days: Math.floor((valid_days || 365) * 0.9),
        next_rotation_at: new Date(validUntil.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true
      })
      .select()
      .single();

    res.status(201).json({
      success: true,
      certificate: {
        id: cert.id,
        subject_cn: cert.subject_cn,
        fingerprint: cert.fingerprint,
        serial_number: cert.serial_number,
        valid_from: cert.valid_from,
        valid_until: cert.valid_until,
        public_key: cert.public_key,
        private_key: cert.private_key_encrypted
      },
      rotation_schedule_id: rotationSchedule?.id
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/pki-api/certificates/issue-client", async (req, res) => {
  try {
    const supabase = getServiceClient();
    const userClient = getUserClient(req.headers.authorization!);
    const { data: { user } } = await userClient.auth.getUser();

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { tenant_id, environment_id, client_type, device_id, mobile_app_id, valid_days } = req.body;

    if (!['mobile-app', 'field-device'].includes(client_type)) {
      return res.status(400).json({ error: "Invalid client type. Allowed: mobile-app, field-device" });
    }

    const { data: ca } = await supabase
      .from("pki_certificate_authorities")
      .select("*")
      .eq("tenant_id", tenant_id)
      .eq("environment_id", environment_id)
      .eq("ca_type", "intermediate-client")
      .eq("is_active", true)
      .maybeSingle();

    if (!ca) {
      return res.status(400).json({ error: "No active intermediate-client CA found for this tenant/environment" });
    }

    const { publicKey, privateKey, fingerprint } = await generateKeyPair();
    const serialNumber = generateSerialNumber();
    const validFrom = new Date();
    const validUntil = new Date(validFrom.getTime() + (valid_days || 180) * 24 * 60 * 60 * 1000);
    const identifier = device_id || mobile_app_id || crypto.randomUUID();
    const subjectCn = `${client_type}.${identifier}.client.bips.io`;
    const subjectDn = `CN=${subjectCn},O=BIPS,OU=Clients`;

    const { data: cert, error: certError } = await supabase
      .from("pki_certificates")
      .insert({
        tenant_id,
        environment_id,
        issuing_ca_id: ca.id,
        cert_type: client_type,
        subject_cn: subjectCn,
        subject_dn: subjectDn,
        public_key: publicKey,
        private_key_encrypted: privateKey,
        fingerprint,
        serial_number: serialNumber,
        status: 'active',
        valid_from: validFrom.toISOString(),
        valid_until: validUntil.toISOString(),
        key_algorithm: 'ecdsa-p256',
        device_id,
        mobile_app_id,
        is_mtls_enabled: true,
        created_by: user.id
      })
      .select()
      .single();

    if (certError) throw certError;

    const claims = [
      { certificate_id: cert.id, claim_type: 'tenant', claim_value: tenant_id, is_critical: true },
      { certificate_id: cert.id, claim_type: 'environment', claim_value: environment_id, is_critical: true },
      { certificate_id: cert.id, claim_type: 'client_type', claim_value: client_type, is_critical: false }
    ];
    if (device_id) claims.push({ certificate_id: cert.id, claim_type: 'device_id', claim_value: device_id, is_critical: false });
    if (mobile_app_id) claims.push({ certificate_id: cert.id, claim_type: 'mobile_app_id', claim_value: mobile_app_id, is_critical: false });

    await supabase.from("pki_certificate_claims").insert(claims);

    await logAudit(supabase, 'cert_issued', 'user', user.id, 'service', 'certificate', cert.id, subjectCn, tenant_id, environment_id, true, undefined, undefined, { cert_type: client_type, device_id, mobile_app_id, fingerprint });

    res.status(201).json({
      success: true,
      certificate: {
        id: cert.id,
        subject_cn: cert.subject_cn,
        fingerprint: cert.fingerprint,
        serial_number: cert.serial_number,
        valid_from: cert.valid_from,
        valid_until: cert.valid_until,
        public_key: cert.public_key,
        private_key: cert.private_key_encrypted
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/pki-api/certificates/issue-avatar", async (req, res) => {
  try {
    const supabase = getServiceClient();
    const userClient = getUserClient(req.headers.authorization!);
    const { data: { user } } = await userClient.auth.getUser();

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { tenant_id, environment_id, avatar_id, role, scopes, valid_days } = req.body;

    if (!['kee', 'lexi', 'k-kwamii'].includes(role)) {
      return res.status(400).json({ error: "Invalid role. Allowed: kee, lexi, k-kwamii" });
    }

    if (role === 'k-kwamii') {
      const { data: env } = await supabase
        .from("pki_environments")
        .select("*")
        .eq("id", environment_id)
        .maybeSingle();

      if (!env?.allows_impersonation) {
        return res.status(403).json({ error: "K/Kwamii avatars can only be issued certificates for sandbox-impersonation environment" });
      }
    }

    const { data: ca } = await supabase
      .from("pki_certificate_authorities")
      .select("*")
      .eq("tenant_id", tenant_id)
      .eq("environment_id", environment_id)
      .eq("ca_type", "intermediate-avatar")
      .eq("is_active", true)
      .maybeSingle();

    if (!ca) {
      return res.status(400).json({ error: "No active intermediate-avatar CA found for this tenant/environment" });
    }

    const { publicKey, privateKey, fingerprint } = await generateKeyPair();
    const serialNumber = generateSerialNumber();
    const validFrom = new Date();
    const validUntil = new Date(validFrom.getTime() + (valid_days || 365) * 24 * 60 * 60 * 1000);
    const subjectCn = `${avatar_id}.${role}.avatar.bips.io`;
    const subjectDn = `CN=${subjectCn},O=BIPS,OU=Avatars`;

    const { data: cert, error: certError } = await supabase
      .from("pki_certificates")
      .insert({
        tenant_id,
        environment_id,
        issuing_ca_id: ca.id,
        cert_type: 'avatar',
        subject_cn: subjectCn,
        subject_dn: subjectDn,
        public_key: publicKey,
        private_key_encrypted: privateKey,
        fingerprint,
        serial_number: serialNumber,
        status: 'active',
        valid_from: validFrom.toISOString(),
        valid_until: validUntil.toISOString(),
        key_algorithm: 'ecdsa-p256',
        avatar_id,
        is_mtls_enabled: false,
        created_by: user.id
      })
      .select()
      .single();

    if (certError) throw certError;

    const claims = [
      { certificate_id: cert.id, claim_type: 'avatar_id', claim_value: avatar_id, is_critical: true },
      { certificate_id: cert.id, claim_type: 'role', claim_value: role, is_critical: true },
      { certificate_id: cert.id, claim_type: 'tenant', claim_value: tenant_id, is_critical: true },
      { certificate_id: cert.id, claim_type: 'environment', claim_value: environment_id, is_critical: true }
    ];

    if (scopes && scopes.length > 0) {
      scopes.forEach((scope: string) => {
        claims.push({ certificate_id: cert.id, claim_type: 'scope', claim_value: scope, is_critical: false });
      });
    }

    await supabase.from("pki_certificate_claims").insert(claims);

    await logAudit(supabase, 'cert_issued', 'user', user.id, role, 'certificate', cert.id, subjectCn, tenant_id, environment_id, true, undefined, undefined, { cert_type: 'avatar', avatar_id, role, scopes, fingerprint });

    res.status(201).json({
      success: true,
      certificate: {
        id: cert.id,
        subject_cn: cert.subject_cn,
        fingerprint: cert.fingerprint,
        serial_number: cert.serial_number,
        valid_from: cert.valid_from,
        valid_until: cert.valid_until,
        avatar_id,
        role,
        scopes,
        public_key: cert.public_key,
        private_key: cert.private_key_encrypted
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/pki-api/certificates/revoke", async (req, res) => {
  try {
    const supabase = getServiceClient();
    const userClient = getUserClient(req.headers.authorization!);
    const { data: { user } } = await userClient.auth.getUser();

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { certificate_id, reason, notes } = req.body;

    const validReasons = ['key_compromise', 'ca_compromise', 'affiliation_changed', 'superseded', 'cessation_of_operation', 'certificate_hold', 'privilege_withdrawn', 'aa_compromise', 'administrative'];
    if (!validReasons.includes(reason)) {
      return res.status(400).json({ error: `Invalid reason. Allowed: ${validReasons.join(', ')}` });
    }

    const { data: cert } = await supabase
      .from("pki_certificates")
      .select("*")
      .eq("id", certificate_id)
      .maybeSingle();

    if (!cert) {
      return res.status(404).json({ error: "Certificate not found" });
    }

    if (cert.status === 'revoked') {
      return res.status(400).json({ error: "Certificate is already revoked" });
    }

    const { data: revocation, error: revokeError } = await supabase
      .from("pki_revocations")
      .insert({
        certificate_id,
        reason,
        notes,
        revoked_by: user.id
      })
      .select()
      .single();

    if (revokeError) throw revokeError;

    await supabase
      .from("pki_certificates")
      .update({ status: 'revoked', updated_at: new Date().toISOString() })
      .eq("id", certificate_id);

    await supabase
      .from("pki_rotation_schedules")
      .update({ is_active: false })
      .eq("target_id", certificate_id)
      .eq("target_type", "certificate");

    await logAudit(supabase, 'cert_revoked', 'user', user.id, 'kee', 'certificate', certificate_id, cert.subject_cn, cert.tenant_id, cert.environment_id, true, undefined, undefined, { reason, fingerprint: cert.fingerprint });

    res.json({
      success: true,
      revocation: {
        id: revocation.id,
        certificate_id,
        revoked_at: revocation.revoked_at,
        reason
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/pki-api/certificates/rotate", async (req, res) => {
  try {
    const supabase = getServiceClient();
    const userClient = getUserClient(req.headers.authorization!);
    const { data: { user } } = await userClient.auth.getUser();

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { certificate_id, rotation_reason, overlap_hours } = req.body;

    const { data: oldCert } = await supabase
      .from("pki_certificates")
      .select("*, pki_certificate_claims(*)")
      .eq("id", certificate_id)
      .maybeSingle();

    if (!oldCert) {
      return res.status(404).json({ error: "Certificate not found" });
    }

    if (oldCert.status !== 'active') {
      return res.status(400).json({ error: "Can only rotate active certificates" });
    }

    const { publicKey, privateKey, fingerprint } = await generateKeyPair();
    const serialNumber = generateSerialNumber();
    const validFrom = new Date();
    const originalValidityDays = Math.ceil((new Date(oldCert.valid_until).getTime() - new Date(oldCert.valid_from).getTime()) / (24 * 60 * 60 * 1000));
    const validUntil = new Date(validFrom.getTime() + originalValidityDays * 24 * 60 * 60 * 1000);

    const { data: newCert, error: certError } = await supabase
      .from("pki_certificates")
      .insert({
        tenant_id: oldCert.tenant_id,
        environment_id: oldCert.environment_id,
        issuing_ca_id: oldCert.issuing_ca_id,
        cert_type: oldCert.cert_type,
        subject_cn: oldCert.subject_cn,
        subject_dn: oldCert.subject_dn,
        public_key: publicKey,
        private_key_encrypted: privateKey,
        fingerprint,
        serial_number: serialNumber,
        status: 'active',
        valid_from: validFrom.toISOString(),
        valid_until: validUntil.toISOString(),
        key_algorithm: 'ecdsa-p256',
        service_name: oldCert.service_name,
        avatar_id: oldCert.avatar_id,
        device_id: oldCert.device_id,
        mobile_app_id: oldCert.mobile_app_id,
        is_mtls_enabled: oldCert.is_mtls_enabled,
        created_by: user.id
      })
      .select()
      .single();

    if (certError) throw certError;

    if (oldCert.pki_certificate_claims && oldCert.pki_certificate_claims.length > 0) {
      const newClaims = oldCert.pki_certificate_claims.map((claim: { claim_type: string; claim_value: string; is_critical: boolean }) => ({
        certificate_id: newCert.id,
        claim_type: claim.claim_type,
        claim_value: claim.claim_value,
        is_critical: claim.is_critical
      }));
      await supabase.from("pki_certificate_claims").insert(newClaims);
    }

    await supabase
      .from("pki_certificates")
      .update({ status: 'rotating', updated_at: new Date().toISOString() })
      .eq("id", certificate_id);

    const overlapMs = (overlap_hours || 24) * 60 * 60 * 1000;
    setTimeout(async () => {
      await supabase
        .from("pki_certificates")
        .update({ status: 'expired', updated_at: new Date().toISOString() })
        .eq("id", certificate_id);
    }, overlapMs);

    await supabase
      .from("pki_rotation_history")
      .insert({
        target_type: 'certificate',
        old_target_id: certificate_id,
        new_target_id: newCert.id,
        rotation_reason: rotation_reason || 'manual_rotation',
        rotated_by: user.id,
        was_successful: true
      });

    await supabase
      .from("pki_rotation_schedules")
      .update({
        target_id: newCert.id,
        last_rotation_at: new Date().toISOString(),
        next_rotation_at: new Date(validUntil.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
      })
      .eq("target_id", certificate_id)
      .eq("target_type", "certificate");

    await logAudit(supabase, 'cert_rotated', 'user', user.id, 'kee', 'certificate', newCert.id, newCert.subject_cn, newCert.tenant_id, newCert.environment_id, true, undefined, undefined, { old_cert_id: certificate_id, old_fingerprint: oldCert.fingerprint, new_fingerprint: fingerprint, rotation_reason });

    res.status(201).json({
      success: true,
      old_certificate_id: certificate_id,
      new_certificate: {
        id: newCert.id,
        subject_cn: newCert.subject_cn,
        fingerprint: newCert.fingerprint,
        serial_number: newCert.serial_number,
        valid_from: newCert.valid_from,
        valid_until: newCert.valid_until,
        public_key: newCert.public_key,
        private_key: newCert.private_key_encrypted
      },
      overlap_period_hours: overlap_hours || 24
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/pki-api/crl", async (req, res) => {
  try {
    const supabase = getServiceClient();
    const { tenant_id, environment_id } = req.query;

    const { data, error } = await supabase.rpc('get_certificate_revocation_list', {
      p_tenant_id: tenant_id || null,
      p_environment_id: environment_id || null
    });

    if (error) throw error;

    res.json({
      crl: {
        generated_at: new Date().toISOString(),
        entries: data,
        total_count: data?.length || 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/pki-api/certificates/expiring", async (req, res) => {
  try {
    const supabase = getServiceClient();
    const days_ahead = parseInt(req.query.days_ahead as string) || 7;

    const { data, error } = await supabase.rpc('get_certificates_due_for_rotation', {
      p_days_ahead: days_ahead
    });

    if (error) throw error;

    res.json({
      expiring_certificates: data,
      check_date: new Date().toISOString(),
      days_ahead
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/pki-api/certificates/:id/validate", async (req, res) => {
  try {
    const supabase = getServiceClient();
    const certificateId = req.params.id;

    const { data: validation, error: validationError } = await supabase.rpc('validate_certificate_chain', {
      cert_id: certificateId
    });

    if (validationError) throw validationError;

    const { data: claims, error: claimsError } = await supabase.rpc('extract_certificate_claims', {
      cert_id: certificateId
    });

    if (claimsError) throw claimsError;

    const result = validation?.[0] || { is_valid: false, chain_depth: 0, validation_errors: ['Certificate not found'] };

    res.json({
      certificate_id: certificateId,
      is_valid: result.is_valid,
      chain_depth: result.chain_depth,
      validation_errors: result.validation_errors,
      claims
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/pki-api/rotation-schedules", async (req, res) => {
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from("pki_rotation_schedules")
      .select("*")
      .eq("is_active", true)
      .order("next_rotation_at");

    if (error) throw error;
    res.json({ rotation_schedules: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/pki-api/rotation-schedules/execute-pending", async (req, res) => {
  try {
    const supabase = getServiceClient();
    const userClient = getUserClient(req.headers.authorization!);
    const { data: { user } } = await userClient.auth.getUser();

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { data: pendingSchedules } = await supabase
      .from("pki_rotation_schedules")
      .select("*")
      .eq("is_active", true)
      .lte("next_rotation_at", new Date().toISOString())
      .eq("target_type", "certificate");

    const results = [];
    for (const schedule of pendingSchedules || []) {
      try {
        const rotateResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/pki-api/certificates/rotate`, {
          method: "POST",
          headers: {
            "Authorization": req.headers.authorization!,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            certificate_id: schedule.target_id,
            rotation_reason: "scheduled_rotation",
            overlap_hours: schedule.overlap_period_hours
          })
        });

        const rotateResult = await rotateResponse.json();
        results.push({ schedule_id: schedule.id, success: true, new_cert_id: rotateResult.new_certificate?.id });
      } catch (err) {
        results.push({ schedule_id: schedule.id, success: false, error: err.message });
      }
    }

    res.json({
      executed_rotations: results,
      total_pending: pendingSchedules?.length || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/pki-api/avatar-keypacks/create", async (req, res) => {
  try {
    const supabase = getServiceClient();
    const userClient = getUserClient(req.headers.authorization!);
    const { data: { user } } = await userClient.auth.getUser();

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { avatar_id, avatar_name, tenant_id, environment_id, avatar_ca_id } = req.body;

    const { data: keypackId, error } = await supabase.rpc('pki_create_avatar_keypack', {
      p_avatar_id: avatar_id,
      p_avatar_name: avatar_name,
      p_tenant_id: tenant_id,
      p_environment_id: environment_id,
      p_avatar_ca_id: avatar_ca_id || null
    });

    if (error) throw error;

    res.status(201).json({ success: true, keypack_id: keypackId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/pki-api/avatar-keypacks/:keypackId/keys/create", async (req, res) => {
  try {
    const supabase = getServiceClient();
    const userClient = getUserClient(req.headers.authorization!);
    const { data: { user } } = await userClient.auth.getUser();

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { keypackId } = req.params;
    const { key_purpose, key_name, allowed_scopes, valid_days } = req.body;

    const validPurposes = ['auth', 'art', 'edition', 'campaign', 'gamewear', 'webhook', 'admin', 'ops'];
    if (!validPurposes.includes(key_purpose)) {
      return res.status(400).json({ error: `Invalid key purpose. Allowed: ${validPurposes.join(', ')}` });
    }

    const { publicKey, privateKey, fingerprint } = await generateKeyPair();
    const serialNumber = generateSerialNumber();
    const validFrom = new Date();
    const validUntil = new Date(validFrom.getTime() + (valid_days || 365) * 24 * 60 * 60 * 1000);

    const { data: key, error } = await supabase
      .from("pki_avatar_keys")
      .insert({
        keypack_id: keypackId,
        key_purpose,
        key_name: key_name || `${key_purpose}.key`,
        public_key: publicKey,
        private_key_encrypted: privateKey,
        fingerprint,
        serial_number: serialNumber,
        allowed_scopes: allowed_scopes || [],
        valid_from: validFrom.toISOString(),
        valid_until: validUntil.toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      key: {
        id: key.id,
        key_purpose: key.key_purpose,
        fingerprint: key.fingerprint,
        valid_until: key.valid_until,
        public_key: key.public_key,
        private_key: key.private_key_encrypted
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/pki-api/avatar-keypacks", async (req, res) => {
  try {
    const supabase = getServiceClient();
    const { avatar_id, tenant_id, environment_id } = req.query;

    let query = supabase.from("pki_avatar_keypack_summary").select("*");

    if (avatar_id) query = query.eq("avatar_id", avatar_id);
    if (tenant_id) query = query.eq("tenant_id", tenant_id);
    if (environment_id) query = query.eq("environment_id", environment_id);

    const { data, error } = await query;
    if (error) throw error;

    res.json({ keypacks: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/pki-api/avatar-keypacks/:keypackId/keys", async (req, res) => {
  try {
    const supabase = getServiceClient();
    const { keypackId } = req.params;

    const { data, error } = await supabase
      .from("pki_avatar_keys")
      .select("id, key_purpose, key_name, fingerprint, serial_number, allowed_scopes, status, valid_from, valid_until, public_key")
      .eq("keypack_id", keypackId)
      .order("key_purpose");

    if (error) throw error;

    res.json({ keys: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/pki-api/provenance/append", async (req, res) => {
  try {
    const supabase = getServiceClient();
    const userClient = getUserClient(req.headers.authorization!);
    const { data: { user } } = await userClient.auth.getUser();

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { art_id, edition_number, asset_type, event_type, content_hash, avatar_id, cert_fingerprint, metadata } = req.body;

    const { data: cert } = await supabase
      .from("pki_certificates")
      .select("id")
      .eq("fingerprint", cert_fingerprint)
      .eq("status", "active")
      .maybeSingle();

    const encoder = new TextEncoder();
    const data = encoder.encode(content_hash + Date.now().toString());
    const signatureBuffer = await crypto.subtle.digest("SHA-256", data);
    const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));

    const { data: entryId, error } = await supabase.rpc('pki_append_provenance_entry', {
      p_art_id: art_id,
      p_edition_number: edition_number || null,
      p_asset_type: asset_type,
      p_event_type: event_type,
      p_content_hash: content_hash,
      p_signed_by_avatar_id: avatar_id,
      p_cert_id: cert?.id || null,
      p_cert_fingerprint: cert_fingerprint,
      p_signature: signature,
      p_metadata: metadata || {}
    });

    if (error) throw error;

    res.status(201).json({ success: true, provenance_entry_id: entryId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/pki-api/provenance/:artId", async (req, res) => {
  try {
    const supabase = getServiceClient();
    const { artId } = req.params;

    const { data: chain, error: chainError } = await supabase
      .from("pki_art_provenance")
      .select("*")
      .eq("art_id", artId)
      .order("chain_position", { ascending: true });

    if (chainError) throw chainError;

    const { data: verification, error: verifyError } = await supabase.rpc('pki_verify_provenance_chain', {
      p_art_id: artId
    });

    if (verifyError) throw verifyError;

    const result = verification?.[0] || { is_valid: true, chain_length: chain?.length || 0 };

    res.json({
      art_id: artId,
      chain: chain,
      chain_integrity: {
        is_valid: result.is_valid,
        chain_length: result.chain_length,
        error: result.error_message
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/pki-api/drops/create", async (req, res) => {
  try {
    const supabase = getServiceClient();
    const userClient = getUserClient(req.headers.authorization!);
    const { data: { user } } = await userClient.auth.getUser();

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { drop_id, tenant_id, environment_id, title, description, avatar_id, edition_size, asset_ids, asset_hashes, avatar_cert_fingerprint, drop_date } = req.body;

    const { data: cert } = await supabase
      .from("pki_certificates")
      .select("id")
      .eq("fingerprint", avatar_cert_fingerprint)
      .eq("status", "active")
      .maybeSingle();

    const encoder = new TextEncoder();
    const signData = encoder.encode(drop_id + asset_hashes.join('') + Date.now().toString());
    const signatureBuffer = await crypto.subtle.digest("SHA-256", signData);
    const avatarSignature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));

    const { data: drop, error } = await supabase
      .from("pki_drop_certificates")
      .insert({
        drop_id,
        tenant_id,
        environment_id,
        title,
        description,
        avatar_id,
        edition_size,
        asset_ids,
        asset_hashes,
        signed_by_avatar_cert_id: cert?.id,
        avatar_signature: avatarSignature,
        drop_date: drop_date || null,
        status: 'signed'
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, drop_certificate: drop });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/pki-api/drops/:dropId/cosign", async (req, res) => {
  try {
    const supabase = getServiceClient();
    const userClient = getUserClient(req.headers.authorization!);
    const { data: { user } } = await userClient.auth.getUser();

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { dropId } = req.params;
    const { admin_cert_fingerprint } = req.body;

    const { data: cert } = await supabase
      .from("pki_certificates")
      .select("id")
      .eq("fingerprint", admin_cert_fingerprint)
      .eq("status", "active")
      .maybeSingle();

    const { data: drop } = await supabase
      .from("pki_drop_certificates")
      .select("*")
      .eq("id", dropId)
      .maybeSingle();

    if (!drop) {
      return res.status(404).json({ error: "Drop not found" });
    }

    const encoder = new TextEncoder();
    const signData = encoder.encode(drop.drop_id + drop.avatar_signature + Date.now().toString());
    const signatureBuffer = await crypto.subtle.digest("SHA-256", signData);
    const adminSignature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));

    const { error } = await supabase
      .from("pki_drop_certificates")
      .update({
        co_signed_by_admin_cert_id: cert?.id,
        admin_signature: adminSignature,
        status: 'co_signed'
      })
      .eq("id", dropId);

    if (error) throw error;

    res.json({ success: true, status: 'co_signed' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/pki-api/drops/:dropId/release", async (req, res) => {
  try {
    const supabase = getServiceClient();
    const { dropId } = req.params;

    const { error } = await supabase
      .from("pki_drop_certificates")
      .update({ status: 'released', released_at: new Date().toISOString() })
      .eq("id", dropId)
      .eq("status", "co_signed");

    if (error) throw error;

    res.json({ success: true, status: 'released' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/pki-api/drops", async (req, res) => {
  try {
    const supabase = getServiceClient();
    const { tenant_id, status } = req.query;

    let query = supabase.from("pki_drop_certificates").select("*");

    if (tenant_id) query = query.eq("tenant_id", tenant_id);
    if (status) query = query.eq("status", status);

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) throw error;

    res.json({ drops: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/pki-api/editions/mint", async (req, res) => {
  try {
    const supabase = getServiceClient();
    const userClient = getUserClient(req.headers.authorization!);
    const { data: { user } } = await userClient.auth.getUser();

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { art_id, drop_id, edition_number, edition_total, avatar_id, cert_fingerprint, content_hash } = req.body;

    const { data: cert } = await supabase
      .from("pki_certificates")
      .select("id")
      .eq("fingerprint", cert_fingerprint)
      .eq("status", "active")
      .maybeSingle();

    const { data: drop } = drop_id ? await supabase
      .from("pki_drop_certificates")
      .select("drop_id")
      .eq("id", drop_id)
      .maybeSingle() : { data: null };

    const serialNumber = await supabase.rpc('pki_generate_edition_serial', {
      p_art_id: art_id,
      p_edition_number: edition_number,
      p_drop_id: drop?.drop_id || null
    });

    const encoder = new TextEncoder();
    const signData = encoder.encode(content_hash + edition_number.toString() + Date.now().toString());
    const signatureBuffer = await crypto.subtle.digest("SHA-256", signData);
    const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));

    const { data: edition, error: editionError } = await supabase
      .from("pki_art_editions")
      .insert({
        art_id,
        drop_id,
        edition_number,
        edition_total,
        serial_number: serialNumber.data,
        content_hash,
        signed_by_avatar_id: avatar_id,
        signed_by_cert_id: cert?.id,
        cert_fingerprint,
        signature,
        status: 'minted'
      })
      .select()
      .single();

    if (editionError) throw editionError;

    const { data: qrPayload } = await supabase.rpc('pki_generate_verification_payload', {
      p_edition_id: edition.id
    });

    await supabase
      .from("pki_art_editions")
      .update({ qr_payload: JSON.stringify(qrPayload) })
      .eq("id", edition.id);

    await supabase.rpc('pki_append_provenance_entry', {
      p_art_id: art_id,
      p_edition_number: edition_number,
      p_asset_type: 'physical_print',
      p_event_type: 'edition_minted',
      p_content_hash: content_hash,
      p_signed_by_avatar_id: avatar_id,
      p_cert_id: cert?.id,
      p_cert_fingerprint: cert_fingerprint,
      p_signature: signature,
      p_metadata: { edition_total, serial_number: serialNumber.data }
    });

    res.status(201).json({
      success: true,
      edition: {
        id: edition.id,
        serial_number: edition.serial_number,
        edition: `${edition_number}/${edition_total}`,
        fingerprint: cert_fingerprint,
        qr_payload: qrPayload
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/pki-api/editions/verify/:serial", async (req, res) => {
  try {
    const supabase = getServiceClient();
    const { serial } = req.params;

    const { data: edition, error: editionError } = await supabase
      .from("pki_art_editions")
      .select("*, pki_drop_certificates(*)")
      .eq("serial_number", serial)
      .maybeSingle();

    if (editionError) throw editionError;

    if (!edition) {
      await supabase.from("pki_edition_verifications").insert({
        edition_id: null,
        verification_method: 'api',
        verification_result: false,
        failure_reason: 'Serial number not found'
      });
      return res.json({ verified: false, error: "Serial number not found" });
    }

    const { data: art } = await supabase
      .from("art_assets")
      .select("name, file_url")
      .eq("id", edition.art_id)
      .maybeSingle();

    await supabase.from("pki_edition_verifications").insert({
      edition_id: edition.id,
      verification_method: 'api',
      verification_result: true,
      verified_by_ip: req.ip
    });

    res.json({
      verified: true,
      edition: {
        serial_number: edition.serial_number,
        edition: `${edition.edition_number}/${edition.edition_total}`,
        art_title: art?.name,
        art_thumbnail: art?.file_url,
        minted_at: edition.minted_at,
        status: edition.status,
        cert_fingerprint: edition.cert_fingerprint,
        drop: edition.pki_drop_certificates ? {
          drop_id: edition.pki_drop_certificates.drop_id,
          title: edition.pki_drop_certificates.title
        } : null
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/pki-api/editions", async (req, res) => {
  try {
    const supabase = getServiceClient();
    const { art_id, drop_id, owner_id, status } = req.query;

    let query = supabase
      .from("pki_art_editions")
      .select("id, art_id, drop_id, edition_number, edition_total, serial_number, status, minted_at, cert_fingerprint");

    if (art_id) query = query.eq("art_id", art_id);
    if (drop_id) query = query.eq("drop_id", drop_id);
    if (owner_id) query = query.eq("owner_id", owner_id);
    if (status) query = query.eq("status", status);

    const { data, error } = await query.order("edition_number");
    if (error) throw error;

    res.json({ editions: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/pki-api/impersonation/start", async (req, res) => {
  try {
    const supabase = getServiceClient();
    const userClient = getUserClient(req.headers.authorization!);
    const { data: { user } } = await userClient.auth.getUser();

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { impersonator_name, target_role, target_avatar_id, tenant_id, environment_id, cert_fingerprint, duration_minutes } = req.body;

    const { data: sessionId, error } = await supabase.rpc('pki_start_impersonation_session', {
      p_impersonator_id: user.id,
      p_impersonator_name: impersonator_name,
      p_target_role: target_role,
      p_target_avatar_id: target_avatar_id || null,
      p_tenant_id: tenant_id,
      p_environment_id: environment_id,
      p_cert_fingerprint: cert_fingerprint,
      p_duration_minutes: duration_minutes || 60,
      p_ip_address: req.ip || null,
      p_user_agent: req.headers['user-agent'] || null
    });

    if (error) throw error;

    const { data: session } = await supabase
      .from("pki_impersonation_sessions")
      .select("session_token, expires_at")
      .eq("id", sessionId)
      .single();

    res.status(201).json({
      success: true,
      session_id: sessionId,
      session_token: session.session_token,
      expires_at: session.expires_at
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/pki-api/impersonation/validate", async (req, res) => {
  try {
    const supabase = getServiceClient();
    const { session_token } = req.body;

    const { data, error } = await supabase.rpc('pki_validate_impersonation_session', {
      p_session_token: session_token
    });

    if (error) throw error;

    const result = data?.[0] || { is_valid: false };

    res.json({
      is_valid: result.is_valid,
      session_id: result.session_id,
      impersonator_name: result.impersonator_name,
      target_role: result.target_role,
      target_avatar_id: result.target_avatar_id,
      minutes_remaining: result.minutes_remaining
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/pki-api/impersonation/:sessionId/end", async (req, res) => {
  try {
    const supabase = getServiceClient();
    const { sessionId } = req.params;
    const { reason } = req.body;

    const { data, error } = await supabase.rpc('pki_end_impersonation_session', {
      p_session_id: sessionId,
      p_reason: reason || 'manual'
    });

    if (error) throw error;

    res.json({ success: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/pki-api/impersonation/sessions", async (req, res) => {
  try {
    const supabase = getServiceClient();
    const { active_only } = req.query;

    let query = supabase
      .from("pki_impersonation_sessions")
      .select("*")
      .order("created_at", { ascending: false });

    if (active_only === 'true') {
      query = query.is("ended_at", null).gt("expires_at", new Date().toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json({ sessions: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/pki-api/audit", async (req, res) => {
  try {
    const supabase = getServiceClient();
    const { role, action, tenant_id, limit } = req.query;

    let viewName = 'pki_audit_kee_view';
    if (role === 'lexi') viewName = 'pki_audit_lexi_view';
    if (role === 'k-kwamii') viewName = 'pki_audit_k_view';

    let query = supabase.from(viewName).select("*");

    if (action) query = query.eq("action", action);
    if (tenant_id) query = query.eq("tenant_id", tenant_id);

    const { data, error } = await query.limit(parseInt(limit as string) || 100);
    if (error) throw error;

    res.json({ audit_entries: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(8000);
console.log("PKI API running on port 8000");
