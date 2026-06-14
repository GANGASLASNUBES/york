export type TenantCode =
  | 'foster-hardware'
  | 'foster-link'
  | 'red-ruby-home'
  | 'bips-public'
  | 'bips-internal';

export type EnvironmentCode =
  | 'dev'
  | 'staging'
  | 'prod'
  | 'sandbox-impersonation';

export type CAType =
  | 'root'
  | 'intermediate-api'
  | 'intermediate-client'
  | 'intermediate-avatar'
  | 'intermediate-ops';

export type CertType =
  | 'service'
  | 'client'
  | 'avatar'
  | 'ops'
  | 'webhook-relay'
  | 'cdn-edge'
  | 'mobile-app'
  | 'field-device';

export type CertStatus =
  | 'pending'
  | 'active'
  | 'suspended'
  | 'revoked'
  | 'expired'
  | 'rotating';

export type GateRole =
  | 'kee'
  | 'lexi'
  | 'k-kwamii'
  | 'service'
  | 'client'
  | 'anonymous';

export type AuditAction =
  | 'cert_issued'
  | 'cert_renewed'
  | 'cert_revoked'
  | 'cert_rotated'
  | 'cert_suspended'
  | 'ca_created'
  | 'ca_rotated'
  | 'validation_success'
  | 'validation_failure'
  | 'policy_allowed'
  | 'policy_denied'
  | 'key_generated'
  | 'key_rotated'
  | 'webhook_signed'
  | 'webhook_verified'
  | 'webhook_verification_failed'
  | 'claim_added'
  | 'claim_removed'
  | 'rotation_scheduled'
  | 'rotation_executed';

