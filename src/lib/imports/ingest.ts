// src/lib/imports/ingest.ts
// Purpose: load many import files, preserve all useful columns, drop empty/redundant,
// build a Customer Order Timeline with the branches you want.
// Works in browser or Node (pdf parsing is optional).

import * as Papa from "papaparse";
import dayjs from "dayjs";

// ---------------------------- Types ----------------------------
export type AnyRow = Record<string, unknown>;
export type SourceKind =
  | "amazon_orders_tsv"
  | "amazon_transactions_csv"
  | "amazon_purchase_csv"
  | "international_shipment"
  | "national_shipment"
  | "cancellations_csv"
  | "unknown";

export type EventType =
  | "ORDERED"
  | "SHIPMENT_CREATED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELLED_VENDOR"         // you cancelled (profitability/stock etc.)
  | "CANCELLED_CUSTOMER"       // customer cancelled pre-delivery
  | "REFUND_ISSUED"
  | "PAYMENT_RELEASED"
  | "RETURN_WINDOW_LAPSED";

export type TimelineEvent = {
  orderId: string;
  at: string;                  // ISO string
  type: EventType;
  source: SourceKind;
  amount?: number;             // for payments/refunds
  currency?: string;
  details?: Record<string, unknown>;
};

export type OrderBranch =
  | "paid"                               // Delivered & Paid; no refund
  | "awaiting_payment"                   // Delivered or ordered; no payment yet
  | "delivered_then_refunded"            // Delivered then refund issued
  | "cancelled_predelivery_refunded"     // Cancelled before delivery, refund paid
  | "cancelled_predelivery_pending_refund"
  | "cancelled_after_delivery_refunded"  // Delivered then cancelled + refunded
  | "cancelled_after_delivery_pending_refund"
  | "send_to_fba";                       // return window lapsed, no refund

export type OrderSummary = {
  orderId: string;
  firstSeen: string;
  lastSeen: string;
  branch: OrderBranch;
  paidToDate: number;
  refundedToDate: number;
  delta: number;               // paid - refunded
  flags: string[];             // any anomalies
  source?: {
    channel: 'amazon_in' | 'flipkart' | 'poshace' | 'website' | 'other';
    orderClass?: 'b2b' | 'b2c';
  };
};

export type IngestResult = {
  // "wide tables" that keep as many columns as useful (empty/dup dropped)
  tables: {
    orders: { columns: string[]; rows: AnyRow[] };
    transactions: { columns: string[]; rows: AnyRow[] };
    purchases: { columns: string[]; rows: AnyRow[] };
    intlShipments: { columns: string[]; rows: AnyRow[] };
    natShipments: { columns: string[]; rows: AnyRow[] };
    cancellations: { columns: string[]; rows: AnyRow[] };
  };
  events: TimelineEvent[];     // normalized events (drive the timeline)
  timeline: Record<string, TimelineEvent[]>;   // orderId → events sorted by time
  summaries: OrderSummary[];   // one per order
};

// ---------------------------- Utilities ----------------------------
const toNum = (v: any) => {
  if (v == null || v === "") return 0;
  const s = String(v).trim().replace(/[₹$,]/g, "").replace(/\s+/g, "");
  const neg = /^\(.*\)$/.test(s);
  const n = parseFloat(s.replace(/[()]/g, ""));
  return (neg ? -1 : 1) * (isNaN(n) ? 0 : n);
};

const maskEmail = (s?: string) =>
  !s ? undefined : s.replace(/(.).+(@.+)/, (_m, a, b) => a + "****" + b);

// PII sanitizer: remove/obfuscate personally-identifiable fields.
// IMPORTANT: call this before persisting to your store.
function sanitizePII(row: AnyRow): AnyRow {
  const clone: AnyRow = { ...row };

  // remove typical PII keys if present
  const drop = [
    "buyer-name",
    "recipient-name",
    "ship-name",
    "ship-address-1",
    "ship-address-2",
    "ship-address-3",
    "ship-city",
    "ship-state",
    "ship-postal-code",
    "ship-phone-number",
    "buyer-phone-number",
    "address",
    "name",
    "phone",
  ];
  drop.forEach((k) => { if (k in clone) delete clone[k]; });

  // mask buyer-email style keys
  for (const k of Object.keys(clone)) {
    if (k.toLowerCase().includes("email")) {
      clone[k] = maskEmail(String(clone[k] ?? ""));
    }
  }
  return clone;
}

