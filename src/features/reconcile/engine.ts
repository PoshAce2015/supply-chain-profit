import { Order, Settlement, Product } from '../../lib/types'
import { Rates } from '../../lib/calc/types'
import { calcFeesRuleBased } from '../../lib/calc/fees'
import { ReconcileRow, ReconcileSummary } from './types'

export function buildExpectedFees(
  order: Order,
  product: Product | undefined,
  rates: Rates
): number {
  // Use the same logic as calc/fees.ts 'rule' mode
  const calcInput = {
    asin: order.asin,
    sku: order.sku || '',
    qty: order.quantity || 1,
    sellingPriceINR: order.sellingPriceINR || 0,
    buyerShipINR: 0, // Not used in fee calculation
    channel: 'FBA' as const, // Default to FBA
    weight: product?.weight || 0,
    weightUnit: (product?.weightUnit as 'oz' | 'lb' | 'kg') || 'lb',
    unit_usd: 0, // Not used in fee calculation
  }
  
  const feeBreakdown = calcFeesRuleBased(calcInput, rates)
  return feeBreakdown.total * (order.quantity || 1)
}

export function reconcileRows(
  { orders, settlements, products }: {
    orders: Order[]
    settlements: Settlement[]
    products: Product[]
  },
  rates: Rates
): { rows: ReconcileRow[]; summary: ReconcileSummary } {
  const rows: ReconcileRow[] = []
  
  // Create lookup maps
  const productMap = new Map<string, Product>()
  products.forEach(product => {
    if (product.asin) {
      productMap.set(product.asin, product)
    }
  })
  
  const settlementMap = new Map<string, Settlement>()
  settlements.forEach(settlement => {
    const key = settlement.asin || settlement.sku || ''
    if (key) {
      settlementMap.set(key, settlement)
    }
  })
  
  // Process each order
  orders.forEach(order => {
    const product = productMap.get(order.asin)
    const settlement = settlementMap.get(order.asin) || settlementMap.get(order.sku || '')
    
    if (!settlement) return // Skip if no settlement found
    
    // Calculate Revenue_net (excluding GST)
    const sellingPriceINR = order.sellingPriceINR || 0
    const quantity = order.quantity || 1
    const revenueNet = sellingPriceINR / (1 + rates.GST_sale / 100)
    const netSalesNetGST = revenueNet * quantity
    
    // Calculate expected fees
    const expectedFees = buildExpectedFees(order, product, rates)
    
    // Get settlement fees
    const settlementFees = settlement.feesTotalINR || 0
    
    // Calculate difference
    const diff = settlementFees - expectedFees
    
    // Calculate threshold: max(₹5, 0.8% of netSalesNetGST)
    const threshold = Math.max(5, 0.008 * netSalesNetGST)
    
    // Determine status
    const status: 'OK' | 'Mismatch' = Math.abs(diff) <= threshold ? 'OK' : 'Mismatch'
    
    rows.push({
      asin: order.asin,
      sku: order.sku,
      netSalesNetGST,
      expectedFees,
      settlementFees,
      diff,
      threshold,
      status,
    })
  })
  
  // Calculate summary
  const totalNetSales = rows.reduce((sum, row) => sum + row.netSalesNetGST, 0)
  const totalExpectedFees = rows.reduce((sum, row) => sum + row.expectedFees, 0)
  const totalSettlementFees = rows.reduce((sum, row) => sum + row.settlementFees, 0)
  
  const variancePct = totalExpectedFees > 0 
    ? Math.abs(totalExpectedFees - totalSettlementFees) / totalExpectedFees * 100
    : 0
  
  const summary: ReconcileSummary = {
    totalNetSales,
    totalExpectedFees,
    totalSettlementFees,
    variancePct,
  }
  
  return { rows, summary }
}
