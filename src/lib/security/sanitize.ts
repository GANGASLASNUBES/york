const HTML_TAG_RE = /<[^>]*>/g;
const SCRIPT_RE = /<script[\s\S]*?<\/script>/gi;
const EVENT_HANDLER_RE = /on\w+\s*=\s*["'][^"']*["']/gi;
const DANGEROUS_CHARS_RE = /[<>"'`]/g;

const CHAR_ESCAPE: Record<string, string> = {
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '`': '&#x60;',
};

export function sanitizeText(input: string): string {
  let result = input.trim();
  result = result.replace(SCRIPT_RE, '');
  result = result.replace(EVENT_HANDLER_RE, '');
  result = result.replace(HTML_TAG_RE, '');
  result = result.replace(DANGEROUS_CHARS_RE, (char) => CHAR_ESCAPE[char] || char);
  return result;
}

export function sanitizeCoordinate(value: number): number {
  const num = Number(value);
  if (isNaN(num) || !isFinite(num)) return 0;
  return Math.round(num * 1_000_000) / 1_000_000;
}

export function validatePinInput(title: string, description: string): { valid: boolean; error?: string } {
  if (!title || title.trim().length === 0) return { valid: false, error: 'Title is required' };
  if (title.length > 200) return { valid: false, error: 'Title must be under 200 characters' };
  if (description.length > 2000) return { valid: false, error: 'Description must be under 2000 characters' };
  return { valid: true };
}

export function validateMapName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) return { valid: false, error: 'Name is required' };
  if (name.length > 100) return { valid: false, error: 'Name must be under 100 characters' };
  return { valid: true };
}