// CSV/TSV → rows (header:true). Auto-delimiter for .tsv
function parseDelimited(text: string, delimiter?: string): AnyRow[] {
  const { data } = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    delimiter,
  });
  return (data as AnyRow[]).map(sanitizePII);
}

// Given many rows, keep columns that have at least one non-empty value,
// and drop duplicate columns that are 100% identical.
function buildWideTable(rows: AnyRow[]): { columns: string[]; rows: AnyRow[] } {
  if (!rows.length) return { columns: [], rows: [] };

  const keys = Array.from(
    rows.reduce((s, r) => {
      Object.keys(r).forEach((k) => s.add(k));
      return s;
    }, new Set<string>())
  );

  // remove columns that are entirely empty
  const nonEmptyCols = keys.filter((k) =>
    rows.some((r) => r[k] !== undefined && r[k] !== null && String(r[k]).trim() !== "")
  );

  // drop duplicates: columns with identical values across all rows
  const uniqueCols: string[] = [];
  for (const k of nonEmptyCols) {
    const sig = JSON.stringify(rows.map((r) => r[k] ?? null));
    const dupOf = uniqueCols.find((c) =>
      JSON.stringify(rows.map((r) => r[c] ?? null)) === sig
    );
    if (!dupOf) uniqueCols.push(k);
  }

  // project
  const projected = rows.map((r) => {
    const o: AnyRow = {};
    uniqueCols.forEach((k) => (o[k] = r[k]));
    return o;
  });

  return { columns: uniqueCols, rows: projected };
}

// Best-effort source detection by filename + sniffing header keys.
export function detectKind(name: string, sample?: string): SourceKind {
  const n = name.toLowerCase();
  if (/\btransactions\b/.test(n)) return "amazon_transactions_csv";
  if (/\borders\b|\bunshipped\b|\bsales data\b/.test(n)) return "amazon_orders_tsv";
  if (/\bpurchase\b/.test(n)) return "amazon_purchase_csv";
  if (/\bstackry\b|\bcommercial_invoice\b|\binternational\b|\bawb\b/.test(n))
    return "international_shipment";
  if (/\bnational\b|\bcourier\b|\bwaybill\b|\bmanifest\b/.test(n))
    return "national_shipment";
  if (/\bcancel/.test(n)) return "cancellations_csv";

  if (sample) {
    if (sample.includes("order-id") && sample.includes("sku")) return "amazon_orders_tsv";
    if (sample.includes("Transaction type") && sample.includes("Order ID"))
      return "amazon_transactions_csv";
    const s = sample.toLowerCase();
    if (s.includes("order id") && s.includes("order date") && s.includes("asin"))
      return "amazon_purchase_csv";
  }
  return "unknown";
}

// ---------------------------- Parsers → events ----------------------------

// A. Amazon Orders TSV – Order creation
function eventsFromAmazonOrders(rows: AnyRow[]): TimelineEvent[] {
  const out: TimelineEvent[] = [];
  for (const r of rows) {
    const orderId = String(r["order-id"] ?? r["order id"] ?? "").trim();
    if (!orderId) continue;

    // Ordered
    const purchase = String(r["purchase-date"] ?? r["purchase date"] ?? "") || undefined;
    if (purchase) {
      // Extract source information from the row
      let source: any = undefined;
      if (r.source) {
        source = r.source;
      }
      
      out.push({
        orderId,
        at: dayjs(purchase).isValid() ? dayjs(purchase).toISOString() : new Date().toISOString(),
        type: "ORDERED",
        source: "amazon_orders_tsv",
        details: { 
          sku: r["sku"], 
          qty: r["quantity-purchased"] ?? r["quantity"],
          source: source
        },
      });
    }

    // If orders file includes cancellation-reason or is-prime etc., you can add more events here.
  }
  return out;
}

