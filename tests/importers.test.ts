// tests/importers.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { importSales, importPurchase, importGlue } from "@/features/imports/importers";
import { timelineStore } from "@/store/timelineStore";

function makeFile(content: string, name = "test.csv") {
  return new File([content], name, { type: "text/csv" });
}

beforeEach(() => {
  timelineStore.getState().clearAll();
});

describe("importers", () => {
  it("imports sales CSV", async () => {
    const file = makeFile(`order-id,purchase-date
408-4870009-9733125,2025-08-01`);
    await importSales(file);

    const state = timelineStore.getState();
    expect(state.sales.length).toBe(1);
    expect(state.sales[0].orderId).toBe("408-48700099733125");
    expect(state.sales[0].date).toBe("2025-08-01");
  });

  it("imports purchase CSV", async () => {
    const file = makeFile(`order-id,purchase-date
112-1815601-9677016,2025-08-18`);
    await importPurchase(file);

    const state = timelineStore.getState();
    expect(state.purchases.length).toBe(1);
    expect(state.purchases[0].orderId).toBe("112-18156019677016");
    expect(state.purchases[0].date).toBe("2025-08-18");
  });

  it("imports glue CSV", async () => {
    const file = makeFile(`salesOrderId,purchaseOrderId,asin
408-4870009-9733125,112-1815601-9677016,B0C123XYZ`);
    await importGlue(file);

    const state = timelineStore.getState();
    expect(state.glue.length).toBe(1);
    expect(state.glue[0].salesOrderId).toBe("408-48700099733125");
    expect(state.glue[0].purchaseOrderId).toBe("112-18156019677016");
    expect(state.glue[0].asin).toBe("B0C123XYZ");
  });
});
