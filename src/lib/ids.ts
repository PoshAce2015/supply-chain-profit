// src/lib/ids.ts

/**
 * Normalize an Amazon order ID string.
 * For now: just trims whitespace. No fuzzy matching.
 */
// src/lib/ids.ts

// Amazon order IDs are 17 digits, usually shown as 3-7-7: e.g. 408-4870009-9733125
export function normalizeOrderId(input: unknown): string {
  if (input == null) return '';

  // Trim whitespace first
  const raw = String(input).trim();
  if (!raw) return '';

  // Pull out digits to validate/standardize; preserve case for any callers (not needed here)
  const digits = raw.replace(/\D/g, '');

  // If we have exactly 17 digits, enforce 3-7-7 formatting
  if (digits.length === 17) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 10)}-${digits.slice(10)}`;
  }

  // Otherwise, return the trimmed original (don’t over-normalize)
  return raw;
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
