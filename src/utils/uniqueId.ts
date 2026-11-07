export function generateId(prefix: string = 'ID'): string {
  try {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return `${prefix}-${crypto.randomUUID()}`;
    }
  } catch {}
  return `${prefix}-${Math.random().toString(36).substring(2, 10)}-${Date.now().toString(36)}`;
}
