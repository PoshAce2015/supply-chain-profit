import { Event, Order, USPO, Settlement } from '../lib/types'
import { computeRow } from './calc/formulas'
import { getDefaultRates } from './calc/defaults'

// KPI Calculation Functions
export interface KPICalculation {
  value: number
  trend: string
  status: 'good' | 'warning' | 'critical'
  lastUpdated: Date
  comparisons: {
    wow: string
    mom: string
    yoy: string
  }
}

// Helper function to calculate percentage change
function calculatePercentageChange(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? '+100%' : '0%'
  const change = ((current - previous) / previous) * 100
  const sign = change >= 0 ? '+' : ''
  return `${sign}${change.toFixed(1)}%`
}

// Helper function to get historical data (simulated for now)
function getHistoricalData(metric: string, period: 'week' | 'month' | 'year'): number {
  // In a real implementation, this would fetch from a time-series database
  const baseValues = {
    revenue: { week: 1100000, month: 1000000, year: 800000 },
    profit: { week: 165000, month: 150000, year: 120000 },
    orders: { week: 2600, month: 2400, year: 2000 },
    avgMargin: { week: 13.2, month: 12.8, year: 11.5 },
    cashFlow: { week: 50000, month: 45000, year: 35000 },
    slaCompliance: { week: 92, month: 89, year: 85 },
    settlementVariance: { week: 800, month: 1200, year: 1500 }
  }
  
  return baseValues[metric as keyof typeof baseValues]?.[period] || 0
}

// Revenue calculation
export function calculateRevenue(orders: Order[]): KPICalculation {
  if (!orders || orders.length === 0) {
    return {
      value: 0,
      trend: '0%',
      status: 'good',
      lastUpdated: new Date(),
      comparisons: {
        wow: '0%',
        mom: '0%',
        yoy: '0%'
      }
    }
  }

  const totalRevenue = orders.reduce((sum, order) => {
    return sum + ((order.sellingPriceINR || 0) * (order.quantity || 1))
  }, 0)

  // Calculate comparison periods
  const wowChange = calculatePercentageChange(totalRevenue, getHistoricalData('revenue', 'week'))
  const momChange = calculatePercentageChange(totalRevenue, getHistoricalData('revenue', 'month'))
  const yoyChange = calculatePercentageChange(totalRevenue, getHistoricalData('revenue', 'year'))

  return {
    value: totalRevenue,
    trend: wowChange, // Use WoW as primary trend
    status: totalRevenue > 1000000 ? 'good' : totalRevenue > 500000 ? 'warning' : 'critical',
    lastUpdated: new Date(),
    comparisons: {
      wow: wowChange,
      mom: momChange,
      yoy: yoyChange
    }
  }
}

// Profit calculation
export function calculateProfit(orders: Order[], uspos: USPO[]): KPICalculation {
  if (!orders || orders.length === 0) {
    return {
      value: 0,
      trend: '0%',
      status: 'good',
      lastUpdated: new Date(),
      comparisons: {
        wow: '0%',
        mom: '0%',
        yoy: '0%'
      }
    }
  }

  const rates = getDefaultRates()
  let totalProfit = 0

  orders.forEach(order => {
    const uspo = uspos.find(u => u.asin === order.asin)
    if (uspo) {
      const unitCostUSD = uspo.costPriceUSD / uspo.quantity
      
      const calcResult = computeRow({
        asin: order.asin,
        sku: order.sku || '',
        qty: order.quantity || 1,
        sellingPriceINR: order.sellingPriceINR || 0,
        buyerShipINR: 0,
        channel: 'FBA',
        weight: 0,
        weightUnit: 'lb',
        unit_usd: unitCostUSD,
      }, rates, 'rule')

      totalProfit += calcResult.profit
    }
  })

  // Calculate comparison periods
  const wowChange = calculatePercentageChange(totalProfit, getHistoricalData('profit', 'week'))
  const momChange = calculatePercentageChange(totalProfit, getHistoricalData('profit', 'month'))
  const yoyChange = calculatePercentageChange(totalProfit, getHistoricalData('profit', 'year'))

  return {
    value: totalProfit,
    trend: wowChange,
    status: totalProfit > 150000 ? 'good' : totalProfit > 75000 ? 'warning' : 'critical',
    lastUpdated: new Date(),
    comparisons: {
      wow: wowChange,
      mom: momChange,
      yoy: yoyChange
    }
  }
}

