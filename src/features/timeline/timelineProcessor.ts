import { addTimelineData } from '../imports/importsSlice';
import { setTimeline } from './timelineSlice';

// Glue-only helpers
const smartDash = /[\u2010\u2011\u2012\u2013\u2014\u2212]/g;
const normDash = (s: string) => s.replace(smartDash, '-');
const normId = (v: unknown) => {
  const s = String(v ?? '').trim();
  return s ? normDash(s) : '';
};

function getOrderId(row: any): string {
  if (!row) return '';
  const raw = row['order-id'] ?? row['Order ID'] ?? row.id ?? '';
  const val = normId(raw);
  if (val && row['order-id'] !== val) {
    row['order-id'] = val;
    delete row['Order ID'];
    delete row.id;
  }
  return row['order-id'] || '';
}

function asWhen(row: any): string | undefined {
  return (
    row?.['purchase-date'] ||
    row?.['order-date'] ||
    row?.date ||
    row?.timestamp ||
    undefined
  );
}

// Deprecated: kept for API compatibility when loading sample CSVs without glue.
// In glue-only mode, this will not cross-link; it will just place events under separate order keys or orphans.
export const processCSVDataForTimeline = (salesData: any[], purchaseData: any[]) => {
  const events: any[] = [];

  // Create simple events without attempting ASIN/quantity matching
  salesData.forEach((salesRecord, idx) => {
    const orderId = getOrderId(salesRecord) || `sales_${idx}`;
    events.push({
      id: `sales_${orderId}_${idx}`,
      category: 'sales' as const,
      orderKey: undefined, // no glue -> orphan
      when: asWhen(salesRecord),
      raw: salesRecord,
    });
  });

  purchaseData.forEach((purchaseRecord, idx) => {
    const orderId = getOrderId(purchaseRecord) || `purchase_${idx}`;
    events.push({
      id: `purchase_${orderId}_${idx}`,
      category: 'purchase' as const,
      orderKey: undefined, // no glue -> orphan
      when: asWhen(purchaseRecord),
      raw: purchaseRecord,
    });
  });

  const byOrder: Record<string, any> = {};
  const orphan: any[] = events;

  return { byOrder, orphan, lastBuildAt: new Date().toISOString() };
};

// Process data from imports slice (for CSV uploads) using glue-only linking
export const processImportsDataForTimeline = (timelineData: any) => {
  if (!timelineData) {
    return { byOrder: {}, orphan: [], lastBuildAt: new Date().toISOString() };
  }

  const salesRows: any[] = Array.isArray(timelineData.sales) ? timelineData.sales : [];
  const purchaseRows: any[] = Array.isArray(timelineData.purchase) ? timelineData.purchase : [];
  const glue: any[] = Array.isArray(timelineData.glue) ? timelineData.glue : [];

  // Index rows by normalized order-id
  const salesById = new Map<string, any[]>();
  for (const r of salesRows) {
    const id = getOrderId(r);
    if (!id) continue;
    (salesById.get(id) ?? salesById.set(id, []).get(id)!).push(r);
  }

  const purchById = new Map<string, any[]>();
  for (const r of purchaseRows) {
    const id = getOrderId(r);
    if (!id) continue;
    (purchById.get(id) ?? purchById.set(id, []).get(id)!).push(r);
  }

  const usedSales = new Set<any>();
  const usedPurch = new Set<any>();

  const byOrder: Record<string, { orderKey: string; events: any[] }> = {};
  const orphan: any[] = [];

  // Build orders from glue links
  for (const link of glue) {
    const sId = normId(link?.salesOrderId);
    const pId = normId(link?.purchaseOrderId);
    if (!sId && !pId) continue;

    const sRows = sId ? (salesById.get(sId) ?? []) : [];
    const pRows = pId ? (purchById.get(pId) ?? []) : [];

    if (!sRows.length && !pRows.length) continue; // ignore links without data

    const orderKey = `${sId || 'NA'}__${pId || 'NA'}`;
    const thread = (byOrder[orderKey] ||= { orderKey, events: [] });

    // Add sales events
    sRows.forEach((row, idx) => {
      usedSales.add(row);
      thread.events.push({
        id: `sales_${sId}_${idx}`,
        category: 'sales' as const,
        orderKey,
        when: asWhen(row),
        raw: row,
      });
    });

    // Add purchase events
    pRows.forEach((row, idx) => {
      usedPurch.add(row);
      thread.events.push({
        id: `purchase_${pId}_${idx}`,
        category: 'purchase' as const,
        orderKey,
        when: asWhen(row),
        raw: row,
      });
    });

    // Sort events by date
    thread.events.sort((a, b) => (a.when || '').localeCompare(b.when || ''));
  }

  // Orphans: remaining unconsumed sales/purchase
  for (const r of salesRows) {
    if (!usedSales.has(r)) {
      orphan.push({
        id: `sales_orphan_${getOrderId(r)}`,
        category: 'sales' as const,
        when: asWhen(r),
        raw: r,
      });
    }
  }

  for (const r of purchaseRows) {
    if (!usedPurch.has(r)) {
      orphan.push({
        id: `purchase_orphan_${getOrderId(r)}`,
        category: 'purchase' as const,
        when: asWhen(r),
        raw: r,
      });
    }
  }

  return { byOrder, orphan, lastBuildAt: new Date().toISOString() };
};
