import { supabase } from '../supabase';
import type {
  GateRole,
  GateContext,
  ValidationResult,
  PolicyCheckResult,
  CertificateClaims,
} from './types';

const PKI_API_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pki-api`;

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  };
}

export async function validateCertificate(certificateId: string): Promise<ValidationResult> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${PKI_API_BASE}/certificates/${certificateId}/validate`, {
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        is_valid: false,
        chain_depth: 0,
        validation_errors: [error.error || 'Validation failed'],
      };
    }

    const data = await response.json();
    return {
      is_valid: data.is_valid,
      chain_depth: data.chain_depth,
      validation_errors: data.validation_errors || [],
      claims: data.claims,
    };
  } catch (error) {
    return {
      is_valid: false,
      chain_depth: 0,
      validation_errors: [(error as Error).message],
    };
  }
}

export async function extractClaims(certificateId: string): Promise<CertificateClaims | null> {
  const { data, error } = await supabase.rpc('extract_certificate_claims', {
    cert_id: certificateId,
  });

  if (error || !data) {
    return null;
  }

  return Array.isArray(data) ? data[0] : data;
}

export async function checkPolicy(
  role: GateRole,
  action: string,
  tenantId?: string,
  environmentId?: string,
  scopes: string[] = []
): Promise<PolicyCheckResult> {
  const { data, error } = await supabase.rpc('check_pki_policy', {
    p_role: role,
    p_action: action,
    p_tenant_id: tenantId || null,
    p_environment_id: environmentId || null,
    p_scopes: scopes,
  });

  if (error) {
    return {
      is_allowed: false,
      denial_reason: error.message,
    };
  }

  const result = data?.[0];
  return {
    is_allowed: result?.is_allowed ?? false,
    matched_policy_id: result?.matched_policy_id,
    matched_policy_name: result?.matched_policy_name,
    denial_reason: result?.denial_reason,
  };
}

export async function isRevoked(fingerprint: string): Promise<boolean> {
  const { data } = await supabase.rpc('is_certificate_revoked', {
    p_fingerprint: fingerprint,
  });
  return Boolean(Array.isArray(data) ? data[0] : data);
}

export function buildGateContext(claims: CertificateClaims): GateContext {
  const scopes: string[] = [];

  if (claims.scopes) {
    scopes.push(...claims.scopes);
  }

  Object.entries(claims).forEach(([key, value]) => {
    if (key.startsWith('scope_') && typeof value === 'string') {
      scopes.push(value);
    }
  });

  let role: GateRole = 'anonymous';
  if (claims.role) {
    role = claims.role as GateRole;
  } else if (claims.cert_type === 'service') {
    role = 'service';
  } else if (claims.cert_type === 'client' || claims.cert_type === 'mobile-app' || claims.cert_type === 'field-device') {
    role = 'client';
  } else if (claims.cert_type === 'avatar') {
    role = 'lexi';
  }

  return {
    role,
    tenant_id: claims.tenant as string,
    environment_id: claims.environment as string,
    avatar_id: claims.avatar_id,
    device_id: claims.device_id,
    scopes,
    certificate_id: claims.cert_id,
  };
}

export class GateEnforcer {
  private context: GateContext;

  constructor(context: GateContext) {
    this.context = context;
  }

  get role(): GateRole {
    return this.context.role;
  }

  get tenantId(): string | undefined {
    return this.context.tenant_id;
  }

  get environmentId(): string | undefined {
    return this.context.environment_id;
  }

  get scopes(): string[] {
    return this.context.scopes;
  }

  isKee(): boolean {
    return this.context.role === 'kee';
  }

  isLexi(): boolean {
    return this.context.role === 'lexi';
  }

  isKKwamii(): boolean {
    return this.context.role === 'k-kwamii';
  }

  isService(): boolean {
    return this.context.role === 'service';
  }

  isClient(): boolean {
    return this.context.role === 'client';
  }

  hasScope(scope: string): boolean {
    return this.context.scopes.includes(scope);
  }

  hasAnyScope(scopes: string[]): boolean {
    return scopes.some(scope => this.context.scopes.includes(scope));
  }

  hasAllScopes(scopes: string[]): boolean {
    return scopes.every(scope => this.context.scopes.includes(scope));
  }

  async canPerform(action: string): Promise<PolicyCheckResult> {
    return checkPolicy(
      this.context.role,
      action,
      this.context.tenant_id,
      this.context.environment_id,
      this.context.scopes
    );
  }

  async enforceAction(action: string): Promise<void> {
    const result = await this.canPerform(action);
    if (!result.is_allowed) {
      throw new Error(`Access denied: ${result.denial_reason || 'Insufficient permissions'}`);
    }
  }

  canPublish(): boolean {
    if (this.isKee()) return true;
    if (this.isLexi()) return false;
    if (this.isKKwamii()) return false;
    return this.hasScope('publish') || this.hasScope('admin:publish');
  }

  canSuggestEdits(): boolean {
    if (this.isKee()) return true;
    if (this.isLexi()) return true;
    return this.hasScope('suggest_edit') || this.hasScope('avatar:suggest');
  }

  canAccessSandbox(): boolean {
    return this.isKee() || this.isKKwamii();
  }

  canImpersonate(): boolean {
    if (!this.canAccessSandbox()) return false;
    return this.context.environment_id === 'sandbox-impersonation' || this.isKee();
  }

  requiresAudit(): boolean {
    return this.isKee();
  }
}

