import { computeOrderKey, normalizeSku, ymd } from '../../lib/order-key';
import { guessOrderKeyFromPurchase } from '../../lib/purchase-link';
import type { TimelineEvent, TimelineState } from './timelineSlice';

type Buckets = {
  sales: any[];
  purchase: any[];
  intl_shipment: any[];
  natl_shipment: any[];
  payment: any[];
  refund: any[];
  cancel: any[];
};

function getWhen(row: any): string | undefined {
  const dateValue = row.event_time ?? row['event-time'] ?? row.eventTime ?? row.event_at ?? row.EventDate ??
    row.shipped_date ?? row['shipped-date'] ?? row.shipDate ?? 
    row.order_date ?? row['order-date'] ?? row.orderDate ??
    row.purchase_date ?? row['purchase-date'] ?? row.PurchaseDate ?? 
    row.transaction_date ?? row['transaction-date'] ?? row.TransactionDate ??
    row.date ?? row.Date;
  
  if (!dateValue) return undefined;
  
  // If it's already an ISO string, extract the date part
  if (typeof dateValue === 'string' && dateValue.includes('T')) {
    return dateValue.slice(0, 10);
  }
  
  return ymd(dateValue);
}

// Enhanced linking logic for Amazon India sales to Amazon.com purchases
function enhancedPurchaseLinking(purchaseRow: any, salesByComposite: Map<string, string>, salesBySku: Map<string, any[]>): string | undefined {
  const sku = normalizeSku(purchaseRow.sku ?? purchaseRow.SKU ?? purchaseRow.asin ?? purchaseRow.ASIN ?? 
    purchaseRow['product-name'] ?? purchaseRow['item-name']);
  const qty = Number(purchaseRow.qty ?? purchaseRow.quantity ?? purchaseRow.Qty ?? 
    purchaseRow['quantity-purchased'] ?? purchaseRow['item-quantity'] ?? 1) || 1;
  
  // Handle ISO string dates (including hyphenated versions)
  const rawDate = purchaseRow.order_date ?? purchaseRow['order-date'] ?? 
    purchaseRow.purchase_date ?? purchaseRow['purchase-date'] ?? purchaseRow.PurchaseDate;
  const purchaseDate = typeof rawDate === 'string' && rawDate.includes('T') 
    ? rawDate.slice(0, 10) 
    : ymd(rawDate);
  
  if (!sku) return undefined;

  // First try: exact date + sku + qty match
  if (purchaseDate) {
    const exactKey = `${purchaseDate}|${sku}|${qty}`;
    const exactMatch = salesByComposite.get(exactKey);
    if (exactMatch) return exactMatch;
  }

  // Second try: date range ±7 days (since India order comes first, then Amazon.com purchase)
  if (purchaseDate) {
    const candidates = [];
    for (let delta = -7; delta <= 7; delta++) {
      const d = new Date(purchaseDate);
      d.setDate(d.getDate() + delta);
      candidates.push(d.toISOString().slice(0, 10));
    }

    for (const date of candidates) {
      const key = `${date}|${sku}|${qty}`;
      const match = salesByComposite.get(key);
      if (match) return match;
    }
  }

  // Third try: fuzzy matching by SKU only (for cases where quantities don't match exactly)
  const salesWithSku = salesBySku.get(sku);
  if (salesWithSku && salesWithSku.length > 0) {
    // Return the most recent sales order with this SKU
    return salesWithSku[0].orderKey;
  }

  return undefined;
}

