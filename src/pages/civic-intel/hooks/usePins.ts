import { useState, useCallback } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { checkRateLimit, getRateLimitError } from '../../../lib/security/rateLimit';
import { sanitizeText, sanitizeCoordinate, validatePinInput } from '../../../lib/security/sanitize';
import { logAuditEvent } from '../../../lib/security/auditLog';

export type PinType = 'public' | 'private' | 'gear' | 'story';
export type PinSeverity = 'green' | 'amber' | 'red' | null;

export type CivicPin = {
  id: string;
  lat: number;
  lng: number;
  title: string;
  description: string;
  category: string;
  type: PinType;
  severity: PinSeverity;
  userId: string | null;
  createdAt: string;
};

export function usePins() {
  const { user, isAuthenticated } = useAuth();
  const [pins, setPins] = useState<CivicPin[]>([]);
  const [error, setError] = useState<string | null>(null);

  const createPin = useCallback(async (data: {
    lat: number;
    lng: number;
    title: string;
    description: string;
    category: string;
    type: PinType;
    severity: PinSeverity;
  }) => {
    setError(null);

    if (!isAuthenticated || !user) {
      setError('You must be signed in to create pins');
      return false;
    }

    const validation = validatePinInput(data.title, data.description);
    if (!validation.valid) {
      setError(validation.error || 'Invalid input');
      return false;
    }

    const rateCheck = checkRateLimit(user.id, 'pin:create');
    if (!rateCheck.allowed) {
      setError(getRateLimitError(rateCheck.retryAfterMs!));
      return false;
    }

    const sanitizedPin: CivicPin = {
      id: crypto.randomUUID(),
      lat: sanitizeCoordinate(data.lat),
      lng: sanitizeCoordinate(data.lng),
      title: sanitizeText(data.title),
      description: sanitizeText(data.description),
      category: sanitizeText(data.category),
      type: data.type,
      severity: data.severity,
      userId: user.id,
      createdAt: new Date().toISOString(),
    };

    setPins((prev) => [...prev, sanitizedPin]);

    await logAuditEvent(user.id, 'pin:create', {
      pinId: sanitizedPin.id,
      category: sanitizedPin.category,
      type: sanitizedPin.type,
    }, 'pin', sanitizedPin.id);

    return true;
  }, [user, isAuthenticated]);

  const deletePin = useCallback(async (pinId: string) => {
    if (!user) return false;

    const pin = pins.find((p) => p.id === pinId);
    if (!pin || pin.userId !== user.id) {
      setError('You can only delete your own pins');
      return false;
    }

    const rateCheck = checkRateLimit(user.id, 'pin:delete');
    if (!rateCheck.allowed) {
      setError(getRateLimitError(rateCheck.retryAfterMs!));
      return false;
    }

    setPins((prev) => prev.filter((p) => p.id !== pinId));

    await logAuditEvent(user.id, 'pin:delete', { pinId }, 'pin', pinId);
    return true;
  }, [user, pins]);

  const getVisiblePins = useCallback((): CivicPin[] => {
    if (!isAuthenticated) {
      return pins.filter((p) => p.type === 'public');
    }
    return pins.filter((p) => p.type === 'public' || p.userId === user?.id);
  }, [pins, isAuthenticated, user]);

  return { pins: getVisiblePins(), allPins: pins, createPin, deletePin, error, clearError: () => setError(null) };
}
