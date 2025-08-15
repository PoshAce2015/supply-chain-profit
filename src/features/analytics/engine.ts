import { Event } from '../../lib/types'
import { AnalyticsSummary } from './types'

export function computeSegmentAverages(
  events: Event[],
  opts?: { batteryMap?: Record<string, boolean>; batteryExtraDays?: number }
): AnalyticsSummary {
  const batteryMap = opts?.batteryMap || {}
  const batteryExtraDays = opts?.batteryExtraDays || 3
  
  // Group events by ASIN
  const asinEvents = new Map<string, Event[]>()
  events.forEach(event => {
    const asin = event.data?.asin
    if (asin) {
      if (!asinEvents.has(asin)) {
        asinEvents.set(asin, [])
      }
      asinEvents.get(asin)!.push(event)
    }
  })
  
  // Calculate segment deltas for each ASIN
  const segmentDeltas = {
    in_to_uspo: [] as number[],
    usship_to_stackry: [] as number[],
    export_to_customs: [] as number[],
    delivered_to_payment: [] as number[],
  }
  
  asinEvents.forEach((asinEventList, _asin) => {
    // Find event pairs for each segment
    const inOrderEvent = asinEventList.find(e => e.type === 'IN_ORDER')
    const usPoEvent = asinEventList.find(e => e.type === 'US_PO')
    const usShipEvent = asinEventList.find(e => e.type === 'US_SHIP')
    const stackryEvent = asinEventList.find(e => e.type === 'STACKRY_RCVD')
    const exportEvent = asinEventList.find(e => e.type === 'EXPORT')
    const customsEvent = asinEventList.find(e => e.type === 'CUSTOMS_CLEAR')
    const deliveredEvent = asinEventList.find(e => e.type === 'DELIVERED')
    const paymentEvent = asinEventList.find(e => e.type === 'PAYMENT_RECEIVED')
    
    // Calculate deltas for complete pairs
    if (inOrderEvent && usPoEvent) {
      const delta = daysBetween(new Date(inOrderEvent.timestamp), new Date(usPoEvent.timestamp))
      segmentDeltas.in_to_uspo.push(delta)
    }
    
    if (usShipEvent && stackryEvent) {
      const delta = daysBetween(new Date(usShipEvent.timestamp), new Date(stackryEvent.timestamp))
      segmentDeltas.usship_to_stackry.push(delta)
    }
    
    if (exportEvent && customsEvent) {
      const delta = daysBetween(new Date(exportEvent.timestamp), new Date(customsEvent.timestamp))
      segmentDeltas.export_to_customs.push(delta)
    }
    
    if (deliveredEvent && paymentEvent) {
      const delta = daysBetween(new Date(deliveredEvent.timestamp), new Date(paymentEvent.timestamp))
      segmentDeltas.delivered_to_payment.push(delta)
    }
  })
  
  // Calculate averages
  const averages = {
    in_to_uspo: average(segmentDeltas.in_to_uspo),
    usship_to_stackry: average(segmentDeltas.usship_to_stackry),
    export_to_customs: average(segmentDeltas.export_to_customs),
    delivered_to_payment: average(segmentDeltas.delivered_to_payment),
  }
  
  // Add battery extra days for display (not mutating raw deltas)
  const batteryAsins = Object.keys(batteryMap).filter(asin => batteryMap[asin])
  if (batteryAsins.length > 0) {
    // For display purposes, add battery extra days to each segment average
    // This is just for reference, not affecting the raw calculations
  }
  
  return {
    segments: averages,
    batteryExtraDays,
  }
}

function daysBetween(a: Date, b: Date): number {
  const timeDiff = Math.abs(a.getTime() - b.getTime())
  return Math.floor(timeDiff / (1000 * 60 * 60 * 24))
}

function average(numbers: number[]): number {
  if (numbers.length === 0) return 0
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length
}
