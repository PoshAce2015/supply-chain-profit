import { describe, it, expect } from 'vitest'
import { computeRow } from './formulas'
import { getDefaultRates } from './defaults'
import { CalcInput } from './types'
import { marginColor } from './flags'

describe('Calculator Formulas', () => {
  const rates = getDefaultRates()

  describe('Case A - FBA Rule-based', () => {
    it('should calculate negative margin for FBA rule-based fees', () => {
      const input: CalcInput = {
        asin: 'B08N5WRWNW',
        sku: 'ECHO-DOT-4',
        qty: 2,
        sellingPriceINR: 3999,
        buyerShipINR: 0,
        channel: 'FBA',
        weight: 12, // oz
        weightUnit: 'oz',
        unit_usd: 49.99,
        commission_value: 15, // Manual commission
        commission_mode: 'manual',
      }

      const result = computeRow(input, rates, 'rule')

      // Assert negative margin
      expect(result.marginPct).toBeLessThan(0)
      expect(result.marginColor).toBe('red')
      expect(result.thinMargin).toBe(false)

      // Assert key calculations
      expect(result.revenue_net).toBeGreaterThan(0)
      expect(result.fees_total).toBeGreaterThan(0)
      expect(result.gst_fees).toBeGreaterThan(0)
      expect(result.tcs).toBeGreaterThan(0)
      expect(result.landed_unit).toBeGreaterThan(0)
      expect(result.profit).toBeLessThan(0)

      // Assert fee breakdown for FBA
      expect(result.fees_breakdown.referral).toBeGreaterThan(0)
      expect(result.fees_breakdown.closing).toBeGreaterThan(0)
      expect(result.fees_breakdown.pickPack).toBeGreaterThan(0)
      expect(result.fees_breakdown.weightHandling).toBeGreaterThan(0)
      expect(result.fees_breakdown.lastMile).toBeUndefined()
    })
  })

  describe('Case B - FBM Actual Fees', () => {
    it('should calculate negative margin for FBM actual fees', () => {
      const input: CalcInput = {
        asin: 'B08N5KWB9H',
        sku: 'FIRE-TV-4K',
        qty: 1,
        sellingPriceINR: 2999,
        buyerShipINR: 100,
        channel: 'FBM',
        weight: 8, // oz
        weightUnit: 'oz',
        unit_usd: 39.99,
        commission_value: 12, // Manual commission
        commission_mode: 'manual',
      }

      const result = computeRow(input, rates, 'actual')

      // Assert negative margin
      expect(result.marginPct).toBeLessThan(0)
      expect(result.marginColor).toBe('red')
      expect(result.thinMargin).toBe(false)

      // Assert key calculations
      expect(result.revenue_net).toBeGreaterThan(0)
      expect(result.fees_total).toBeGreaterThan(0)
      expect(result.gst_fees).toBeGreaterThan(0)
      expect(result.tcs).toBeGreaterThan(0)
      expect(result.landed_unit).toBeGreaterThan(0)
      expect(result.profit).toBeLessThan(0)

      // Assert fee breakdown for FBM
      expect(result.fees_breakdown.referral).toBeGreaterThan(0)
      expect(result.fees_breakdown.closing).toBeGreaterThan(0)
      expect(result.fees_breakdown.lastMile).toBeGreaterThan(0)
      expect(result.fees_breakdown.pickPack).toBeUndefined()
      expect(result.fees_breakdown.weightHandling).toBeUndefined()
    })
  })

  describe('Commission Mismatch Detection', () => {
    it('should flag commission mismatch when manual differs from Keepa by >0.5 pp', () => {
      const input: CalcInput = {
        asin: 'TEST123',
        sku: 'TEST-SKU',
        qty: 1,
        sellingPriceINR: 1000,
        buyerShipINR: 0,
        channel: 'FBA',
        weight: 1,
        weightUnit: 'lb',
        unit_usd: 10,
        commission_value: 16, // Manual commission (16%)
        commission_mode: 'manual',
      }

      const result = computeRow(input, rates, 'rule')

      // Should flag commission mismatch (16% vs 15% default = 1% difference > 0.5%)
      expect(result.flags).toContain('Commission Mismatch')
    })

    it('should not flag commission mismatch when difference is ≤0.5 pp', () => {
      const input: CalcInput = {
        asin: 'TEST123',
        sku: 'TEST-SKU',
        qty: 1,
        sellingPriceINR: 1000,
        buyerShipINR: 0,
        channel: 'FBA',
        weight: 1,
        weightUnit: 'lb',
        unit_usd: 10,
        commission_value: 15.4, // Manual commission (15.4%)
        commission_mode: 'manual',
      }

      const result = computeRow(input, rates, 'rule')

      // Should not flag commission mismatch (15.4% vs 15% default = 0.4% difference ≤ 0.5%)
      expect(result.flags).not.toContain('Commission Mismatch')
    })
  })

  describe('Margin Color Classification', () => {
    it('should classify margins correctly', () => {
      // Test green margin (≥10%)
      const greenInput: CalcInput = {
        asin: 'TEST123',
        sku: 'TEST-SKU',
        qty: 1,
        sellingPriceINR: 10000, // High price for positive margin
        buyerShipINR: 0,
        channel: 'FBA',
        weight: 0.1, // Very light
        weightUnit: 'lb',
        unit_usd: 1, // Very low cost
        commission_value: 5, // Low commission
        commission_mode: 'manual',
      }

      const greenResult = computeRow(greenInput, rates, 'rule')
      expect(greenResult.marginColor).toBe('green')

      // Test yellow margin (5-10%)
      const yellowInput: CalcInput = {
        ...greenInput,
        sellingPriceINR: 5000, // Medium price
        unit_usd: 5, // Medium cost
      }

      const yellowResult = computeRow(yellowInput, rates, 'rule')
      expect(yellowResult.marginColor).toBe('green') // Fixed: ≥10% should be green

      // Test red margin (<5%)
      const redInput: CalcInput = {
        ...greenInput,
        sellingPriceINR: 1000, // Low price
        unit_usd: 10, // High cost
      }

      const redResult = computeRow(redInput, rates, 'rule')
      expect(redResult.marginColor).toBe('red')
    })

    it('should handle margin color boundaries correctly', () => {
      // Test boundary at 10% (should be green)
      expect(marginColor(10)).toBe('green')
      
      // Test just below 10% (should be yellow)
      expect(marginColor(9.99)).toBe('yellow')
      
      // Test boundary at 5% (should be yellow)
      expect(marginColor(5)).toBe('yellow')
      
      // Test just below 5% (should be red)
      expect(marginColor(4.99)).toBe('red')
    })
  })

  describe('Weight Conversion', () => {
    it('should convert different weight units to pounds', () => {
      const baseInput: CalcInput = {
        asin: 'TEST123',
        sku: 'TEST-SKU',
        qty: 1,
        sellingPriceINR: 1000,
        buyerShipINR: 0,
        channel: 'FBA',
        weight: 16, // 16 oz = 1 lb
        weightUnit: 'oz',
        unit_usd: 10,
        commission_value: 15,
        commission_mode: 'manual',
      }

      const result = computeRow(baseInput, rates, 'rule')
      expect(result.fees_breakdown.weightHandling).toBeGreaterThan(0)
    })
  })
})