export interface PKITenant {
  id: string;
  code: TenantCode;
  name: string;
  description?: string;
  contact_email?: string;
  is_active: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PKIEnvironment {
  id: string;
  code: EnvironmentCode;
  name: string;
  description?: string;
  is_production: boolean;
  allows_impersonation: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface PKICertificateAuthority {
  id: string;
  tenant_id?: string;
  environment_id?: string;
  ca_type: CAType;
  name: string;
  subject_dn: string;
  public_key: string;
  fingerprint: string;
  serial_number: string;
  parent_ca_id?: string;
  valid_from: string;
  valid_until: string;
  key_algorithm: string;
  signature_algorithm: string;
  path_length_constraint?: number;
  is_active: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface PKICertificate {
  id: string;
  tenant_id: string;
  environment_id: string;
  issuing_ca_id: string;
  cert_type: CertType;
  subject_cn: string;
  subject_dn: string;
  public_key: string;
  private_key_encrypted?: string;
  fingerprint: string;
  serial_number: string;
  status: CertStatus;
  valid_from: string;
  valid_until: string;
  key_algorithm: string;
  service_name?: string;
  avatar_id?: string;
  device_id?: string;
  mobile_app_id?: string;
  is_mtls_enabled: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface PKICertificateClaim {
  id: string;
  certificate_id: string;
  claim_type: string;
  claim_value: string;
  is_critical: boolean;
  created_at: string;
}

export interface PKIRevocation {
  id: string;
  certificate_id: string;
  revoked_at: string;
  reason: string;
  revoked_by?: string;
  notes?: string;
  crl_entry_number?: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface PKIPolicyRule {
  id: string;
  name: string;
  description?: string;
  gate_role: GateRole;
  tenant_id?: string;
  environment_id?: string;
  required_scopes: string[];
  allowed_actions: string[];
  denied_actions: string[];
  conditions: Record<string, unknown>;
  priority: number;
  is_active: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PKIAuditLogEntry {
  id: string;
  tenant_id?: string;
  environment_id?: string;
  action: AuditAction;
  actor_type: 'user' | 'service' | 'avatar' | 'system';
  actor_id?: string;
  actor_role?: GateRole;
  resource_type: string;
  resource_id?: string;
  resource_name?: string;
  certificate_fingerprint?: string;
  request_id?: string;
  ip_address?: string;
  user_agent?: string;
  success: boolean;
  error_code?: string;
  error_message?: string;
  details: Record<string, unknown>;
  created_at: string;
}

export interface CertificateClaims {
  cert_id: string;
  tenant: TenantCode;
  environment: EnvironmentCode;
  cert_type: CertType;
  subject_cn: string;
  service_name?: string;
  avatar_id?: string;
  device_id?: string;
  role?: GateRole;
  scopes?: string[];
  valid_from: string;
  valid_until: string;
  [key: string]: unknown;
}

export interface ValidationResult {
  is_valid: boolean;
  chain_depth: number;
  validation_errors: string[];
  claims?: CertificateClaims;
}

export interface PolicyCheckResult {
  is_allowed: boolean;
  matched_policy_id?: string;
  matched_policy_name?: string;
  denial_reason?: string;
}

export interface GateContext {
  role: GateRole;
  tenant_id?: string;
  environment_id?: string;
  avatar_id?: string;
  device_id?: string;
  scopes: string[];
  certificate_id?: string;
  fingerprint?: string;
}

export type AvatarKeyPurpose =
  | 'auth'
  | 'art'
  | 'edition'
  | 'campaign'
  | 'gamewear'
  | 'webhook'
  | 'admin'
  | 'ops';

export type CertScope =
  | 'art.sign'
  | 'art.transfer'
  | 'edition.issue'
  | 'edition.verify'
  | 'campaign.manage'
  | 'gamewear.publish'
  | 'affiliate.manage'
  | 'gifting.issue'
  | 'promo.create'
  | 'webhook.sign'
  | 'admin.rotate'
  | 'admin.revoke'
  | 'admin.impersonate';

export type ProvenanceEventType =
  | 'created'
  | 'signed'
  | 'transferred'
  | 'edition_minted'
  | 'drop_released'
  | 'verified'
  | 'revoked'
  | 'metadata_updated';

export type ArtAssetType =
  | 'digital_original'
  | 'physical_print'
  | 'gamewear'
  | 'campaign_asset'
  | 'merchandise';

export type DropStatus =
  | 'draft'
  | 'signed'
  | 'co_signed'
  | 'released'
  | 'cancelled';

export type EditionStatus =
  | 'minted'
  | 'transferred'
  | 'burned'
  | 'disputed';

export interface PKIAvatarKeypack {
  id: string;
  avatar_id: string;
  avatar_name: string;
  tenant_id: string;
  environment_id: string;
  avatar_ca_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PKIAvatarKey {
  id: string;
  keypack_id: string;
  key_purpose: AvatarKeyPurpose;
  key_name: string;
  public_key: string;
  fingerprint: string;
  serial_number: string;
  allowed_scopes: CertScope[];
  status: CertStatus;
  valid_from: string;
  valid_until: string;
  last_used_at?: string;
  created_at: string;
}

export interface PKICertificateScope {
  id: string;
  certificate_id: string;
  scope: CertScope;
  granted_at: string;
  granted_by?: string;
  valid_until?: string;
  is_active: boolean;
}

export interface PKIDropCertificate {
  id: string;
  drop_id: string;
  tenant_id: string;
  environment_id: string;
  title: string;
  description?: string;
  avatar_id: string;
  edition_size: number;
  asset_ids: string[];
  asset_hashes: string[];
  signed_by_avatar_cert_id?: string;
  avatar_signature: string;
  co_signed_by_admin_cert_id?: string;
  admin_signature?: string;
  status: DropStatus;
  drop_date?: string;
  released_at?: string;
  created_at: string;
}

export interface PKIArtProvenance {
  id: string;
  art_id: string;
  edition_number?: number;
  asset_type: ArtAssetType;
  event_type: ProvenanceEventType;
  content_hash: string;
  previous_hash?: string;
  chain_position: number;
  signed_by_avatar_id?: string;
  signed_by_cert_id?: string;
  cert_fingerprint?: string;
  signature: string;
  metadata: Record<string, unknown>;
  is_genesis: boolean;
  created_at: string;
}

export interface PKIArtEdition {
  id: string;
  art_id: string;
  drop_id?: string;
  edition_number: number;
  edition_total: number;
  serial_number: string;
  content_hash: string;
  signed_by_avatar_id?: string;
  signed_by_cert_id?: string;
  cert_fingerprint?: string;
  signature: string;
  owner_id?: string;
  previous_owner_id?: string;
  status: EditionStatus;
  qr_payload?: string;
  nfc_uid?: string;
  minted_at: string;
  transferred_at?: string;
}

export interface PKIEditionVerification {
  id: string;
  edition_id: string;
  verification_method: 'qr' | 'nfc' | 'api';
  verification_result: boolean;
  verified_by_user_id?: string;
  verified_by_ip?: string;
  device_fingerprint?: string;
  location_lat?: number;
  location_lng?: number;
  failure_reason?: string;
  created_at: string;
}

export interface PKIImpersonationSession {
  id: string;
  impersonator_id: string;
  impersonator_name: string;
  target_role: GateRole;
  target_avatar_id?: string;
  tenant_id: string;
  environment_id: string;
  authorized_by_cert_id?: string;
  cert_fingerprint?: string;
  session_token: string;
  started_at: string;
  expires_at: string;
  ended_at?: string;
  end_reason?: string;
  ip_address?: string;
  user_agent?: string;
  actions_performed: number;
}

export interface PKIRotationPolicy {
  id: string;
  key_purpose: AvatarKeyPurpose;
  tenant_id?: string;
  environment_id?: string;
  max_validity_days: number;
  rotation_warning_days: number;
  auto_rotate: boolean;
  require_admin_approval: boolean;
  created_at: string;
}

export interface PKICAHierarchy {
  id: string;
  parent_ca_id: string;
  child_ca_id: string;
  trust_level: number;
  path_validated: boolean;
  created_at: string;
}

export interface ProvenanceChainResult {
  art_id: string;
  chain: PKIArtProvenance[];
  chain_integrity: {
    is_valid: boolean;
    chain_length: number;
    error?: string;
  };
}

export interface EditionVerifyResult {
  verified: boolean;
  edition?: {
    serial_number: string;
    edition: string;
    art_title?: string;
    art_thumbnail?: string;
    minted_at: string;
    status: EditionStatus;
    cert_fingerprint?: string;
    drop?: {
      drop_id: string;
      title: string;
    };
  };
  error?: string;
}

export interface ImpersonationValidation {
  is_valid: boolean;
  session_id?: string;
  impersonator_name?: string;
  target_role?: GateRole;
  target_avatar_id?: string;
  minutes_remaining?: number;
}