// B. Amazon Transactions CSV – Order Payment / Refund, etc.
function eventsFromAmazonTransactions(rows: AnyRow[]): TimelineEvent[] {
  const out: TimelineEvent[] = [];
  for (const r of rows) {
    const orderId = String(r["Order ID"] ?? r["order-id"] ?? "").trim() || undefined;
    const type = String(r["Transaction type"] ?? "").toLowerCase();
    const status = String(r["Transaction Status"] ?? "").toLowerCase();
    const at = String(r["Date"] ?? "") || undefined;

    if (!at) continue;

    // Payment released
    if (orderId && type.includes("order payment") && status.includes("released")) {
      out.push({
        orderId,
        at: dayjs(at).toISOString(),
        type: "PAYMENT_RELEASED",
        source: "amazon_transactions_csv",
        amount: toNum(r["Total"]),
        details: {
          productCharges: toNum(r["Total product charges"]),
          promotionalRebates: toNum(r["Total promotional rebates"]),
          amazonFees: toNum(r["Amazon fees"]),
          other: toNum(r["Other"]),
        },
      });
    }

    // Refund
    if (orderId && type.includes("refund")) {
      out.push({
        orderId,
        at: dayjs(at).toISOString(),
        type: "REFUND_ISSUED",
        source: "amazon_transactions_csv",
        amount: toNum(r["Total"]),
      });
    }
  }
  return out;
}

// C. International / National shipment files
// Accept arbitrary CSVs; we try to find columns like order id, awb, status, timestamps.
function eventsFromShipment(rows: AnyRow[], source: SourceKind): TimelineEvent[] {
  const out: TimelineEvent[] = [];
  const idKeys = ["Order ID", "order-id", "orderId", "client reference", "reference"];
  const statusKeys = ["status", "Status", "event", "scan", "milestone"];
  const timeKeys = ["date", "Date", "timestamp", "time", "event_time", "delivered_at"];
  const deliveredWords = ["delivered", "delivered to", "pod"];
  const transitWords = ["pickup", "in transit", "received", "handover", "forwarded", "out for delivery"];

  for (const r of rows) {
    const orderId =
      idKeys.map((k) => r[k]).find((v) => v && String(v).trim() !== "") as string | undefined;
    if (!orderId) continue;

    const rawTime =
      timeKeys.map((k) => r[k]).find((v) => v && String(v).trim() !== "") as string | undefined;

    const status =
      (statusKeys
        .map((k) => String(r[k] ?? ""))
        .find((s) => s.trim() !== "") || "")
        .toLowerCase();

    const when = rawTime && dayjs(rawTime).isValid() ? dayjs(rawTime).toISOString() : new Date().toISOString();

    if (deliveredWords.some((w) => status.includes(w))) {
      out.push({ orderId: String(orderId), at: when, type: "DELIVERED", source });
    } else if (transitWords.some((w) => status.includes(w))) {
      out.push({ orderId: String(orderId), at: when, type: "IN_TRANSIT", source });
    } else {
      out.push({ orderId: String(orderId), at: when, type: "SHIPMENT_CREATED", source, details: { status } });
    }
  }
  return out;
}

// D. Cancellations CSV
// Expected columns: orderId, cancelDate, initiator (vendor|customer), reason
function eventsFromCancellations(rows: AnyRow[]): TimelineEvent[] {
  const out: TimelineEvent[] = [];
  for (const r of rows) {
    const orderId = String(r["orderId"] ?? r["Order ID"] ?? "").trim();
    if (!orderId) continue;
    const initiator = String(r["initiator"] ?? r["Initiator"] ?? "").toLowerCase();
    const date = String(r["cancelDate"] ?? r["Date"] ?? r["cancelled_at"] ?? "");
    if (!date) continue;

    out.push({
      orderId,
      at: dayjs(date).toISOString(),
      type: initiator === "customer" ? "CANCELLED_CUSTOMER" : "CANCELLED_VENDOR",
      source: "cancellations_csv",
      details: { reason: r["reason"] ?? r["Reason"] },
    });
  }
  return out;
}

