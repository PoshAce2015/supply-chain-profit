import { describe, it, expect } from 'vitest'
import { computeSegmentAverages } from './engine'
import { Event } from '../../lib/types'

describe('Analytics Engine', () => {
  it('should compute segment averages from synthetic events', () => {
    const events: Event[] = [
      {
        id: '1',
        type: 'IN_ORDER',
        timestamp: '2024-01-01T00:00:00Z',
        data: { asin: 'B123' }
      },
      {
        id: '2',
        type: 'US_PO',
        timestamp: '2024-01-03T00:00:00Z',
        data: { asin: 'B123' }
      },
      {
        id: '3',
        type: 'US_SHIP',
        timestamp: '2024-01-05T00:00:00Z',
        data: { asin: 'B123' }
      },
      {
        id: '4',
        type: 'STACKRY_RCVD',
        timestamp: '2024-01-07T00:00:00Z',
        data: { asin: 'B123' }
      },
      {
        id: '5',
        type: 'EXPORT',
        timestamp: '2024-01-10T00:00:00Z',
        data: { asin: 'B123' }
      },
      {
        id: '6',
        type: 'CUSTOMS_CLEAR',
        timestamp: '2024-01-12T00:00:00Z',
        data: { asin: 'B123' }
      },
      {
        id: '7',
        type: 'DELIVERED',
        timestamp: '2024-01-15T00:00:00Z',
        data: { asin: 'B123' }
      },
      {
        id: '8',
        type: 'PAYMENT_RECEIVED',
        timestamp: '2024-01-18T00:00:00Z',
        data: { asin: 'B123' }
      }
    ]
    
    const result = computeSegmentAverages(events)
    
    expect(result.segments.in_to_uspo).toBe(2) // Jan 1 to Jan 3
    expect(result.segments.usship_to_stackry).toBe(2) // Jan 5 to Jan 7
    expect(result.segments.export_to_customs).toBe(2) // Jan 10 to Jan 12
    expect(result.segments.delivered_to_payment).toBe(3) // Jan 15 to Jan 18
    expect(result.batteryExtraDays).toBe(3)
  })
  
  it('should handle incomplete event pairs', () => {
    const events: Event[] = [
      {
        id: '1',
        type: 'IN_ORDER',
        timestamp: '2024-01-01T00:00:00Z',
        data: { asin: 'B123' }
      },
      // Missing US_PO event
      {
        id: '2',
        type: 'US_SHIP',
        timestamp: '2024-01-05T00:00:00Z',
        data: { asin: 'B123' }
      },
      {
        id: '3',
        type: 'STACKRY_RCVD',
        timestamp: '2024-01-07T00:00:00Z',
        data: { asin: 'B123' }
      }
    ]
    
    const result = computeSegmentAverages(events)
    
    expect(result.segments.in_to_uspo).toBe(0) // No complete pair
    expect(result.segments.usship_to_stackry).toBe(2) // Complete pair
    expect(result.segments.export_to_customs).toBe(0) // No events
    expect(result.segments.delivered_to_payment).toBe(0) // No events
  })
})
