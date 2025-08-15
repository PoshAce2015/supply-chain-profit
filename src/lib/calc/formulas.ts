import { CalcInput, CalcOutput, Rates } from './types'
import { calcFeesRuleBased, calcFeesActual } from './fees'
import { marginColor, isCommissionMismatch } from './flags'

type FeeMode = 'rule' | 'actual'

export function computeRow(input: CalcInput, rates: Rates, mode: FeeMode = 'rule'): CalcOutput {
  const { sellingPriceINR, buyerShipINR, qty, unit_usd, weight, weightUnit, fx_override } = input
  
  // Use FX override if provided, otherwise use default
  const fx = fx_override || rates.FX
  
  // Convert weight to pounds
  const weightLb = convertToLb(weight, weightUnit)
  
  // 1. Revenue_net = (SellingPrice₹ + BuyerShipping₹) / (1 + GST_sale%)
  const revenue_net = (sellingPriceINR + buyerShipINR) / (1 + rates.GST_sale / 100)
  
  // 2. Calculate fees based on mode
  const fees_breakdown = mode === 'actual' 
    ? calcFeesActual(input, rates)
    : calcFeesRuleBased(input, rates)
  
  const fees_total = fees_breakdown.total
  
  // 3. GST_fees = Fees × GST_on_fees%
  const gst_fees = fees_total * (rates.GST_on_fees / 100)
  
  // 4. TCS = Revenue_net × 1%
  const tcs = revenue_net * 0.01
  
  // 5. Landed cost per unit calculation
  const landed_unit = calculateLandedUnit(unit_usd, fx, weightLb, rates)
  
  // 6. Totals & margin calculation
  const totalRevenue = revenue_net * qty
  const totalCosts = calculateTotalCosts(fees_total, gst_fees, tcs, landed_unit, qty)
  const profit = totalRevenue - totalCosts
  const marginPct = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0
  
  // 7. Generate flags
  const flags = generateFlags(input, rates)
  
  // 8. Calculate margin color and thin margin indicator
  const marginColorResult = marginColor(marginPct)
  const thinMargin = marginPct >= 0 && marginPct < 5
  
  return {
    revenue_net,
    fees_breakdown,
    fees_total,
    gst_fees,
    tcs,
    landed_unit,
    totals: {
      revenue: totalRevenue,
      costs: totalCosts,
      profit,
    },
    profit,
    marginPct,
    flags,
    marginColor: marginColorResult,
    thinMargin,
  }
}

function calculateLandedUnit(unit_usd: number, fx: number, weightLb: number, rates: Rates): number {
  // BaseINR = Unit_USD × FX
  const baseINR = unit_usd * fx
  
  // Freight_unit = weight_lb × 850
  const freight_unit = weightLb * rates.freight.perLb
  
  // Insurance = 0.5% × (BaseINR + Freight_unit)
  const insurance = (baseINR + freight_unit) * (rates.insurance.rate / 100)
  
  // Clearance_unit = Clearance_total/Units_in_shipment
  const clearance_unit = rates.clearance.total / rates.clearance.unitsInShipment
  
  // Assessable = (BaseINR + Freight_unit) + Insurance + Clearance_unit
  const assessable = baseINR + freight_unit + insurance + clearance_unit
  
  // BCD = Assessable × 3%
  const bcd = assessable * (rates.duties.BCD / 100)
  
  // IGST = (Assessable + BCD) × 18%
  const igst = (assessable + bcd) * (rates.duties.IGST / 100)
  
  // Landed_unit = Assessable + BCD + IGST
  return assessable + bcd + igst
}

function calculateTotalCosts(
  fees_total: number,
  gst_fees: number,
  tcs: number,
  landed_unit: number,
  qty: number
): number {
  const landedCosts = landed_unit * qty
  const returnsReserve = 0 // Could be calculated based on rates.reserves.returns
  const overheads = 0 // Could be calculated based on rates.reserves.overheads
  
  return fees_total + gst_fees + tcs + landedCosts + returnsReserve + overheads
}

function generateFlags(input: CalcInput, rates: Rates): string[] {
  const flags: string[] = []
  
  // Commission mismatch flag (if manual commission differs from Keepa by >0.5 pp)
  if (input.commission_mode === 'manual' && input.commission_value !== undefined) {
    const manualPct = input.commission_value
    const keepaPct = rates.referralPercentDefault // Assume this is Keepa-derived
    
    if (isCommissionMismatch(manualPct, keepaPct)) {
      flags.push('Commission Mismatch')
    }
  }
  
  // Battery flag (if applicable)
  if (input.sku.toLowerCase().includes('battery')) {
    flags.push('Battery Product')
  }
  
  return flags
}

function convertToLb(weight: number, unit: string): number {
  switch (unit.toLowerCase()) {
    case 'lb':
      return weight
    case 'oz':
      return weight / 16
    case 'kg':
      return weight * 2.20462
    default:
      return weight // Assume pounds if unknown
  }
}