// ---------------------------- Branching logic ----------------------------
type BranchCfg = { returnWindowDays: number };
const defaultCfg: BranchCfg = { returnWindowDays: 30 };

function computeBranch(events: TimelineEvent[], cfg: BranchCfg): OrderBranch {
  const lastOf = (t: EventType) =>
    events
      .filter((e) => e.type === t)
      .sort((a, b) => a.at.localeCompare(b.at))
      .slice(-1)[0];

  const delivered = lastOf("DELIVERED");
  const payment = lastOf("PAYMENT_RELEASED");
  const refund = lastOf("REFUND_ISSUED");
  const cVend = lastOf("CANCELLED_VENDOR");
  const cCust = lastOf("CANCELLED_CUSTOMER");

  if (delivered && refund && dayjs(refund.at).isAfter(delivered.at)) {
    return "cancelled_after_delivery_refunded";
  }
  if (delivered && !payment) return "awaiting_payment";
  if (delivered && payment && !refund) return "paid";
  if (delivered && !refund && payment && dayjs().diff(dayjs(delivered.at), "day") > cfg.returnWindowDays)
    return "send_to_fba";

  // Pre-delivery cancellations
  if (!delivered && cCust && refund) return "cancelled_predelivery_refunded";
  if (!delivered && (cVend || cCust) && !refund) return "cancelled_predelivery_pending_refund";

  // Delivered then cancellation but refund pending:
  if (delivered && (cVend || cCust) && !refund) return "cancelled_after_delivery_pending_refund";

  // Delivered then refunded (fallback)
  if (delivered && refund) return "delivered_then_refunded";

  // Default:
  return payment ? "paid" : "awaiting_payment";
}

// ---------------------------- Public API ----------------------------
export type InFile = { name: string; text?: string; arrayBuffer?: ArrayBuffer };

