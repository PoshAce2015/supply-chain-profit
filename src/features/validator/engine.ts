import { ValidatorInputRow, ValidationIssue, ValidationResult } from './types'
import { getDefaultRates } from '../../lib/calc/defaults'

export function validateRows(
  rows: ValidatorInputRow[],
  opts?: {
    gstOnFeesPct?: number // default 0.18
    referralWindows?: Record<string, { min: number; max: number }> // by category
  }
): ValidationResult[] {
  const rates = getDefaultRates()
  const gstOnFeesPct = opts?.gstOnFeesPct ?? 0.18
  const referralWindows = opts?.referralWindows ?? {
    Electronics: { min: 0.05, max: 0.12 },
    Books: { min: 0.15, max: 0.25 },
    Clothing: { min: 0.12, max: 0.20 }
  }
  
  return rows.map(row => {
    const issues: ValidationIssue[] = []
    
    // Calculate Revenue_net
    const sellingPriceINR = row.sellingPriceINR || 0
    const buyerShipINR = row.buyerShipINR || 0
    const revenueNet = (sellingPriceINR + buyerShipINR) / (1 + rates.GST_sale / 100)
    
    // Rule 1: Sales consistency
    if (row.netProceedsINR !== undefined && row.actualFeesINR !== undefined && row.gstOnFeesINR !== undefined) {
      const expectedNet = revenueNet - (row.actualFeesINR + row.gstOnFeesINR + revenueNet * 0.01) // TCS = 1%
      const delta = Math.abs(row.netProceedsINR - expectedNet) / expectedNet
      
      if (delta > 0.015) { // > 1.5%
        issues.push({
          code: 'sales_consistency',
          severity: 'error',
          message: `Net proceeds mismatch: expected ₹${Math.round(expectedNet)}, got ₹${row.netProceedsINR} (${Math.round(delta * 100)}% off)`
        })
      }
    }
    
    // Rule 2: Fees composition
    if (row.actualFeesINR !== undefined && row.referralPercent !== undefined) {
      const expectedReferral = (row.referralPercent / 100) * revenueNet
      const referralDelta = Math.abs(row.actualFeesINR - expectedReferral) / expectedReferral
      
      if (referralDelta > 0.10) { // > 10%
        issues.push({
          code: 'fees_composition',
          severity: 'warn',
          message: `Fees composition mismatch: expected referral ₹${Math.round(expectedReferral)}, got ₹${row.actualFeesINR} (${Math.round(referralDelta * 100)}% off)`
        })
      }
    }
    
    // Rule 3: GST on fees
    if (row.gstOnFeesINR !== undefined && row.actualFeesINR !== undefined) {
      const expectedGstOnFees = row.actualFeesINR * gstOnFeesPct
      const gstDelta = Math.abs(row.gstOnFeesINR - expectedGstOnFees) / expectedGstOnFees
      
      if (gstDelta > 0.08) { // > 8%
        issues.push({
          code: 'gst_on_fees',
          severity: 'warn',
          message: `GST on fees mismatch: expected ₹${Math.round(expectedGstOnFees)}, got ₹${row.gstOnFeesINR} (${Math.round(gstDelta * 100)}% off)`
        })
      }
    }
    
    // Rule 4: Referral window
    if (row.category && row.referralPercent !== undefined) {
      const window = referralWindows[row.category]
      if (window) {
        const referralPct = row.referralPercent / 100
        if (referralPct < window.min || referralPct > window.max) {
          issues.push({
            code: 'referral_window',
            severity: 'error',
            message: `Referral % ${row.referralPercent}% outside expected range [${Math.round(window.min * 100)}%, ${Math.round(window.max * 100)}%] for ${row.category}`
          })
        }
      }
    } else if (row.category && row.referralPercent === undefined) {
      issues.push({
        code: 'referral_window',
        severity: 'warn',
        message: `Missing referral % for category ${row.category}`
      })
    }
    
    // Rule 5: Thin margin indicator
    if (row.netProceedsINR !== undefined && row.sellingPriceINR) {
      const marginPct = (row.netProceedsINR / row.sellingPriceINR) * 100
      if (marginPct >= 0 && marginPct < 5) {
        issues.push({
          code: 'thin_margin_indicator',
          severity: 'info',
          message: `Thin margin: ${Math.round(marginPct * 100) / 100}%`
        })
      }
    }
    
    return {
      ...row,
      issues
    }
  })
}
