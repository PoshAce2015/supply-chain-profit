// src/features/imports/importers.ts
import Papa from "papaparse";
import { normalizeOrderId } from "@/lib/ids";
import { parseDateToISO } from "@/lib/dates";
import { timelineStore } from "@/store/timelineStore"; // adjust path if store differs

// Generic CSV parser
function parseCSV(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data as any[]),
      error: (err) => reject(err),
    });
  });
}

// Normalize headers to avoid case/spaces issues
function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, "_");
}

// --- Importers ---
export async function importSales(file: File) {
  const rows = await parseCSV(file);
  const sales = rows.map((r) => ({
    orderId: normalizeOrderId(r["order-id"] || r["orderid"] || r["id"] || ""),
    date: parseDateToISO(r["purchase-date"] || r["date"] || ""),
    raw: r,
  }));

  timelineStore.getState().setSales(sales);
  return sales;
}

export async function importPurchase(file: File) {
  const rows = await parseCSV(file);
  const purchases = rows.map((r) => ({
    orderId: normalizeOrderId(r["order-id"] || r["orderid"] || r["id"] || ""),
    date: parseDateToISO(r["purchase-date"] || r["date"] || ""),
    raw: r,
  }));

  timelineStore.getState().setPurchases(purchases);
  return purchases;
}

export async function importGlue(file: File) {
  const rows = await parseCSV(file);
  const glue = rows.map((r) => ({
    salesOrderId: normalizeOrderId(r["salesOrderId"] || r["sales_order_id"] || ""),
    purchaseOrderId: normalizeOrderId(r["purchaseOrderId"] || r["purchase_order_id"] || ""),
    asin: r["asin"] || r["ASIN"] || null,
    raw: r,
  }));

  timelineStore.getState().setGlue(glue);
  return glue;
}