export async function ingestFiles(files: InFile[], cfg: Partial<BranchCfg> = {}): Promise<IngestResult> {
  const branchCfg = { ...defaultCfg, ...cfg };

  const buckets = {
    orders: [] as AnyRow[],
    transactions: [] as AnyRow[],
    purchases: [] as AnyRow[],
    intl: [] as AnyRow[],
    nat: [] as AnyRow[],
    cancels: [] as AnyRow[],
  };

  for (const f of files) {
    const text =
      f.text ??
      (f.arrayBuffer ? new TextDecoder("utf-8").decode(new Uint8Array(f.arrayBuffer)) : "");

    const kind = detectKind(f.name, text.slice(0, 2048));

    if (kind === "amazon_orders_tsv") {
      buckets.orders.push(...parseDelimited(text, "\t"));
    } else if (kind === "amazon_transactions_csv") {
      buckets.transactions.push(...parseDelimited(text));
    } else if (kind === "amazon_purchase_csv") {
      buckets.purchases.push(...parseDelimited(text));
    } else if (kind === "international_shipment") {
      buckets.intl.push(...parseDelimited(text));
    } else if (kind === "national_shipment") {
      buckets.nat.push(...parseDelimited(text));
    } else if (kind === "cancellations_csv") {
      buckets.cancels.push(...parseDelimited(text));
    } else {
      // Unknown – still parse as CSV; we'll try to make sense in shipments.
      const rows = parseDelimited(text);
      // Guess: treat as shipment-like if it has AWB/status; else append to orders table as raw.
      const hasStatus = rows.some((r) =>
        Object.keys(r).some((k) => /status|scan|event/i.test(k))
      );
      if (hasStatus) buckets.nat.push(...rows);
      else buckets.orders.push(...rows);
    }
  }

  // Build wide tables (drop empty/duplicate columns)
  const ordersTable = buildWideTable(buckets.orders);
  const transactionsTable = buildWideTable(buckets.transactions);
  const purchasesTable = buildWideTable(buckets.purchases);
  const intlTable = buildWideTable(buckets.intl);
  const natTable = buildWideTable(buckets.nat);
  const cancelsTable = buildWideTable(buckets.cancels);

  // Events
  const events: TimelineEvent[] = [
    ...eventsFromAmazonOrders(ordersTable.rows),
    ...eventsFromAmazonTransactions(transactionsTable.rows),
    ...eventsFromShipment(intlTable.rows, "international_shipment"),
    ...eventsFromShipment(natTable.rows, "national_shipment"),
    ...eventsFromCancellations(cancelsTable.rows),
  ];

  // Group per order + sort
  const byOrder: Record<string, TimelineEvent[]> = {};
  for (const e of events) {
    if (!e.orderId) continue;
    (byOrder[e.orderId] ||= []).push(e);
  }
  Object.values(byOrder).forEach((arr) => arr.sort((a, b) => a.at.localeCompare(b.at)));

  // Summaries
  const summaries: OrderSummary[] = Object.entries(byOrder).map(([orderId, es]) => {
    const firstSeen = es[0]?.at ?? new Date().toISOString();
    const lastSeen = es.length > 0 ? es[es.length - 1].at : firstSeen;
    const branch = computeBranch(es, branchCfg);

    const paidToDate = es
      .filter((e) => e.type === "PAYMENT_RELEASED")
      .reduce((s, e) => s + (e.amount ?? 0), 0);

    const refundedToDate = es
      .filter((e) => e.type === "REFUND_ISSUED")
      .reduce((s, e) => s + (e.amount ?? 0), 0);

    const flags: string[] = [];
    if (paidToDate !== 0 && Math.abs(paidToDate) < 0.01) flags.push("tiny_payment");
    if (refundedToDate !== 0 && Math.abs(refundedToDate) < 0.01) flags.push("tiny_refund");

    // Extract source information from order data
    let source: OrderSummary['source'] | undefined;
    const orderEvent = es.find(e => e.type === 'ORDERED');
    if (orderEvent && orderEvent.details?.source) {
      const rawSource = orderEvent.details.source;
      if (typeof rawSource === 'object' && rawSource !== null) {
        const src = rawSource as any;
        if (src.channel && ['amazon_in', 'flipkart', 'poshace', 'website', 'other'].includes(src.channel)) {
          const orderClass = src.orderClass && ['b2b', 'b2c'].includes(src.orderClass) ? src.orderClass : undefined;
          source = {
            channel: src.channel,
            ...(orderClass && { orderClass })
          };
        }
      } else if (typeof rawSource === 'string') {
        // Handle legacy combined strings like "flipkart_b2b"
        const low = rawSource.toLowerCase();
        if (low.startsWith('flipkart')) {
          const orderClass = low.includes('b2b') ? 'b2b' : low.includes('b2c') ? 'b2c' : undefined;
          source = {
            channel: 'flipkart',
            ...(orderClass && { orderClass })
          };
        } else if (low.startsWith('amazon')) {
          const orderClass = low.includes('b2b') ? 'b2b' : low.includes('b2c') ? 'b2c' : undefined;
          source = {
            channel: 'amazon_in',
            ...(orderClass && { orderClass })
          };
        } else if (low.startsWith('poshace')) {
          const orderClass = low.includes('b2b') ? 'b2b' : low.includes('b2c') ? 'b2c' : undefined;
          source = {
            channel: 'poshace',
            ...(orderClass && { orderClass })
          };
        } else if (low.startsWith('website')) {
          const orderClass = low.includes('b2b') ? 'b2b' : low.includes('b2c') ? 'b2c' : undefined;
          source = {
            channel: 'website',
            ...(orderClass && { orderClass })
          };
        } else {
          source = {
            channel: 'other'
          };
        }
      }
    }

    const summary: OrderSummary = {
      orderId,
      firstSeen,
      lastSeen,
      branch,
      paidToDate: Number(paidToDate.toFixed(2)),
      refundedToDate: Number(refundedToDate.toFixed(2)),
      delta: Number((paidToDate - refundedToDate).toFixed(2)),
      flags,
    };

    // Only add source if it exists
    if (source) {
      summary.source = source;
    }

    return summary;
  });

  return {
    tables: {
      orders: ordersTable,
      transactions: transactionsTable,
      purchases: purchasesTable,
      intlShipments: intlTable,
      natShipments: natTable,
      cancellations: cancelsTable,
    },
    events,
    timeline: byOrder,
    summaries,
  };
}
