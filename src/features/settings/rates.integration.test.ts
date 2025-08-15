import { describe, it, expect } from 'vitest'
import { computeRow } from '../../lib/calc/formulas'
import { getDefaultRates } from '../../lib/calc/defaults'
import { CalcInput } from '../../lib/calc/types'

describe('Settings Rates Integration', () => {
  it('should recompute with different FX rates', () => {
    const baseRates = getDefaultRates()
    const highFXRates = { ...baseRates, FX: 90 }
    const lowFXRates = { ...baseRates, FX: 75 }
    
    const calcInput: CalcInput = {
      asin: 'B123',
      sku: 'SKU123',
      qty: 1,
      sellingPriceINR: 1000,
      buyerShipINR: 0,
      channel: 'FBA',
      weight: 1,
      weightUnit: 'lb',
      unit_usd: 10
    }
    
    const baseResult = computeRow(calcInput, baseRates, 'rule')
    const highFXResult = computeRow(calcInput, highFXRates, 'rule')
    const lowFXResult = computeRow(calcInput, lowFXRates, 'rule')
    
    // Higher FX should result in higher landed costs and lower profit
    expect(highFXResult.landed_unit).toBeGreaterThan(baseResult.landed_unit)
    expect(highFXResult.profit).toBeLessThan(baseResult.profit)
    
    // Lower FX should result in lower landed costs and higher profit
    expect(lowFXResult.landed_unit).toBeLessThan(baseResult.landed_unit)
    expect(lowFXResult.profit).toBeGreaterThan(baseResult.profit)
  })
  
  it('should recompute with different GST rates', () => {
    const baseRates = getDefaultRates()
    const highGSTRates = { ...baseRates, GST_sale: 28 }
    const lowGSTRates = { ...baseRates, GST_sale: 12 }
    
    const calcInput: CalcInput = {
      asin: 'B123',
      sku: 'SKU123',
      qty: 1,
      sellingPriceINR: 1000,
      buyerShipINR: 0,
      channel: 'FBA',
      weight: 1,
      weightUnit: 'lb',
      unit_usd: 10
    }
    
    const baseResult = computeRow(calcInput, baseRates, 'rule')
    const highGSTResult = computeRow(calcInput, highGSTRates, 'rule')
    const lowGSTResult = computeRow(calcInput, lowGSTRates, 'rule')
    
    // Higher GST should result in lower revenue_net
    expect(highGSTResult.revenue_net).toBeLessThan(baseResult.revenue_net)
    
    // Lower GST should result in higher revenue_net
    expect(lowGSTResult.revenue_net).toBeGreaterThan(baseResult.revenue_net)
  })
})
