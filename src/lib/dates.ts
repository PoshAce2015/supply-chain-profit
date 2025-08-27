// src/lib/dates.ts

/**
 * Parse a raw date string into ISO format YYYY-MM-DD.
 * Supported formats:
 * - YYYY-MM-DD
 * - MM/DD/YYYY
 * - MMDDYYYY
 * - MMDDYY (with 50-year pivot)
 * If invalid, returns "—".
 */
export function parseDateToISO(raw: string): string {
  if (!raw) return "—";

  const str = raw.trim();

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

  // MM/DD/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
    const [m, d, y] = str.split("/");
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  // MMDDYYYY or MMDDYY
  if (/^\d{6,8}$/.test(str)) {
    const m = str.slice(0, 2);
    const d = str.slice(2, 4);
    let y = str.slice(4);
    if (y.length === 2) {
      const pivot = 50; // 50-year pivot
      const yy = parseInt(y, 10);
      const century = yy <= pivot ? "20" : "19";
      y = century + y;
    }
    return `${y}-${m}-${d}`;
  }

  return "—"; // if unrecognized
}