// Orders count calculation
export function calculateOrders(orders: Order[]): KPICalculation {
  if (!orders) {
    return {
      value: 0,
      trend: '0%',
      status: 'good',
      lastUpdated: new Date(),
      comparisons: {
        wow: '0%',
        mom: '0%',
        yoy: '0%'
      }
    }
  }

  const orderCount = orders.length
  
  // Calculate comparison periods
  const wowChange = calculatePercentageChange(orderCount, getHistoricalData('orders', 'week'))
  const momChange = calculatePercentageChange(orderCount, getHistoricalData('orders', 'month'))
  const yoyChange = calculatePercentageChange(orderCount, getHistoricalData('orders', 'year'))

  return {
    value: orderCount,
    trend: wowChange,
    status: orderCount > 2000 ? 'good' : orderCount > 1000 ? 'warning' : 'critical',
    lastUpdated: new Date(),
    comparisons: {
      wow: wowChange,
      mom: momChange,
      yoy: yoyChange
    }
  }
}

// Average margin calculation
export function calculateAverageMargin(orders: Order[], uspos: USPO[]): KPICalculation {
  if (!orders || orders.length === 0) {
    return {
      value: 0,
      trend: '0%',
      status: 'good',
      lastUpdated: new Date(),
      comparisons: {
        wow: '0%',
        mom: '0%',
        yoy: '0%'
      }
    }
  }

  const rates = getDefaultRates()
  let totalMargin = 0
  let validOrders = 0

  orders.forEach(order => {
    const uspo = uspos.find(u => u.asin === order.asin)
    if (uspo) {
      const unitCostUSD = uspo.costPriceUSD / uspo.quantity
      
      const calcResult = computeRow({
        asin: order.asin,
        sku: order.sku || '',
        qty: order.quantity || 1,
        sellingPriceINR: order.sellingPriceINR || 0,
        buyerShipINR: 0,
        channel: 'FBA',
        weight: 0,
        weightUnit: 'lb',
        unit_usd: unitCostUSD,
      }, rates, 'rule')

      totalMargin += calcResult.marginPct
      validOrders++
    }
  })

  const avgMargin = validOrders > 0 ? totalMargin / validOrders : 0
  
  // Calculate comparison periods
  const wowChange = calculatePercentageChange(avgMargin, getHistoricalData('avgMargin', 'week'))
  const momChange = calculatePercentageChange(avgMargin, getHistoricalData('avgMargin', 'month'))
  const yoyChange = calculatePercentageChange(avgMargin, getHistoricalData('avgMargin', 'year'))

  return {
    value: avgMargin,
    trend: wowChange,
    status: avgMargin > 15 ? 'good' : avgMargin > 10 ? 'warning' : 'critical',
    lastUpdated: new Date(),
    comparisons: {
      wow: wowChange,
      mom: momChange,
      yoy: yoyChange
    }
  }
}

