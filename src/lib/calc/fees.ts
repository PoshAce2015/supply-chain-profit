import { CalcInput, Rates } from './types'

export interface FeeBreakdown {
  referral: number
  closing: number
  pickPack?: number
  weightHandling?: number
  lastMile?: number
  total: number
}

// Rule-based fees calculation
export function calcFeesRuleBased(input: CalcInput, rates: Rates): FeeBreakdown {
  const { sellingPriceINR, channel, weight, weightUnit } = input
  
  // Convert weight to pounds
  const weightLb = convertToLb(weight, weightUnit)
  
  // Calculate referral fee (use manual commission if available, otherwise default)
  const referralPercent = input.commission_value || rates.referralPercentDefault
  const referral = (sellingPriceINR * referralPercent) / 100
  
  // Calculate fixed fees based on channel
  if (channel === 'FBA') {
    const closing = rates.fixedFees.closing
    const pickPack = rates.fixedFees.pickPack
    const weightHandling = weightLb * rates.fixedFees.weightHandling
    
    return {
      referral,
      closing,
      pickPack,
      weightHandling,
      total: referral + closing + pickPack + weightHandling,
    }
  } else {
    // FBM
    const closing = rates.fixedFees.closing
    const lastMile = rates.fixedFees.lastMile
    
    return {
      referral,
      closing,
      lastMile,
      total: referral + closing + lastMile,
    }
  }
}

// Actual fees calculation (same as rule-based for now, but can be extended)
export function calcFeesActual(input: CalcInput, rates: Rates): FeeBreakdown {
  // For now, use rule-based calculation
  // In the future, this could use actual fee data from the input
  return calcFeesRuleBased(input, rates)
}

// Helper function to convert weight to pounds
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
