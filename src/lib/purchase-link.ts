import { normalizeSku, ymd } from './order-key';

export function guessOrderKeyFromPurchase(
  p: any,
  salesByComposite: Map<string, string> // key: `${date}|${sku}|${qty}` -> orderKey
): string | undefined {
  const sku = normalizeSku(p.sku ?? p.SKU ?? p.asin ?? p.ASIN);
  const qty = Number(p.qty ?? p.quantity ?? p.Qty ?? 1) || 1;
  const date = ymd(p.order_date ?? p.purchase_date ?? p.PurchaseDate);
  if (!sku || !date) return undefined;

  // Try date bucket ±1 day
  const candidates = [0, +1, -1].map(delta => {
    const d = new Date(date);
    d.setDate(d.getDate() + delta);
    return d.toISOString().slice(0,10);
  });

  for (const d of candidates) {
    const k = `${d}|${sku}|${qty}`;
    const hit = salesByComposite.get(k);
    if (hit) return hit;
  }
  return undefined;
}
