export type LinkHint = {
  salesOrderId: string;        // e.g. 408-4870009-9733125
  purchaseOrderId: string;     // e.g. 112-1815601-9677016
  asin?: string | null;        // optional; helpful but not required
  source?: {                   // provenance
    category: 'international-shipping' | 'manual';
    fileName?: string;
    uploadedAt?: string;
  };
};