export function buildTimeline(allRows: { category: string; rows: any[] }[]): TimelineState {
  console.log('🏗️ Building timeline with input:', allRows.map(r => ({ category: r.category, count: r.rows.length })));
  console.log('🔍 computeOrderKey function available:', typeof computeOrderKey);
  
  const buckets: Buckets = {
    sales: [], purchase: [], intl_shipment: [], natl_shipment: [],
    payment: [], refund: [], cancel: []
  };

  for (const { category, rows } of allRows) {
    const key = category as keyof Buckets;
    if (buckets[key]) {
      buckets[key].push(...rows);
      console.log(`📦 Added ${rows.length} rows to bucket: ${category}`);
    } else {
      console.log(`⚠️ Unknown category: ${category}`);
    }
  }
  
  console.log('📦 Final buckets:', Object.fromEntries(
    Object.entries(buckets).map(([k, v]) => [k, v.length])
  ));

  const events: TimelineEvent[] = [];
  const salesByOrderKey = new Map<string, any>();
  const salesByComposite = new Map<string, string>(); // `${date}|${sku}|${qty}` -> orderKey
  const salesBySku = new Map<string, any[]>(); // sku -> array of sales rows

  // Index sales with enhanced data
  console.log(`🔍 Processing ${buckets.sales.length} sales rows for indexing...`);
  let processedCount = 0;
  let validOrderKeys = 0;
  
  for (const r of buckets.sales) {
    try {
      processedCount++;
      if (processedCount <= 5 || processedCount % 100 === 0) {
        console.log(`🔄 Processing row ${processedCount}/${buckets.sales.length}`);
      }
      
      const orderKey = computeOrderKey(r, 'sales');
      if (!orderKey) {
        console.log('⚠️ No order key for sales row, skipping:', r['order-id'] || 'no order-id');
        continue;
      }
      
      validOrderKeys++;
      if (validOrderKeys <= 5 || validOrderKeys % 100 === 0) {
        console.log('✅ Sales order key:', orderKey);
      }
      
      const salesRow = { ...r, orderKey };
      salesByOrderKey.set(orderKey, salesRow);

      const sku = normalizeSku(r.sku ?? r.SKU ?? r.asin ?? r.ASIN ?? 
        r['product-name'] ?? r['item-name']);
      const qty = Number(r.qty ?? r.quantity ?? r.Qty ?? 
        r['quantity-purchased'] ?? r['item-quantity'] ?? 1) || 1;
      
      // Handle ISO string dates (including hyphenated versions)
      const rawDate = r.order_date ?? r['order-date'] ?? r.orderDate ?? 
        r.purchase_date ?? r['purchase-date'] ?? r.PurchaseDate;
      const date = typeof rawDate === 'string' && rawDate.includes('T') 
        ? rawDate.slice(0, 10) 
        : ymd(rawDate);
      
      if (sku && date) {
        salesByComposite.set(`${date}|${sku}|${qty}`, orderKey);
        
        // Also index by SKU for fuzzy matching
        if (!salesBySku.has(sku)) {
          salesBySku.set(sku, []);
        }
        salesBySku.get(sku)!.push(salesRow);
      }
    } catch (error) {
      console.error(`❌ Error processing sales row ${processedCount}:`, error);
      console.error('Row data:', r);
      // Continue with next row instead of stopping
      continue;
    }
  }
  
  console.log(`📊 Sales processing complete: ${validOrderKeys}/${processedCount} rows had valid order keys`);

  // Sort sales by SKU by date (most recent first) for better matching
  for (const [sku, sales] of salesBySku.entries()) {
    sales.sort((a, b) => {
      const rawDateA = a.order_date ?? a['order-date'] ?? a.orderDate ?? 
        a.purchase_date ?? a['purchase-date'] ?? a.PurchaseDate;
      const rawDateB = b.order_date ?? b['order-date'] ?? b.orderDate ?? 
        b.purchase_date ?? b['purchase-date'] ?? b.PurchaseDate;
      
      const dateA = typeof rawDateA === 'string' && rawDateA.includes('T') 
        ? rawDateA.slice(0, 10) 
        : ymd(rawDateA);
      const dateB = typeof rawDateB === 'string' && rawDateB.includes('T') 
        ? rawDateB.slice(0, 10) 
        : ymd(rawDateB);
        
      return (dateB || '').localeCompare(dateA || '');
    });
  }

  // Create events with enhanced linking
  function push(category: TimelineEvent['category'], r: any) {
    const id = String(r.__id ?? r.id ?? `${category}-${Math.random().toString(36).slice(2)}`);
    const when = getWhen(r);
    let orderKey = computeOrderKey(r, category);
    
    console.log(`🎯 Processing ${category} row for event creation:`, { id, when, orderKey });

    if (!orderKey && category === 'purchase') {
      orderKey = enhancedPurchaseLinking(r, salesByComposite, salesBySku);
      console.log(`🔗 Enhanced linking result for purchase:`, orderKey);
    }

    const event = { id, category, orderKey, when, raw: r };
    events.push(event);
  }

  console.log(`🚀 Creating events from buckets...`);
  (['sales','purchase','intl_shipment','natl_shipment','payment','refund','cancel'] as const)
    .forEach(cat => {
      console.log(`🔄 Processing category: ${cat} (${buckets[cat].length} rows)`);
      let eventCount = 0;
      buckets[cat].forEach((r, index) => {
        push(cat, r);
        eventCount++;

      });
      console.log(`✅ Created ${eventCount} events for ${cat}`);
    });

  console.log(`📋 Total events created: ${events.length}`);

  // Partition by orderKey
  const byOrder: Record<string, { orderKey: string; events: TimelineEvent[] }> = {};
  const orphan: TimelineEvent[] = [];

  console.log(`🗂️ Partitioning ${events.length} events...`);
  for (const e of events) {
    if (!e.orderKey) { 
      orphan.push(e);
      console.log(`👻 Orphan event: ${e.category} - ${e.id}`);
      continue; 
    }
    if (!byOrder[e.orderKey]) {
      byOrder[e.orderKey] = { orderKey: e.orderKey, events: [] };
      console.log(`📂 Created new order group: ${e.orderKey}`);
    }
    byOrder[e.orderKey].events.push(e);
    console.log(`📌 Added event to order ${e.orderKey}: ${e.category}`);
  }

  // Sort each thread
  for (const k of Object.keys(byOrder)) {
    byOrder[k].events.sort((a,b) => (a.when ?? '').localeCompare(b.when ?? ''));
  }

  const result = { byOrder, orphan, lastBuildAt: new Date().toISOString() };
  console.log(`🎯 Timeline build complete:`, {
    orders: Object.keys(byOrder).length,
    orphans: orphan.length,
    totalEvents: events.length
  });

  return result;
}
