// Calculator rates and settings
export interface Rates {
  GST_sale: number // GST rate on sales (e.g., 18%)
  GST_on_fees: number // GST rate on fees (e.g., 18%)
  FX: number // Exchange rate USD to INR (e.g., 84)
  referralPercentDefault: number // Default referral percentage
  fixedFees: {
    closing: number
    pickPack: number
    weightHandling: number
    lastMile: number
  }
  BatteryExtraDays: number // Extra days for battery products
  clearance: {
    total: number
    unitsInShipment: number
  }
  freight: {
    perLb: number // Freight cost per pound (e.g., 850 INR)
  }
  insurance: {
    rate: number // Insurance rate (e.g., 0.5%)
  }
  duties: {
    BCD: number // Basic Customs Duty (e.g., 3%)
    IGST: number // Integrated GST (e.g., 18%)
  }
  reserves: {
    returns: number // Returns reserve percentage
    overheads: number // Overheads percentage
  }
}

// Input data for calculations (subset of Order + Product + USPO)
export interface CalcInput {
  asin: string
  sku: string
  qty: number
  sellingPriceINR: number
  buyerShipINR: number
  commission_value?: number // Manual commission from India Listings
  commission_mode?: 'manual' | 'keepa'
  channel: 'FBA' | 'FBM'
  weight: number
  weightUnit: 'oz' | 'lb' | 'kg'
  unit_usd: number
  fx_override?: number // Optional FX override
}

// Calculation output
export interface CalcOutput {
  // Per-unit calculations
  revenue_net: number
  fees_breakdown: {
    referral: number
    closing: number
    pickPack?: number
    weightHandling?: number
    lastMile?: number
    total: number
  }
  fees_total: number
  gst_fees: number
  tcs: number
  landed_unit: number
  
  // Aggregate calculations
  totals: {
    revenue: number
    costs: number
    profit: number
  }
  profit: number
  marginPct: number
  
  // Flags and indicators
  flags: string[]
  marginColor: 'green' | 'yellow' | 'red'
  thinMargin: boolean
}
