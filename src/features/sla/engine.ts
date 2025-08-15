import { Event } from '../../lib/types'
import { SlaSettings, Alert } from './types'
import { nanoid } from 'nanoid'

export function evaluateAlerts(
  events: Event[],
  settings: SlaSettings,
  now: Date = new Date(),
  batteryAsins: Record<string, boolean> = {}
): Alert[] {
  const alerts: Alert[] = []
  const asinEvents = new Map<string, Event[]>()
  
  // Group events by ASIN
  events.forEach(event => {
    const asin = event.data?.asin
    if (asin) {
      if (!asinEvents.has(asin)) {
        asinEvents.set(asin, [])
      }
      asinEvents.get(asin)!.push(event)
    }
  })
  
  // Evaluate each ASIN
  asinEvents.forEach((asinEventList, asin) => {
    const isBattery = batteryAsins[asin] || false
    const batteryExtraDays = isBattery ? settings.BatteryExtraDays : 0
    
    // Check for missed US PO
    const inOrderEvent = asinEventList.find(e => e.type === 'IN_ORDER')
    const usPoEvent = asinEventList.find(e => e.type === 'US_PO')
    
    if (inOrderEvent && !usPoEvent) {
      const inOrderTime = new Date(inOrderEvent.timestamp)
      const hoursSinceOrder = (now.getTime() - inOrderTime.getTime()) / (1000 * 60 * 60)
      
      if (hoursSinceOrder > settings.SLA_PO_Hours) {
        alerts.push({
          id: nanoid(),
          asin,
          severity: 'red',
          kind: 'MISSED_US_PO',
          message: `US PO not created within ${settings.SLA_PO_Hours} hours of order`,
          createdAt: now.toISOString(),
        })
      }
    }
    
    // Check for customs timeout
    const exportEvent = asinEventList.find(e => e.type === 'EXPORT')
    const customsClearEvent = asinEventList.find(e => e.type === 'CUSTOMS_CLEAR')
    
    if (exportEvent && !customsClearEvent) {
      const exportTime = new Date(exportEvent.timestamp)
      const daysSinceExport = (now.getTime() - exportTime.getTime()) / (1000 * 60 * 60 * 24)
      
      const yellowThreshold = settings.SLA_Customs_Days + batteryExtraDays
      const redThreshold = 6 + batteryExtraDays
      
      if (daysSinceExport > redThreshold) {
        alerts.push({
          id: nanoid(),
          asin,
          severity: 'red',
          kind: 'CUSTOMS_TIMEOUT',
          message: `Customs clearance overdue by ${Math.round(daysSinceExport - redThreshold)} days${isBattery ? ' (battery product)' : ''}`,
          createdAt: now.toISOString(),
        })
      } else if (daysSinceExport > yellowThreshold) {
        alerts.push({
          id: nanoid(),
          asin,
          severity: 'yellow',
          kind: 'CUSTOMS_TIMEOUT',
          message: `Customs clearance approaching deadline${isBattery ? ' (battery product)' : ''}`,
          createdAt: now.toISOString(),
        })
      }
    }
  })
  
  // Deduplicate alerts per ASIN/kind (most recent wins)
  const deduplicated = new Map<string, Alert>()
  alerts.forEach(alert => {
    const key = `${alert.asin}-${alert.kind}`
    const existing = deduplicated.get(key)
    if (!existing || new Date(alert.createdAt) > new Date(existing.createdAt)) {
      deduplicated.set(key, alert)
    }
  })
  
  return Array.from(deduplicated.values())
}
