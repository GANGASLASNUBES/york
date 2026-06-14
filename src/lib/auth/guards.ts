import type { Session } from '@supabase/supabase-js';

export function requireAuth(session: Session | null): { allowed: boolean; redirect?: string } {
  if (!session) return { allowed: false, redirect: '/auth/login' };
  return { allowed: true };
}

export function requireAdmin(session: Session | null): { allowed: boolean; redirect?: string } {
  if (!session) return { allowed: false, redirect: '/auth/login' };
  const role = session.user?.app_metadata?.role ?? session.user?.user_metadata?.role;
  if (role !== 'admin') return { allowed: false, redirect: '/' };
  return { allowed: true };
}

export function isAuthenticated(session: Session | null): boolean {
  return !!session;
}

export function isAdmin(session: Session | null): boolean {
  if (!session) return false;
  const role = session.user?.app_metadata?.role ?? session.user?.user_metadata?.role;
  return role === 'admin';
}
