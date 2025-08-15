import { describe, it, expect } from 'vitest'
import { buildCashflow } from './engine'
import { CashflowInput } from './types'
import { Event, Order, USPO } from '../../lib/types'
import { getDefaultRates } from '../../lib/calc/defaults'

describe('Cashflow Engine', () => {
  it('should build cashflow with simple inputs', () => {
    const events: Event[] = [
      {
        id: '1',
        type: 'US_PO',
        timestamp: '2024-01-02T00:00:00Z',
        data: { asin: 'B123' }
      },
      {
        id: '2',
        type: 'CUSTOMS_CLEAR',
        timestamp: '2024-01-05T00:00:00Z',
        data: { asin: 'B123' }
      },
      {
        id: '3',
        type: 'PAYMENT_RECEIVED',
        timestamp: '2024-01-10T00:00:00Z',
        data: { asin: 'B123' }
      }
    ]
    
    const orders: Order[] = [
      {
        asin: 'B123',
        sku: 'SKU123',
        sellingPriceINR: 1000,
        quantity: 2
      }
    ]
    
    const uspos: USPO[] = [
      {
        asin: 'B123',
        sku: 'SKU123',
        orderId: 'PO123',
        quantity: 2,
        sellingPriceUSD: 12,
        costPriceUSD: 10,
        orderDate: '2024-01-01',
        status: 'active'
      }
    ]
    
    const input: CashflowInput = {
      openingINR: 10000,
      horizonDays: 30,
      settlementLagDays: 7,
      fx: 84
    }
    
    const rates = getDefaultRates()
    const result = buildCashflow({ events, orders, uspos }, input, rates)
    
    // Verify daily length equals horizonDays
    expect(result.daily.length).toBe(30)
    
    // Verify runwayDays is computed
    expect(result.runwayDays).toBeGreaterThan(0)
    expect(result.runwayDays).toBeLessThanOrEqual(30)
    
    // Verify events are generated
    expect(result.events.length).toBeGreaterThan(0)
    
    // Verify first day has opening balance
    expect(result.daily[0]?.balance).toBe(10000)
  })
  
  it('should handle settlement lag when payment is missing', () => {
    const events: Event[] = [
      {
        id: '1',
        type: 'DELIVERED',
        timestamp: '2024-01-05T00:00:00Z',
        data: { asin: 'B123' }
      }
      // No PAYMENT_RECEIVED event
    ]
    
    const orders: Order[] = [
      {
        asin: 'B123',
        sku: 'SKU123',
        sellingPriceINR: 1000,
        quantity: 1
      }
    ]
    
    const uspos: USPO[] = [
      {
        asin: 'B123',
        sku: 'SKU123',
        orderId: 'PO123',
        quantity: 1,
        sellingPriceUSD: 12,
        costPriceUSD: 10,
        orderDate: '2024-01-01',
        status: 'active'
      }
    ]
    
    const input: CashflowInput = {
      openingINR: 10000,
      horizonDays: 30,
      settlementLagDays: 7,
      fx: 84
    }
    
    const rates = getDefaultRates()
    const result = buildCashflow({ events, orders, uspos }, input, rates)
    
    // Should have settlement event 7 days after delivery
    const settlementEvent = result.events.find(e => 
      e.label.includes('Settlement Payment') && e.type === 'INFLOW'
    )
    expect(settlementEvent).toBeDefined()
  })
})
