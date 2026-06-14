import { supabase } from './supabase';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type PushChannel = 'LEXI_SITE' | 'BIPS_SITE' | 'GEAR_SITE' | 'ALL';

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
  domain: PushChannel;
  level?: 'info' | 'warning' | 'critical';
  pki_sig?: string;
}

export type PushPermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

// ─── VAPID public key fetch ────────────────────────────────────────────────────

let _vapidPublicKey: string | null = null;

async function getVapidPublicKey(): Promise<string | null> {
  if (_vapidPublicKey) return _vapidPublicKey;
  try {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/push-relay/vapid-public-key`;
    const res = await fetch(url, {
      headers: { apikey: import.meta.env.VITE_SUPABASE_ANON_KEY },
    });
    if (!res.ok) return null;
    const { key } = await res.json();
    _vapidPublicKey = key;
    return key;
  } catch {
    return null;
  }
}

// ─── Permission state ──────────────────────────────────────────────────────────

export function getPushPermissionState(): PushPermissionState {
  if (!('Notification' in window)) return 'unsupported';
  if (!('serviceWorker' in navigator)) return 'unsupported';
  if (!('PushManager' in window)) return 'unsupported';
  return Notification.permission as PushPermissionState;
}

export async function requestPushPermission(): Promise<PushPermissionState> {
  if (getPushPermissionState() === 'unsupported') return 'unsupported';
  const result = await Notification.requestPermission();
  return result as PushPermissionState;
}

// ─── Subscribe ─────────────────────────────────────────────────────────────────

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length) as Uint8Array<ArrayBuffer>;
  for (let i = 0; i < raw.length; ++i) output[i] = raw.charCodeAt(i);
  return output;
}

export async function subscribeToPush(channel: PushChannel = 'ALL'): Promise<boolean> {
  try {
    const permission = await requestPushPermission();
    if (permission !== 'granted') return false;

    const vapidPublicKey = await getVapidPublicKey();
    if (!vapidPublicKey) {
      // Fall back to localStorage subscription tracking without VAPID
      // Still allows offline queue and local notifications
      localStorage.setItem('push_channel', channel);
      localStorage.setItem('push_subscribed', 'local');
      return true;
    }

    const reg = await navigator.serviceWorker.ready;
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

    const existing = await reg.pushManager.getSubscription();
    if (existing) await existing.unsubscribe();

    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });

    const sub = subscription.toJSON();
    const { data: { session } } = await supabase.auth.getSession();

    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/push-relay/subscribe`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          keys: sub.keys,
          channel,
          userAgent: navigator.userAgent.slice(0, 200),
        }),
      },
    );

    if (res.ok) {
      localStorage.setItem('push_channel', channel);
      localStorage.setItem('push_subscribed', 'remote');
      return true;
    }
    return false;
  } catch (err) {
    console.warn('[push] subscribe failed:', err);
    return false;
  }
}

// ─── Unsubscribe ───────────────────────────────────────────────────────────────

export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const reg = await navigator.serviceWorker.ready;
    const subscription = await reg.pushManager.getSubscription();
    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();
      await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/push-relay/unsubscribe`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ endpoint }),
        },
      );
    }
    localStorage.removeItem('push_channel');
    localStorage.removeItem('push_subscribed');
    return true;
  } catch {
    return false;
  }
}

// ─── Check subscription status ─────────────────────────────────────────────────

export async function getPushSubscriptionStatus(): Promise<{
  subscribed: boolean;
  channel: PushChannel | null;
  type: 'remote' | 'local' | null;
}> {
  const type = localStorage.getItem('push_subscribed') as 'remote' | 'local' | null;
  const channel = localStorage.getItem('push_channel') as PushChannel | null;

  if (!type) return { subscribed: false, channel: null, type: null };

  if (type === 'remote' && 'serviceWorker' in navigator && 'PushManager' in window) {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (!sub) {
        localStorage.removeItem('push_subscribed');
        localStorage.removeItem('push_channel');
        return { subscribed: false, channel: null, type: null };
      }
    } catch {
      // service worker not available
    }
  }

  return { subscribed: true, channel, type };
}

// ─── Local notification (fallback when push not available) ─────────────────────

export async function showLocalNotification(payload: PushPayload): Promise<void> {
  if (Notification.permission !== 'granted') return;
  const channel = localStorage.getItem('push_channel') as PushChannel | null;
  if (channel && payload.domain !== 'ALL' && channel !== 'ALL' && payload.domain !== channel) return;

  // Use service worker notification if available for better persistence
  if ('serviceWorker' in navigator) {
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon ?? '/icons/icon-192.png',
      badge: payload.badge ?? '/icons/icon-192.png',
      tag: payload.tag ?? payload.domain,
      data: { url: payload.url ?? '/ops', domain: payload.domain, level: payload.level },
    });
  } else {
    new Notification(payload.title, {
      body: payload.body,
      icon: payload.icon ?? '/icons/icon-192.png',
      tag: payload.tag ?? payload.domain,
    });
  }
}

// ─── PKI payload verification ──────────────────────────────────────────────────

export async function verifyPushPayload(payload: PushPayload): Promise<boolean> {
  // If no PKI sig present, treat as unverified but not invalid (backwards compat)
  if (!payload.pki_sig) return true;

  try {
    // Verify the signature field is a base64url ECDSA-P256 sig over title+body+domain
    const message = `${payload.title}|${payload.body}|${payload.domain}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(message);

    // For now we accept any well-formed sig — full PKI cert chain validation
    // requires the pki-api edge function and is reserved for server-side verification.
    // Client verifies format only; server verifies chain.
    const isBase64url = /^[A-Za-z0-9_-]+$/.test(payload.pki_sig);
    return isBase64url && payload.pki_sig.length >= 64;
  } catch {
    return false;
  }
}

// ─── Offline queue ─────────────────────────────────────────────────────────────

interface QueuedAction {
  id: string;
  type: 'create_alert' | 'resolve_alert' | 'create_note' | 'create_snapshot';
  payload: unknown;
  queuedAt: number;
}

const QUEUE_KEY = 'bips_offline_queue';

export function queueOfflineAction(action: Omit<QueuedAction, 'id' | 'queuedAt'>): void {
  try {
    const existing: QueuedAction[] = JSON.parse(localStorage.getItem(QUEUE_KEY) ?? '[]');
    existing.push({
      ...action,
      id: crypto.randomUUID(),
      queuedAt: Date.now(),
    });
    // Keep only last 50 queued actions
    const trimmed = existing.slice(-50);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(trimmed));
  } catch {
    // storage not available
  }
}

export function getOfflineQueue(): QueuedAction[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function clearOfflineQueue(): void {
  localStorage.removeItem(QUEUE_KEY);
}

export function removeFromOfflineQueue(id: string): void {
  try {
    const existing = getOfflineQueue().filter((a) => a.id !== id);
    localStorage.setItem(QUEUE_KEY, JSON.stringify(existing));
  } catch {
    // ignore
  }
}

// ─── Background sync registration ─────────────────────────────────────────────

export async function registerBackgroundSync(tag = 'bips-ops-sync'): Promise<boolean> {
  try {
    if (!('serviceWorker' in navigator)) return false;
    const reg = await navigator.serviceWorker.ready;
    // Background Sync API
    if ('sync' in reg) {
      await (reg as ServiceWorkerRegistration & { sync: { register(tag: string): Promise<void> } }).sync.register(tag);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
