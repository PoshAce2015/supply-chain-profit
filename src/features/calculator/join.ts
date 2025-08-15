import { Order, Product, USPO } from '../../lib/types'

export interface JoinedRow {
  asin: string
  sku: string
  qty: number
  sellingPriceINR: number
  buyerShipINR: number
  commission_value?: number | undefined
  commission_mode?: 'manual' | 'keepa' | undefined
  channel: 'FBA' | 'FBM'
  weight: number
  weightUnit: 'oz' | 'lb' | 'kg'
  unit_usd: number
  fx_override?: number | undefined
}

export function joinByAsin({
  orders,
  products,
  uspos,
}: {
  orders: Order[]
  products: Product[]
  uspos: USPO[]
}): JoinedRow[] {
  // Create lookup maps
  const productMap = new Map<string, Product>()
  const uspoMap = new Map<string, USPO>()
  
  products.forEach(product => {
    if (product.asin) {
      productMap.set(product.asin, product)
    }
  })
  
  uspos.forEach(uspo => {
    uspoMap.set(uspo.asin, uspo)
  })
  
  // Join orders with products and USPOs
  return orders
    .filter(order => order.asin) // Only process orders with ASIN
    .map(order => {
      const product = productMap.get(order.asin!)
      const uspo = uspoMap.get(order.asin!)
      
      // Determine channel (default to FBA)
      const channel: 'FBA' | 'FBM' = 'FBA'
      
      // Get weight and unit from product or USPO
      let weight = 0
      let weightUnit: 'oz' | 'lb' | 'kg' = 'lb'
      
      if (product?.weight) {
        weight = product.weight
        // Assume oz if no unit specified (common for Amazon products)
        weightUnit = (product.weightUnit as 'oz' | 'lb' | 'kg') || 'oz'
      } else if (uspo) {
        // Use USPO data if available
        weight = 0 // USPO doesn't have weight in our current schema
        weightUnit = 'lb'
      }
      
      // Get unit cost from USPO or product
      let unit_usd = 0
      if (uspo) {
        unit_usd = uspo.costPriceUSD / uspo.quantity
      } else if (product?.price) {
        unit_usd = product.price
      }
      
      // Commission handling
      let commission_value: number | undefined
      let commission_mode: 'manual' | 'keepa' | undefined
      
      // If order has commission data, use it (manual from India Listings)
      if (order.commission_value !== undefined) {
        commission_value = order.commission_value
        commission_mode = order.commission_mode || 'manual'
      } else if (product) {
        // Fallback to Keepa-derived commission (would need to be calculated)
        commission_value = undefined
        commission_mode = 'keepa'
      }
      
      return {
        asin: order.asin!,
        sku: order.sku || '',
        qty: order.quantity || 1,
        sellingPriceINR: order.sellingPriceINR || 0,
        buyerShipINR: 0, // Not in current schema, default to 0
        commission_value,
        commission_mode,
        channel,
        weight,
        weightUnit,
        unit_usd,
        fx_override: undefined,
      }
    })
    .filter(row => row.sellingPriceINR > 0) // Only include rows with valid selling price
}
