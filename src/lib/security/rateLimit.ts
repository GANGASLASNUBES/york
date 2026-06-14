type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

type RateLimitConfig = {
  maxRequests: number;
  windowMs: number;
};

const LIMITS: Record<string, RateLimitConfig> = {
  'pin:create': { maxRequests: 10, windowMs: 60_000 },
  'pin:delete': { maxRequests: 10, windowMs: 60_000 },
  'alert:update': { maxRequests: 20, windowMs: 60_000 },
  'map:create': { maxRequests: 5, windowMs: 60_000 },
  'trail:create': { maxRequests: 5, windowMs: 60_000 },
};

export function checkRateLimit(userId: string, action: string): { allowed: boolean; retryAfterMs?: number } {
  const config = LIMITS[action];
  if (!config) return { allowed: true };

  const key = `${userId}:${action}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true };
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count++;
  return { allowed: true };
}

export function getRateLimitError(retryAfterMs: number): string {
  const seconds = Math.ceil(retryAfterMs / 1000);
  return `Rate limit exceeded. Please try again in ${seconds} second${seconds === 1 ? '' : 's'}.`;
}
