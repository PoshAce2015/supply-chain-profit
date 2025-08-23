// Robust normalizers for glue import & matching
export const smartDash = /[\u2010\u2011\u2012\u2013\u2014\u2212]/g; // hyphen/minus/figure/en/em
export function normDash(s: string) { return s.replace(smartDash, "-"); }
export function normId(v: unknown) {
  const s = String(v ?? "").trim();
  return normDash(s);
}

export function extractASIN(v: unknown): string | null {
  if (v == null) return null;
  const s = String(v).toUpperCase();
  const all = s.match(/[A-Z0-9]{10}/g);
  if (!all) return null;
  const b0 = all.find(t => t.startsWith("B0"));
  return (b0 ?? all[all.length - 1]) ?? null;
}

export function cleanHeader(h: string) {
  return h.toLowerCase()
    .replace(/\./g, "")     // dots
    .replace(/\s+/g, "")    // spaces
    .replace(/-/g, "");     // ASCII dash
}

export type Canon = "salesOrderId" | "purchaseOrderId" | "asin";

const headerMap: Record<string, Canon> = {
  // sales order id
  "sellercentralamazonin":"salesOrderId",
  "sellercentral":"salesOrderId",
  "sellercentralorderid":"salesOrderId",
  "orderid":"salesOrderId",
  "order-id":"salesOrderId",
  "salesorderid":"salesOrderId",
  "salesid":"salesOrderId",
  // purchase order id
  "amazoncom":"purchaseOrderId",
  "amazoncomorderid":"purchaseOrderId",
  "purchaseorderid":"purchaseOrderId",
  "purchase-id":"purchaseOrderId",
  "po":"purchaseOrderId",
  "poid":"purchaseOrderId",
  // asin/sku
  "asin":"asin",
  "sku":"asin",
  "sellersku":"asin",
  "productname":"asin",
};

export function canonHeader(h: string): Canon | null {
  const k = cleanHeader(h);
  return headerMap[k] ?? null;
}
