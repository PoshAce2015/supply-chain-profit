// src/lib/ids.ts

/**
 * Normalize an Amazon order ID string.
 * For now: just trims whitespace. No fuzzy matching.
 */
export function normalizeOrderId(raw: string): string {
  if (!raw) return "";
  return raw.trim();
}

/**
 * Extracts a 10-character ASIN from a string if present.
 * Not used for linking, but kept for future.
 */
export function extractASIN(raw: string): string {
  if (!raw) return "";
  const asinMatch = raw.match(/\b([A-Z0-9]{10})\b/);
  return asinMatch ? asinMatch[1] : "";
}
