import { Rates } from './types'

export function getDefaultRates(): Rates {
  return {
    GST_sale: 18, // 18% GST on sales
    GST_on_fees: 18, // 18% GST on fees
    FX: 84, // USD to INR exchange rate
    referralPercentDefault: 15, // Default referral percentage
    fixedFees: {
      closing: 40, // Closing fee in INR
      pickPack: 20, // Pick and pack fee in INR
      weightHandling: 850, // Weight handling fee per lb in INR
      lastMile: 60, // Last mile delivery fee in INR
    },
    BatteryExtraDays: 7, // Extra days for battery products
    clearance: {
      total: 5000, // Total clearance cost in INR
      unitsInShipment: 100, // Number of units in shipment
    },
    freight: {
      perLb: 850, // Freight cost per pound in INR
    },
    insurance: {
      rate: 0.5, // Insurance rate (0.5%)
    },
    duties: {
      BCD: 3, // Basic Customs Duty (3%)
      IGST: 18, // Integrated GST (18%)
    },
    reserves: {
      returns: 2, // Returns reserve (2%)
      overheads: 1, // Overheads (1%)
    },
  }
}
