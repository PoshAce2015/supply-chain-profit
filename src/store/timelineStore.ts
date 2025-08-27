// src/store/timelineStore.ts
import { create } from "zustand";

interface Order {
  orderId: string;
  date: string;
  raw: any;
}

interface GlueLink {
  salesOrderId: string;
  purchaseOrderId: string;
  asin?: string | null;
  raw: any;
}

interface TimelineState {
  sales: Order[];
  purchases: Order[];
  glue: GlueLink[];
  setSales: (sales: Order[]) => void;
  setPurchases: (purchases: Order[]) => void;
  setGlue: (glue: GlueLink[]) => void;
  clearAll: () => void;
}

export const timelineStore = create<TimelineState>((set) => ({
  sales: [],
  purchases: [],
  glue: [],
  setSales: (sales) => set({ sales }),
  setPurchases: (purchases) => set({ purchases }),
  setGlue: (glue) => set({ glue }),
  clearAll: () => set({ sales: [], purchases: [], glue: [] }),
}));