export async function createGateEnforcer(certificateId: string): Promise<GateEnforcer | null> {
  const validation = await validateCertificate(certificateId);

  if (!validation.is_valid) {
    console.error('Certificate validation failed:', validation.validation_errors);
    return null;
  }

  if (!validation.claims) {
    console.error('No claims found in certificate');
    return null;
  }

  const context = buildGateContext(validation.claims);
  return new GateEnforcer(context);
}

export function createAnonymousGateEnforcer(): GateEnforcer {
  return new GateEnforcer({
    role: 'anonymous',
    scopes: [],
  });
}

export const GATE_ROLES: Record<GateRole, { name: string; description: string }> = {
  kee: {
    name: 'Kee (Admin)',
    description: 'Full administrative access with complete audit logging',
  },
  lexi: {
    name: 'Lexi (Avatar)',
    description: 'Avatar-scoped access with suggest edits but not publish',
  },
  'k-kwamii': {
    name: 'K/Kwamii (Sandbox)',
    description: 'Access only within sandbox-impersonation environment',
  },
  service: {
    name: 'Service',
    description: 'Backend service with API access',
  },
  client: {
    name: 'Client',
    description: 'Mobile app or field device',
  },
  anonymous: {
    name: 'Anonymous',
    description: 'Unauthenticated access',
  },
};

export async function getProvenanceChain(artId: string) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${PKI_API_BASE}/provenance/${artId}`, { headers });
  if (!response.ok) {
    throw new Error('Failed to fetch provenance chain');
  }
  return response.json();
}

export async function appendProvenanceEntry(data: {
  art_id: string;
  edition_number?: number;
  asset_type: string;
  event_type: string;
  content_hash: string;
  avatar_id: string;
  cert_fingerprint: string;
  metadata?: Record<string, unknown>;
}) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${PKI_API_BASE}/provenance/append`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to append provenance entry');
  }
  return response.json();
}

export async function verifyEditionBySerial(serial: string) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${PKI_API_BASE}/editions/verify/${serial}`, { headers });
  if (!response.ok) {
    throw new Error('Failed to verify edition');
  }
  return response.json();
}

export async function mintEdition(data: {
  art_id: string;
  drop_id?: string;
  edition_number: number;
  edition_total: number;
  avatar_id: string;
  cert_fingerprint: string;
  content_hash: string;
}) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${PKI_API_BASE}/editions/mint`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to mint edition');
  }
  return response.json();
}

export async function createDropCertificate(data: {
  drop_id: string;
  tenant_id: string;
  environment_id: string;
  title: string;
  description?: string;
  avatar_id: string;
  edition_size: number;
  asset_ids: string[];
  asset_hashes: string[];
  avatar_cert_fingerprint: string;
  drop_date?: string;
}) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${PKI_API_BASE}/drops/create`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create drop certificate');
  }
  return response.json();
}

export async function cosignDrop(dropId: string, adminCertFingerprint: string) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${PKI_API_BASE}/drops/${dropId}/cosign`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ admin_cert_fingerprint: adminCertFingerprint }),
  });
  if (!response.ok) {
    throw new Error('Failed to co-sign drop');
  }
  return response.json();
}

export async function releaseDrop(dropId: string) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${PKI_API_BASE}/drops/${dropId}/release`, {
    method: 'POST',
    headers,
  });
  if (!response.ok) {
    throw new Error('Failed to release drop');
  }
  return response.json();
}

export async function startImpersonationSession(data: {
  impersonator_name: string;
  target_role: GateRole;
  target_avatar_id?: string;
  tenant_id: string;
  environment_id: string;
  cert_fingerprint: string;
  duration_minutes?: number;
}) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${PKI_API_BASE}/impersonation/start`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to start impersonation session');
  }
  return response.json();
}

export async function validateImpersonationSession(sessionToken: string) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${PKI_API_BASE}/impersonation/validate`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ session_token: sessionToken }),
  });
  if (!response.ok) {
    throw new Error('Failed to validate impersonation session');
  }
  return response.json();
}

export async function endImpersonationSession(sessionId: string, reason?: string) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${PKI_API_BASE}/impersonation/${sessionId}/end`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ reason }),
  });
  if (!response.ok) {
    throw new Error('Failed to end impersonation session');
  }
  return response.json();
}

export async function createAvatarKeypack(data: {
  avatar_id: string;
  avatar_name: string;
  tenant_id: string;
  environment_id: string;
  avatar_ca_id?: string;
}) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${PKI_API_BASE}/avatar-keypacks/create`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create avatar keypack');
  }
  return response.json();
}

export async function addKeyToKeypack(keypackId: string, data: {
  key_purpose: string;
  key_name?: string;
  allowed_scopes?: string[];
  valid_days?: number;
}) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${PKI_API_BASE}/avatar-keypacks/${keypackId}/keys/create`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to add key to keypack');
  }
  return response.json();
}

export async function getAvatarKeypacks(filters?: {
  avatar_id?: string;
  tenant_id?: string;
  environment_id?: string;
}) {
  const headers = await getAuthHeaders();
  const params = new URLSearchParams();
  if (filters?.avatar_id) params.append('avatar_id', filters.avatar_id);
  if (filters?.tenant_id) params.append('tenant_id', filters.tenant_id);
  if (filters?.environment_id) params.append('environment_id', filters.environment_id);

  const url = `${PKI_API_BASE}/avatar-keypacks${params.toString() ? `?${params}` : ''}`;
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error('Failed to get avatar keypacks');
  }
  return response.json();
}

export async function getKeypackKeys(keypackId: string) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${PKI_API_BASE}/avatar-keypacks/${keypackId}/keys`, { headers });
  if (!response.ok) {
    throw new Error('Failed to get keypack keys');
  }
  return response.json();
}
