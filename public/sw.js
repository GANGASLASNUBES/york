const CACHE_NAME = 'bips-ops-v2';
const OFFLINE_QUEUE_KEY = 'bips_sw_offline_queue';

const STATIC_ASSETS = [
  '/',
  '/ops',
  '/hub',
  '/index.html',
  '/manifest.json',
];

// ─── Install ──────────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(STATIC_ASSETS).catch(() => {
        // Individual asset failures shouldn't block install
      })
    )
  );
  self.skipWaiting();
});

// ─── Activate ─────────────────────────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ─── Fetch (network-first with cache fallback) ────────────────────────────────

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = event.request.url;

  // Always bypass: Convex, Supabase, external APIs
  if (
    url.includes('convex.cloud') ||
    url.includes('supabase.co') ||
    url.includes('openai.com') ||
    url.includes('api.printful') ||
    url.includes('readyplayer.me')
  ) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request).then((response) => {
        if (response.ok && event.request.url.startsWith(self.location.origin)) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
      return cached || networkFetch;
    })
  );
});

// ─── Push notification handler ────────────────────────────────────────────────

self.addEventListener('push', (event) => {
  let payload = {
    title: 'ᗺIPS Ops',
    body: 'New notification',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'bips-ops',
    domain: 'ALL',
    level: 'info',
    url: '/ops',
  };

  if (event.data) {
    try {
      const data = event.data.json();
      payload = { ...payload, ...data };
    } catch {
      payload.body = event.data.text();
    }
  }

  // Domain → accent color for the notification
  const colorMap = {
    LEXI_SITE: '#f43f5e',
    BIPS_SITE: '#06b6d4',
    GEAR_SITE: '#f59e0b',
    ALL: '#64748b',
  };

  const options = {
    body: payload.body,
    icon: payload.icon,
    badge: payload.badge,
    tag: payload.tag,
    data: {
      url: payload.url,
      domain: payload.domain,
      level: payload.level,
    },
    requireInteraction: payload.level === 'critical',
    silent: payload.level === 'info',
    vibrate: payload.level === 'critical' ? [200, 100, 200, 100, 200] : [100],
    actions: [
      { action: 'open', title: 'Open Ops' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

// ─── Notification click handler ───────────────────────────────────────────────

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url ?? '/ops';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Focus existing /ops window if open
      for (const client of clientList) {
        if (client.url.includes('/ops') && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// ─── Background sync ──────────────────────────────────────────────────────────

self.addEventListener('sync', (event) => {
  if (event.tag === 'bips-ops-sync') {
    event.waitUntil(flushOfflineQueue());
  }
});

async function flushOfflineQueue() {
  // Notify all open clients to flush their offline queues
  const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
  for (const client of allClients) {
    client.postMessage({ type: 'FLUSH_OFFLINE_QUEUE' });
  }
}

// ─── Message handler (from app to SW) ────────────────────────────────────────

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data?.type === 'TRIGGER_SYNC') {
    // Attempt to trigger background sync on demand
    if ('sync' in self.registration) {
      self.registration.sync.register('bips-ops-sync').catch(() => {});
    }
  }

  // App can ask SW to show a local notification (for offline alert creation)
  if (event.data?.type === 'SHOW_LOCAL_NOTIFICATION') {
    const { title, body, icon, badge, tag, data } = event.data.payload ?? {};
    self.registration.showNotification(title ?? 'ᗺIPS Ops', {
      body,
      icon: icon ?? '/icons/icon-192.png',
      badge: badge ?? '/icons/icon-192.png',
      tag: tag ?? 'bips-local',
      data,
      requireInteraction: data?.level === 'critical',
      vibrate: data?.level === 'critical' ? [200, 100, 200] : [100],
    });
  }
});
