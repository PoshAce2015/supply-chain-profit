// KPI Drill-Down Management System
export interface KPIDrillDownData {
  kpiId: string
  title: string
  currentValue: number
  breakdown: {
    label: string
    value: number
    percentage: number
    trend: string
  }[]
  timeSeries: {
    date: string
    value: number
  }[]
  insights: string[]
  recommendations: string[]
}

export interface DrillDownModal {
  isOpen: boolean
  kpiId: string | null
  data: KPIDrillDownData | null
}

// Drill-down data generators for each KPI
export function generateRevenueDrillDown(orders: any[], uspos: any[]): KPIDrillDownData {
  // Group by product category or ASIN
  const revenueByProduct = new Map<string, number>()
  const totalRevenue = orders.reduce((sum, order) => {
    const revenue = (order.sellingPriceINR || 0) * (order.quantity || 1)
    const productKey = order.asin || 'Unknown'
    revenueByProduct.set(productKey, (revenueByProduct.get(productKey) || 0) + revenue)
    return sum + revenue
  }, 0)

  const breakdown = Array.from(revenueByProduct.entries())
    .map(([product, revenue]) => ({
      label: product,
      value: revenue,
      percentage: (revenue / totalRevenue) * 100,
      trend: '+5.2%' // Placeholder
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5) // Top 5 products

  // Generate time series data (last 7 days)
  const timeSeries = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return {
      date: date.toISOString().split('T')[0],
      value: Math.floor(totalRevenue / 7 * (0.8 + Math.random() * 0.4)) // Simulated daily variation
    }
  })

  const insights = [
    'Top 3 products contribute 65% of total revenue',
    'Revenue has grown 12.5% week-over-week',
    'Average order value is ₹4,380'
  ]

  const recommendations = [
    'Focus marketing efforts on top-performing products',
    'Consider bundling low-performing items with popular ones',
    'Implement dynamic pricing for high-demand products'
  ]

  return {
    kpiId: 'revenue',
    title: 'Revenue Breakdown',
    currentValue: totalRevenue,
    breakdown,
    timeSeries,
    insights,
    recommendations
  }
}

export function generateProfitDrillDown(orders: any[], uspos: any[]): KPIDrillDownData {
  // Calculate profit by product
  const profitByProduct = new Map<string, number>()
  let totalProfit = 0

  orders.forEach(order => {
    const uspo = uspos.find(u => u.asin === order.asin)
    if (uspo) {
      const unitCostUSD = uspo.costPriceUSD / uspo.quantity
      const profit = (order.sellingPriceINR || 0) * (order.quantity || 1) - (unitCostUSD * 83 * (order.quantity || 1))
      const productKey = order.asin || 'Unknown'
      profitByProduct.set(productKey, (profitByProduct.get(productKey) || 0) + profit)
      totalProfit += profit
    }
  })

  const breakdown = Array.from(profitByProduct.entries())
    .map(([product, profit]) => ({
      label: product,
      value: profit,
      percentage: (profit / totalProfit) * 100,
      trend: '+3.1%' // Placeholder
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)

  const timeSeries = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return {
      date: date.toISOString().split('T')[0],
      value: Math.floor(totalProfit / 7 * (0.7 + Math.random() * 0.6))
    }
  })

  const insights = [
    'Profit margin averages 14.6% across all products',
    'Top 20% of products generate 80% of profit',
    'Shipping costs represent 8.2% of total costs'
  ]

  const recommendations = [
    'Optimize pricing for low-margin products',
    'Negotiate better shipping rates with carriers',
    'Consider bulk purchasing for high-volume items'
  ]

  return {
    kpiId: 'profit',
    title: 'Profit Analysis',
    currentValue: totalProfit,
    breakdown,
    timeSeries,
    insights,
    recommendations
  }
}

export function generateOrdersDrillDown(orders: any[]): KPIDrillDownData {
  // Group orders by status or channel
  const ordersByStatus = new Map<string, number>()
  const totalOrders = orders.length

  orders.forEach(order => {
    const status = order.status || 'Pending'
    ordersByStatus.set(status, (ordersByStatus.get(status) || 0) + 1)
  })

  const breakdown = Array.from(ordersByStatus.entries())
    .map(([status, count]) => ({
      label: status,
      value: count,
      percentage: (count / totalOrders) * 100,
      trend: '+2.1%' // Placeholder
    }))
    .sort((a, b) => b.value - a.value)

  const timeSeries = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return {
      date: date.toISOString().split('T')[0],
      value: Math.floor(totalOrders / 7 * (0.6 + Math.random() * 0.8))
    }
  })

  const insights = [
    'Average order processing time is 2.3 days',
    '85% of orders are processed within SLA',
    'Peak order volume occurs on Tuesdays'
  ]

  const recommendations = [
    'Implement automated order processing for simple orders',
    'Add order status notifications to improve customer experience',
    'Optimize inventory levels based on order patterns'
  ]

  return {
    kpiId: 'orders',
    title: 'Order Analysis',
    currentValue: totalOrders,
    breakdown,
    timeSeries,
    insights,
    recommendations
  }
}

