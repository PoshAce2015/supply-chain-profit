export type PurchaseVendorId =
  | 'amazon_com'
  | 'walmart_com'
  | 'ebay_com'
  | 'newegg_com'
  | 'custom';

export interface PurchaseSource {
  vendor: PurchaseVendorId;
  /** lowercased domain only when vendor==='custom' (e.g., "bhphotovideo.com") */
  domain?: string;
}

export const PURCHASE_VENDOR_LABELS: Record<PurchaseVendorId, string> = {
  amazon_com: 'Amazon.com',
  walmart_com: 'Walmart.com',
  ebay_com: 'eBay.com',
  newegg_com: 'Newegg.com',
  custom: 'Custom (enter domain)'
};

export function normalizeDomain(input: string): string | undefined {
  if (!input) return undefined;
  const trimmed = input.trim().toLowerCase();
  // Accept domain, or URL like https://store.example.com/path
  try {
    const asUrl = trimmed.includes('://') ? new URL(trimmed) : new URL('https://' + trimmed);
    // Return hostname only (strip www.)
    return asUrl.hostname.replace(/^www\./, '');
  } catch {
    // simple fallback: allow basic domain-ish strings
    if (/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(trimmed)) return trimmed.replace(/^www\./, '').toLowerCase();
    return undefined;
  }
}