// Cash flow calculation
export function calculateCashFlow(events: Event[], orders: Order[], uspos: USPO[]): KPICalculation {
  if (!events || events.length === 0) {
    return {
      value: 0,
      trend: '0%',
      status: 'good',
      lastUpdated: new Date(),
      comparisons: {
        wow: '0%',
        mom: '0%',
        yoy: '0%'
      }
    }
  }

  let totalInflow = 0
  let totalOutflow = 0

  events.forEach(event => {
    const asin = event.data?.asin
    if (!asin) return

    const order = orders.find(o => o.asin === asin)
    const uspo = uspos.find(u => u.asin === asin)

    if (!order || !uspo) return

    const unitCostUSD = uspo.costPriceUSD / uspo.quantity

    switch (event.type) {
      case 'US_PO':
        totalOutflow += unitCostUSD * 83 * uspo.quantity // Assuming FX rate of 83
        break
      case 'PAYMENT_RECEIVED':
        totalInflow += (order.sellingPriceINR || 0) * (order.quantity || 1)
        break
    }
  })

  const netCashFlow = totalInflow - totalOutflow
  
  // Calculate comparison periods
  const wowChange = calculatePercentageChange(netCashFlow, getHistoricalData('cashFlow', 'week'))
  const momChange = calculatePercentageChange(netCashFlow, getHistoricalData('cashFlow', 'month'))
  const yoyChange = calculatePercentageChange(netCashFlow, getHistoricalData('cashFlow', 'year'))

  return {
    value: netCashFlow,
    trend: momChange, // Use MoM for cash flow as it's more relevant
    status: netCashFlow > 0 ? 'good' : netCashFlow > -100000 ? 'warning' : 'critical',
    lastUpdated: new Date(),
    comparisons: {
      wow: wowChange,
      mom: momChange,
      yoy: yoyChange
    }
  }
}

// SLA compliance calculation
export function calculateSLACompliance(alerts: any[]): KPICalculation {
  if (!alerts || alerts.length === 0) {
    return {
      value: 100,
      trend: '0%',
      status: 'good',
      lastUpdated: new Date(),
      comparisons: {
        wow: '0%',
        mom: '0%',
        yoy: '0%'
      }
    }
  }

  const totalAlerts = alerts.length
  const criticalAlerts = alerts.filter(alert => alert.severity === 'red').length
  const warningAlerts = alerts.filter(alert => alert.severity === 'yellow').length

  // Calculate compliance rate (simplified)
  const complianceRate = Math.max(0, 100 - (criticalAlerts * 10) - (warningAlerts * 5))
  
  // Calculate comparison periods
  const wowChange = calculatePercentageChange(complianceRate, getHistoricalData('slaCompliance', 'week'))
  const momChange = calculatePercentageChange(complianceRate, getHistoricalData('slaCompliance', 'month'))
  const yoyChange = calculatePercentageChange(complianceRate, getHistoricalData('slaCompliance', 'year'))

  return {
    value: complianceRate,
    trend: wowChange,
    status: complianceRate > 90 ? 'good' : complianceRate > 75 ? 'warning' : 'critical',
    lastUpdated: new Date(),
    comparisons: {
      wow: wowChange,
      mom: momChange,
      yoy: yoyChange
    }
  }
}

// Settlement variance calculation
export function calculateSettlementVariance(settlements: Settlement[], orders: Order[]): KPICalculation {
  if (!settlements || settlements.length === 0) {
    return {
      value: 0,
      trend: '0%',
      status: 'good',
      lastUpdated: new Date(),
      comparisons: {
        wow: '0%',
        mom: '0%',
        yoy: '0%'
      }
    }
  }

  let totalVariance = 0
  let validSettlements = 0

  settlements.forEach(settlement => {
    const order = orders.find(o => o.asin === settlement.asin || o.sku === settlement.sku)
    if (order) {
      // Simplified variance calculation
      const expectedFees = (order.sellingPriceINR || 0) * 0.15 // Assume 15% fees
      const actualFees = settlement.feesTotalINR || 0
      totalVariance += Math.abs(actualFees - expectedFees)
      validSettlements++
    }
  })

  const avgVariance = validSettlements > 0 ? totalVariance / validSettlements : 0
  
  // Calculate comparison periods
  const wowChange = calculatePercentageChange(avgVariance, getHistoricalData('settlementVariance', 'week'))
  const momChange = calculatePercentageChange(avgVariance, getHistoricalData('settlementVariance', 'month'))
  const yoyChange = calculatePercentageChange(avgVariance, getHistoricalData('settlementVariance', 'year'))

  return {
    value: avgVariance,
    trend: momChange, // Use MoM for variance as it's more relevant
    status: avgVariance < 1000 ? 'good' : avgVariance < 5000 ? 'warning' : 'critical',
    lastUpdated: new Date(),
    comparisons: {
      wow: wowChange,
      mom: momChange,
      yoy: yoyChange
    }
  }
}