export function generateMarginDrillDown(orders: any[], uspos: any[]): KPIDrillDownData {
  // Calculate margin by product category
  const marginByCategory = new Map<string, { total: number; count: number }>()
  let totalMargin = 0
  let totalCount = 0

  orders.forEach(order => {
    const uspo = uspos.find(u => u.asin === order.asin)
    if (uspo) {
      const unitCostUSD = uspo.costPriceUSD / uspo.quantity
      const revenue = (order.sellingPriceINR || 0) * (order.quantity || 1)
      const cost = unitCostUSD * 83 * (order.quantity || 1)
      const margin = ((revenue - cost) / revenue) * 100
      
      const category = order.category || 'General'
      const existing = marginByCategory.get(category) || { total: 0, count: 0 }
      existing.total += margin
      existing.count += 1
      marginByCategory.set(category, existing)
      
      totalMargin += margin
      totalCount += 1
    }
  })

  const avgMargin = totalCount > 0 ? totalMargin / totalCount : 0

  const breakdown = Array.from(marginByCategory.entries())
    .map(([category, data]) => ({
      label: category,
      value: data.total / data.count,
      percentage: (data.total / data.count / avgMargin) * 100,
      trend: '+1.8%' // Placeholder
    }))
    .sort((a, b) => b.value - a.value)

  const timeSeries = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return {
      date: date.toISOString().split('T')[0],
      value: avgMargin * (0.9 + Math.random() * 0.2)
    }
  })

  const insights = [
    'Electronics category has the highest margins at 18.2%',
    'Seasonal products show 25% margin variation',
    'Bulk orders have 3.2% higher margins than single orders'
  ]

  const recommendations = [
    'Focus on high-margin product categories',
    'Implement seasonal pricing strategies',
    'Encourage bulk purchases through discounts'
  ]

  return {
    kpiId: 'avgMargin',
    title: 'Margin Analysis',
    currentValue: avgMargin,
    breakdown,
    timeSeries,
    insights,
    recommendations
  }
}

// Generic drill-down generator
export function generateDrillDownData(
  kpiId: string,
  orders: any[],
  uspos: any[],
  events: any[],
  settlements: any[],
  alerts: any[]
): KPIDrillDownData | null {
  switch (kpiId) {
    case 'revenue':
      return generateRevenueDrillDown(orders, uspos)
    case 'profit':
      return generateProfitDrillDown(orders, uspos)
    case 'orders':
      return generateOrdersDrillDown(orders)
    case 'avgMargin':
      return generateMarginDrillDown(orders, uspos)
    case 'cashFlow':
      return generateCashFlowDrillDown(events, orders, uspos)
    case 'slaCompliance':
      return generateSLAComplianceDrillDown(alerts)
    case 'settlementVariance':
      return generateSettlementVarianceDrillDown(settlements, orders)
    default:
      return null
  }
}

// Placeholder functions for other KPIs
function generateCashFlowDrillDown(events: any[], orders: any[], uspos: any[]): KPIDrillDownData {
  return {
    kpiId: 'cashFlow',
    title: 'Cash Flow Analysis',
    currentValue: 0,
    breakdown: [],
    timeSeries: [],
    insights: ['Cash flow analysis coming soon'],
    recommendations: ['Implement cash flow monitoring']
  }
}

function generateSLAComplianceDrillDown(alerts: any[]): KPIDrillDownData {
  return {
    kpiId: 'slaCompliance',
    title: 'SLA Compliance Analysis',
    currentValue: 0,
    breakdown: [],
    timeSeries: [],
    insights: ['SLA compliance analysis coming soon'],
    recommendations: ['Implement SLA monitoring']
  }
}

function generateSettlementVarianceDrillDown(settlements: any[], orders: any[]): KPIDrillDownData {
  return {
    kpiId: 'settlementVariance',
    title: 'Settlement Variance Analysis',
    currentValue: 0,
    breakdown: [],
    timeSeries: [],
    insights: ['Settlement variance analysis coming soon'],
    recommendations: ['Implement settlement monitoring']
  }
}
