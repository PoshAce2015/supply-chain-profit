export type ImportCategory =
  | 'sales'
  | 'purchase'
  | 'intl_shipment'
  | 'natl_shipment'
  | 'payment'
  | 'refund'
  | 'cancel';

const AMAZON_ORDER_ID_RE = /(\d{3}-\d{7}-\d{7})/;

export function normalizeAmazonOrderId(raw?: string): string | undefined {
  const s = (raw ?? '').trim();
  if (!s) return;
  const m = s.match(AMAZON_ORDER_ID_RE);
  return m ? m[1] : undefined;
}

export function normalizeSku(raw?: string) {
  return (raw ?? '').trim().toUpperCase() || undefined;
}

export function ymd(dateLike?: string | number | Date) {
  const d = new Date(dateLike ?? Date.now());
  if (Number.isNaN(+d)) return undefined;
  return d.toISOString().slice(0,10);
}

/**
 * Compute a canonical "orderKey" we can use across categories.
 *  - Primary: marketplace-native order id (e.g., Amazon 123-1234567-1234567)
 *  - Fallbacks: our order_no / order_id / reference columns
 */
export function computeOrderKey(row: any, category: ImportCategory): string | undefined {
  // Common candidates across sources (including hyphenated versions)
  const cand = [
    row.orderKey,
    row.order_id, row['order-id'], row.orderId, row.order_no, row.orderNo,
    row.amazon_order_id, row['amazon-order-id'], row.AmazonOrderId,
    row.customer_order_id, row['customer-order-id'], row.CustomerOrderId,
    row.reference, row.Reference,
    row.id, row.ID,
  ].map(v => (v == null ? undefined : String(v)));

  for (const v of cand) {
    const n = normalizeAmazonOrderId(v || '');
    if (n) return n;           // Prefer canonical Amazon id when found
  }

  // If nothing canonical, fall back to first non-empty id-like string
  const first = cand.find(Boolean);
  return first?.trim() || undefined;
}
