import Papa from "papaparse";
import { store } from "../app/store";
import { normId, extractASIN, canonHeader } from "./glueNormalize";
import { addTimelineData } from "../features/imports/importsSlice";

// helper to read current imported bins
function getBins() {
  const st = store.getState() as any;
  const bins = st?.imports?.timelineData ?? {};
  return {
    bins,
    sales: Array.isArray(bins.sales) ? bins.sales : [],
    purchase: Array.isArray(bins.purchase) ? bins.purchase : [],
    glue: Array.isArray(bins.glue) ? bins.glue : [],
  };
}

type GlueRow = {
  salesOrderId: string | null;
  purchaseOrderId: string | null;
  asin: string | null;
  raw: Record<string, any>;
};

function dedupeGlue(rows: any[]) {
  const seen = new Set<string>();
  const out: any[] = [];
  for (const r of rows) {
    const key = `${r.salesOrderId}::${r.purchaseOrderId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out;
}

export function downloadGlueTemplate() {
  const csv = [
    "Seller Central Amazon.in,ASIN,Amazon.com",
    "408-4870009-9733125,B08JLTDKHS,112-1815601-9677016",
    "404-8712750-6212352,B08GS74W3K,112-2869753-7173057",
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "International Shipping - Template.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

export async function importInternationalShipping(file: File) {
  const text = await file.text();

  const { data, meta, errors } = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
    transformHeader: (h: string) => h.trim(),
  }) as any;

  const headers: string[] = meta?.fields ?? [];
  const headerMapCanon: Record<string, string> = {};
  headers.forEach(h => {
    const c = canonHeader(h);
    console.log(`Header "${h}" -> canonical "${c}"`);
    if (c) headerMapCanon[c] = h;
  });

  console.log('Header mapping result:', headerMapCanon);
  console.log('Available headers:', headers);

  // Require at least sales or purchase header to be recognized
  const hasSales = !!headerMapCanon["salesOrderId"];
  const hasPurchase = !!headerMapCanon["purchaseOrderId"];
  if (!hasSales && !hasPurchase) {
    return {
      ok: false,
      message: `No valid glue links found. Expected headers like "Seller Central Amazon.in" and "Amazon.com". Found: ${headers.join(', ')}`,
      details: { recognized: headerMapCanon, papaparseErrors: errors },
    };
  }

  const rows: GlueRow[] = [];
  for (const raw of data as Record<string, any>[]) {
    if (!raw || typeof raw !== "object") continue;

    const salesId = hasSales ? normId(raw[headerMapCanon["salesOrderId"]]) : null;
    const purchaseId = hasPurchase ? normId(raw[headerMapCanon["purchaseOrderId"]]) : null;

    // let asin be optional and robust
    const asinSource = headerMapCanon["asin"] ? raw[headerMapCanon["asin"]] : (raw["ASIN"] ?? raw["sku"] ?? raw["Seller SKU"] ?? raw["product-name"]);
    const asin = extractASIN(asinSource);

    if (!salesId && !purchaseId) continue; // totally empty line

    rows.push({ salesOrderId: salesId, purchaseOrderId: purchaseId, asin: asin ?? null, raw });
  }

  if (rows.length === 0) {
    return { ok: false, message: "No valid glue links found — file had no rows with a sales or purchase order id." };
  }

  // Validate against already imported sales/purchase (but don't block)
  const { bins, sales, purchase, glue } = getBins();
  const hasSalesId = new Set(sales.map((r: any) => String(r["order-id"] ?? r["Order ID"] ?? r.id ?? "")));
  const hasPurchaseId = new Set(purchase.map((r: any) => String(r["order-id"] ?? r["Order ID"] ?? r.id ?? "")));

  const prepared = rows.map(r => {
    const salesFound = r.salesOrderId ? hasSalesId.has(r.salesOrderId) : false;
    const purchFound = r.purchaseOrderId ? hasPurchaseId.has(r.purchaseOrderId) : false;
    const status = salesFound && purchFound ? "linked" : (!salesFound && purchFound ? "waiting-sales" : (salesFound && !purchFound ? "waiting-purchase" : "waiting-both"));
    return {
      ...r,
      status,
      source: { kind: "glue:csv", uploadedAt: new Date().toISOString(), fileName: file.name },
    };
  });

  const nextGlue = dedupeGlue([...glue, ...prepared]);
  // write back to state using reducer contract
  store.dispatch(addTimelineData({ category: 'glue', rows: nextGlue }));

  const counts = {
    total: prepared.length,
    linked: prepared.filter(x => x.status === "linked").length,
    waitingSales: prepared.filter(x => x.status === "waiting-sales").length,
    waitingPurchase: prepared.filter(x => x.status === "waiting-purchase").length,
    waitingBoth: prepared.filter(x => x.status === "waiting-both").length,
  };

  return {
    ok: true,
    message: `Imported ${counts.total} glue rows — linked: ${counts.linked} • waiting-sales: ${counts.waitingSales} • waiting-purchase: ${counts.waitingPurchase} • waiting-both: ${counts.waitingBoth}`,
    details: { recognized: headerMapCanon, papaparseErrors: errors, counts },
  };
}
