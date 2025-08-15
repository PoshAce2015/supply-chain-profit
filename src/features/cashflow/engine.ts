import { Event, Order, USPO } from '../../lib/types'
import { CashflowInput, CashflowEvent, CashflowResult } from './types'
import { Rates } from '../../lib/calc/types'
import { computeRow } from '../../lib/calc/formulas'
import { getDefaultRates } from '../../lib/calc/defaults'

export function buildCashflow(
  datasets: {
    events: Event[]
    orders: Order[]
    uspos: USPO[]
  },
  input: CashflowInput,
  rates: Rates = getDefaultRates()
): CashflowResult {
  const { events, orders, uspos } = datasets
  const { openingINR, horizonDays, settlementLagDays, fx } = input
  
  const cashflowEvents: CashflowEvent[] = []
  const dailyBalances: { date: string; balance: number }[] = []
  
  // Create USPO lookup
  const uspoMap = new Map<string, USPO>()
  uspos.forEach(uspo => {
    uspoMap.set(uspo.asin, uspo)
  })
  
  // Process events to generate cashflow events
  events.forEach(event => {
    const asin = event.data?.asin
    if (!asin) return
    
    const order = orders.find(o => o.asin === asin)
    const uspo = uspoMap.get(asin)
    
    if (!order || !uspo) return
    
    const unitCostUSD = uspo.costPriceUSD / uspo.quantity
    
    switch (event.type) {
      case 'US_PO':
        // Outflow: US PO payment
        const outflowAmount = unitCostUSD * fx * uspo.quantity
        cashflowEvents.push({
          date: event.timestamp,
          type: 'OUTFLOW',
          asin,
          label: `US PO Payment - ${asin}`,
          amountINR: outflowAmount,
        })
        break
        
      case 'CUSTOMS_CLEAR':
        // Outflow: Customs payment
        const landedUnit = computeRow({
          asin,
          sku: order.sku || '',
          qty: uspo.quantity,
          sellingPriceINR: order.sellingPriceINR || 0,
          buyerShipINR: 0,
          channel: 'FBA',
          weight: 0,
          weightUnit: 'lb',
          unit_usd: unitCostUSD,
        }, rates, 'rule').landed_unit
        
        const customsAmount = landedUnit * uspo.quantity
        cashflowEvents.push({
          date: event.timestamp,
          type: 'OUTFLOW',
          asin,
          label: `Customs Payment - ${asin}`,
          amountINR: customsAmount,
        })
        break
        
      case 'PAYMENT_RECEIVED':
        // Inflow: Payment received
        const inflowAmount = (order.sellingPriceINR || 0) * (order.quantity || 1)
        cashflowEvents.push({
          date: event.timestamp,
          type: 'INFLOW',
          asin,
          label: `Payment Received - ${asin}`,
          amountINR: inflowAmount,
        })
        break
        
      case 'DELIVERED':
        // Inflow: Delivered + settlement lag (if no payment event exists)
        const hasPayment = events.some(e => 
          e.data?.asin === asin && 
          e.type === 'PAYMENT_RECEIVED' && 
          new Date(e.timestamp) > new Date(event.timestamp)
        )
        
        if (!hasPayment) {
          const deliveredDate = new Date(event.timestamp)
          deliveredDate.setDate(deliveredDate.getDate() + settlementLagDays)
          
          const inflowAmount = (order.sellingPriceINR || 0) * (order.quantity || 1)
          cashflowEvents.push({
            date: deliveredDate.toISOString(),
            type: 'INFLOW',
            asin,
            label: `Settlement Payment - ${asin}`,
            amountINR: inflowAmount,
          })
        }
        break
    }
  })
  
  // Sort events by date
  cashflowEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  
  // Build daily balance
  let currentBalance = openingINR
  const startDate = new Date()
  let runwayDays = horizonDays
  
  for (let day = 0; day < horizonDays; day++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(currentDate.getDate() + day)
    const dateStr = currentDate.toISOString().split('T')[0]
    
    // Add events for this day
    const dayEvents = cashflowEvents.filter(event => 
      event.date && event.date.startsWith(dateStr || '')
    )
    
    dayEvents.forEach(event => {
      if (event.type === 'INFLOW') {
        currentBalance += event.amountINR
      } else {
        currentBalance -= event.amountINR
      }
    })
    
    dailyBalances.push({
      date: dateStr || '',
      balance: currentBalance,
    })
    
    // Check for runway
    if (currentBalance < 0 && runwayDays === horizonDays) {
      runwayDays = day + 1
    }
  }
  
  return {
    daily: dailyBalances,
    events: cashflowEvents,
    runwayDays,
  }
}
