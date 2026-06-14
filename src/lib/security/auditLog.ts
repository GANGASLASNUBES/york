import { supabase } from '../supabase';

type AuditAction =
  | 'pin:create'
  | 'pin:delete'
  | 'pin:moderate'
  | 'alert:create'
  | 'alert:update'
  | 'alert:delete'
  | 'severity:override'
  | 'source:refresh_failed'
  | 'source:disable'
  | 'map:create'
  | 'map:delete'
  | 'trail:create'
  | 'trail:delete';

type AuditMetadata = Record<string, unknown>;

export async function logAuditEvent(
  userId: string,
  action: AuditAction,
  metadata: AuditMetadata = {},
  resourceType?: string,
  resourceId?: string
): Promise<void> {
  try {
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action,
      resource_type: resourceType || action.split(':')[0],
      resource_id: resourceId || null,
      metadata,
    });
  } catch {
    // Audit logging should never block the user action
  }
}
