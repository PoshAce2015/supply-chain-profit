import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'
import { Event, Order } from '../../lib/types'
import { canEnforceTwoPerson } from './ordersSlice'

export const selectOrdersState = (state: RootState) => state.orders

export const selectOrderAcks = createSelector(
  [selectOrdersState],
  (orders) => orders.acks
)

export interface AgingOrder {
  asin: string
  sku: string
  daysSinceLastEvent: number
  lastEventType: string
  severity?: 'high' | 'medium' | 'low' | undefined
}

export const selectAgingTop10 = createSelector(
  [
    (state: RootState) => state.imports.datasets.events,
    (state: RootState) => state.imports.datasets.indiaListings,
  ],
  (events: Event[], orders: Order[]): AgingOrder[] => {
    const asinLastEvents = new Map<string, { date: Date; type: string }>()
    
    // Find last event for each ASIN
    events.forEach(event => {
      const asin = event.data?.asin
      if (asin) {
        const eventDate = new Date(event.timestamp)
        const existing = asinLastEvents.get(asin)
        
        if (!existing || eventDate > existing.date) {
          asinLastEvents.set(asin, {
            date: eventDate,
            type: event.type,
          })
        }
      }
    })
    
    // Calculate aging for each order
    const now = new Date()
    const agingOrders: AgingOrder[] = orders
      .filter(order => order.asin)
      .map(order => {
        const lastEvent = asinLastEvents.get(order.asin!)
        const daysSinceLastEvent = lastEvent 
          ? Math.floor((now.getTime() - lastEvent.date.getTime()) / (1000 * 60 * 60 * 24))
          : 999 // High aging for orders with no events
        
        let severity: 'high' | 'medium' | 'low' | undefined
        if (daysSinceLastEvent >= 7) severity = 'high'
        else if (daysSinceLastEvent >= 3) severity = 'medium'
        else if (daysSinceLastEvent >= 1) severity = 'low'
        
        return {
          asin: order.asin!,
          sku: order.sku || '',
          daysSinceLastEvent,
          lastEventType: lastEvent?.type || 'No events',
          severity,
        }
      })
      .sort((a, b) => b.daysSinceLastEvent - a.daysSinceLastEvent)
      .slice(0, 10) // Top 10
    
    return agingOrders
  }
)

export const selectStepLocks = (asin: string, currentUser: string) =>
  createSelector(
    [selectOrderAcks, (state: RootState) => state],
    (acks, state) => {
      const orderAck = acks[asin]
      const step1Enabled = true // Step 1 is always enabled
      
      let step2Enabled = true
      
      // Check two-person rule
      if (canEnforceTwoPerson(state) && orderAck?.step1) {
        step2Enabled = orderAck.step1.by !== currentUser
      }
      
      return {
        step1Enabled,
        step2Enabled,
      }
    }
  )
