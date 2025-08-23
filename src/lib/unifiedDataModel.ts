// Unified Data Model for Supply Chain & Profit Analysis
// This model links sales and purchase records to provide comprehensive supply chain insights

import { z } from 'zod'

// ============================================================================
// CORE DATA TYPES
// ============================================================================

// Sales Record Schema (from Amazon Seller Central, etc.)
export const SalesRecordSchema = z.object({
  // Order Information
  orderId: z.string(),
  orderItemId: z.string().optional(),
  purchaseDate: z.string(),
  paymentsDate: z.string().optional(),
  reportingDate: z.string().optional(),
  promiseDate: z.string().optional(),
  daysPastPromise: z.number().optional(),
  
  // Customer Information
  buyerEmail: z.string().optional(),
  buyerName: z.string().optional(),
  buyerPhoneNumber: z.string().optional(),
  isBusinessOrder: z.boolean().optional(),
  purchaseOrderNumber: z.string().optional(),
  priceDesignation: z.string().optional(),
  isIba: z.boolean().optional(),
  
  // Product Information
  sku: z.string(),
  productName: z.string(),
  asin: z.string(),
  quantityPurchased: z.number(),
  quantityShipped: z.number().optional(),
  quantityToShip: z.number().optional(),
  
  // Pricing Information
  itemPrice: z.number().optional(),
  itemTax: z.number().optional(),
  shippingPrice: z.number().optional(),
  shippingTax: z.number().optional(),
  itemPromotionDiscount: z.number().optional(),
  shipPromotionDiscount: z.number().optional(),
  itemTotal: z.number().optional(),
  currency: z.string().optional(),
  
  // Commission and Fees
  commission: z.number().optional(),
  referralFee: z.number().optional(),
  variableClosingFee: z.number().optional(),
  perItemFee: z.number().optional(),
  fbaFees: z.number().optional(),
  otherTransactionFee: z.number().optional(),
  other: z.number().optional(),
  
  // Shipping Information
  shipServiceLevel: z.string().optional(),
  recipientName: z.string().optional(),
  shipAddress1: z.string().optional(),
  shipAddress2: z.string().optional(),
  shipAddress3: z.string().optional(),
  shipCity: z.string().optional(),
  shipState: z.string().optional(),
  shipPostalCode: z.string().optional(),
  shipCountry: z.string().optional(),
  carrier: z.string().optional(),
  trackingNumber: z.string().optional(),
  shipDate: z.string().optional(),
  deliveryDate: z.string().optional(),
  
  // Business Intelligence
  vergeOfCancellation: z.boolean().optional(),
  vergeOfLateShipment: z.boolean().optional(),
  isPrime: z.boolean().optional(),
  isPrimeEligible: z.boolean().optional(),
  marketplace: z.string().optional(),
  marketplaceId: z.string().optional(),
  
  // Source Information
  source: z.object({
    channel: z.enum(['amazon_seller_central', 'flipkart', 'poshace', 'website', 'other']),
    amazonAccount: z.string().optional(),
  }).optional(),
  
  // Metadata
  createdAt: z.string().default(() => new Date().toISOString()),
  updatedAt: z.string().default(() => new Date().toISOString()),
})

// Purchase Record Schema (from Amazon.com, etc.)
export const PurchaseRecordSchema = z.object({
  // Order Information
  orderDate: z.string(),
  orderId: z.string(),
  accountGroup: z.string().optional(),
  poNumber: z.string().optional(),
  orderQuantity: z.number(),
  currency: z.string().default('USD'),
  
  // Financial Information
  orderSubtotal: z.number(),
  orderShippingHandling: z.number().optional(),
  orderPromotion: z.number().optional(),
  orderTax: z.number().optional(),
  orderNetTotal: z.number(),
  
  // Status Information
  orderStatus: z.string(),
  approver: z.string().optional(),
  accountUser: z.string().optional(),
  accountUserEmail: z.string().optional(),
  
  // Shipment Information
  shipmentDate: z.string().optional(),
  shipmentStatus: z.string().optional(),
  deliveryStatus: z.string().optional(),
  expectedDeliveryDate: z.string().optional(),
  carrierTrackingNumber: z.string().optional(),
  shipmentQuantity: z.number().optional(),
  shippingAddress: z.string().optional(),
  
  // Shipment Financials
  shipmentSubtotal: z.number().optional(),
  shipmentShippingHandling: z.number().optional(),
  shipmentPromotion: z.number().optional(),
  shipmentTax: z.number().optional(),
  shipmentNetTotal: z.number().optional(),
  carrierName: z.string().optional(),
  
  // Product Information
  amazonProductCategory: z.string().optional(),
  asin: z.string(),
  title: z.string(),
  unspsc: z.string().optional(),
  segment: z.string().optional(),
  family: z.string().optional(),
  class: z.string().optional(),
  commodity: z.string().optional(),
  brandCode: z.string().optional(),
  brand: z.string().optional(),
  manufacturer: z.string().optional(),
  nationalStockNumber: z.string().optional(),
  itemModelNumber: z.string().optional(),
  partNumber: z.string().optional(),
  productCondition: z.string().optional(),
  companyCompliance: z.string().optional(),
  
  // Pricing Information
  listedPpu: z.number().optional(),
  purchasePpu: z.number(),
  itemQuantity: z.number(),
  itemSubtotal: z.number(),
  itemShippingHandling: z.number().optional(),
  itemPromotion: z.number().optional(),
  itemTax: z.number().optional(),
  itemNetTotal: z.number(),
  
  // Line Item Information
  poLineItemId: z.string().optional(),
  taxExemptionApplied: z.boolean().optional(),
  taxExemptionType: z.string().optional(),
  taxExemptionOptOut: z.boolean().optional(),
  pricingSavingsProgram: z.string().optional(),
  pricingDiscountApplied: z.number().optional(),
  
  // Receiving Information
  receivingStatus: z.string().optional(),
  receivedQuantity: z.number().optional(),
  receivedDate: z.string().optional(),
  receiverName: z.string().optional(),
  receiverEmail: z.string().optional(),
  
  // Accounting Information
  glCode: z.string().optional(),
  department: z.string().optional(),
  costCenter: z.string().optional(),
  projectCode: z.string().optional(),
  location: z.string().optional(),
  customField1: z.string().optional(),
  
  // Seller Information
  sellerName: z.string().optional(),
  sellerCredentials: z.string().optional(),
  
  // Source Information
  source: z.object({
    vendor: z.enum(['amazon_com', 'walmart_com', 'ebay_com', 'newegg_com', 'custom']),
    domain: z.string().optional(),
  }).optional(),
  
  // Metadata
  createdAt: z.string().default(() => new Date().toISOString()),
  updatedAt: z.string().default(() => new Date().toISOString()),
})

// ============================================================================
// UNIFIED DATA MODEL
// ============================================================================

// Unified Product Record
export interface UnifiedProduct {
  // Core Identifiers
  asin: string
  sku: string
  title: string
  
  // Product Details
  brand: string
  manufacturer: string
  category: string
  segment: string
  family: string
  class: string
  commodity: string
  
  // Physical Properties
  weight: number
  weightUnit: string
  dimensions: {
    length: number
    width: number
    height: number
    unit: string
  }
  
  // Pricing Information
  listedPrice: number
  purchasePrice: number
  currency: string
  
  // Inventory Information
  totalQuantitySold: number
  totalQuantityPurchased: number
  currentStock: number
  
  // Performance Metrics
  totalRevenue: number
  totalCost: number
  totalProfit: number
  averageMargin: number
  
  // Timestamps
  firstPurchaseDate: string
  lastPurchaseDate: string
  firstSaleDate: string
  lastSaleDate: string
  
  // Metadata
  createdAt: string
  updatedAt: string
}

// Unified Order Record (links sales and purchase)
export interface UnifiedOrder {
  // Core Identifiers
  id: string
  salesOrderId: string
  purchaseOrderId?: string
  
  // Product Information
  asin: string
  sku: string
  title: string
  
  // Quantity Information
  quantitySold: number
  quantityPurchased?: number
  
  // Financial Information
  sellingPrice: number
  purchasePrice?: number
  revenue: number
  cost?: number
  profit?: number
  margin?: number
  
  // Timeline Information
  saleDate: string
  purchaseDate?: string
  leadTime?: number // days between purchase and sale
  
  // Source Information
  salesSource: {
    channel: string
    amazonAccount?: string
  }
  purchaseSource?: {
    vendor: string
    domain?: string
  }
  
  // Status Information
  salesStatus: string
  purchaseStatus?: string
  deliveryStatus?: string
  
  // Customer Information
  customer: {
    email?: string
    name?: string
    phone?: string
    isBusiness: boolean
  }
  
  // Shipping Information
  shipping: {
    serviceLevel: string
    carrier?: string
    trackingNumber?: string
    shipDate?: string
    deliveryDate?: string
    address: {
      recipient: string
      line1: string
      line2?: string
      line3?: string
      city: string
      state: string
      postalCode: string
      country: string
    }
  }
  
  // Fees and Taxes
  fees: {
    commission?: number
    referralFee?: number
    fbaFees?: number
    shippingFees?: number
    taxes?: number
    totalFees: number
  }
  
  // Metadata
  createdAt: string
  updatedAt: string
}

// Supply Chain Performance Metrics
export interface SupplyChainMetrics {
  // Product Level Metrics
  productId: string
  asin: string
  sku: string
  
  // Inventory Metrics
  averageStockLevel: number
  stockoutFrequency: number
  reorderPoint: number
  safetyStock: number
  
  // Lead Time Metrics
  averageLeadTime: number
  leadTimeVariability: number
  onTimeDeliveryRate: number
  
  // Financial Metrics
  totalRevenue: number
  totalCost: number
  totalProfit: number
  averageMargin: number
  marginTrend: 'increasing' | 'decreasing' | 'stable'
  
  // Performance Metrics
  sellThroughRate: number
  inventoryTurnover: number
  daysOfInventory: number
  
  // Quality Metrics
  returnRate: number
  defectRate: number
  customerSatisfaction: number
  
  // Timestamps
  periodStart: string
  periodEnd: string
  lastUpdated: string
}

// ============================================================================
// MATCHING STRATEGIES
// ============================================================================

export type MatchingStrategy = 'asin' | 'sku' | 'product_name' | 'fuzzy'

export interface MatchingResult {
  salesRecord: z.infer<typeof SalesRecordSchema>
  purchaseRecord?: z.infer<typeof PurchaseRecordSchema>
  confidence: number // 0-1
  strategy: MatchingStrategy
  matchedFields: string[]
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Match sales and purchase records using multiple strategies
 */
export function matchSalesToPurchase(
  salesRecord: z.infer<typeof SalesRecordSchema>,
  purchaseRecords: z.infer<typeof PurchaseRecordSchema>[],
  strategies: MatchingStrategy[] = ['asin', 'sku', 'product_name']
): MatchingResult {
  
  // Strategy 1: Exact ASIN match
  if (strategies.includes('asin')) {
    // Extract ASIN from sales SKU field (format: ARB_B0B79CYVTM)
    const extractAsinFromSales = (sku: string): string | null => {
      if (sku && sku.includes('_')) {
        const parts = sku.split('_');
        if (parts.length >= 2) {
          const potentialAsin = parts[1];
          // Validate ASIN format (10 characters, alphanumeric)
          if (potentialAsin && potentialAsin.length === 10 && /^[A-Z0-9]{10}$/.test(potentialAsin)) {
            return potentialAsin;
          }
        }
      }
      
      // Also try to extract ASIN from SKU if it contains a 10-character alphanumeric sequence
      if (sku) {
        const asinMatch = sku.match(/[A-Z0-9]{10}/);
        if (asinMatch) {
          return asinMatch[0];
        }
      }
      
      return null;
    };

    const salesAsin = extractAsinFromSales(salesRecord.sku);
    if (salesAsin) {
      const asinMatch = purchaseRecords.find(p => p.asin === salesAsin);
      if (asinMatch) {
        return {
          salesRecord,
          purchaseRecord: asinMatch,
          confidence: 1.0,
          strategy: 'asin',
          matchedFields: ['asin']
        }
      }
    }
  }
  
  // Strategy 2: SKU match
  if (strategies.includes('sku')) {
    const skuMatch = purchaseRecords.find(p => 
      p.itemModelNumber === salesRecord.sku ||
      p.partNumber === salesRecord.sku
    )
    if (skuMatch) {
      return {
        salesRecord,
        purchaseRecord: skuMatch,
        confidence: 0.9,
        strategy: 'sku',
        matchedFields: ['sku']
      }
    }
  }
  
  // Strategy 3: Product name similarity
  if (strategies.includes('product_name')) {
    const bestMatch = findBestProductNameMatch(salesRecord.productName, purchaseRecords)
    if (bestMatch && bestMatch.confidence > 0.8) {
      return {
        salesRecord,
        purchaseRecord: bestMatch.record,
        confidence: bestMatch.confidence,
        strategy: 'product_name',
        matchedFields: ['productName']
      }
    }
  }
  
  // No match found
  return {
    salesRecord,
    confidence: 0,
    strategy: 'asin',
    matchedFields: []
  }
}

/**
 * Find the best product name match using similarity scoring
 */
function findBestProductNameMatch(
  salesProductName: string,
  purchaseRecords: z.infer<typeof PurchaseRecordSchema>[]
): { record: z.infer<typeof PurchaseRecordSchema>, confidence: number } | null {
  
  let bestMatch: { record: z.infer<typeof PurchaseRecordSchema>, confidence: number } | null = null
  
  for (const purchaseRecord of purchaseRecords) {
    const confidence = calculateStringSimilarity(salesProductName, purchaseRecord.title)
    
    if (!bestMatch || confidence > bestMatch.confidence) {
      bestMatch = { record: purchaseRecord, confidence }
    }
  }
  
  return bestMatch
}

/**
 * Calculate string similarity using Levenshtein distance
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2
  const shorter = str1.length > str2.length ? str2 : str1
  
  if (longer.length === 0) return 1.0
  
  const distance = levenshteinDistance(longer.toLowerCase(), shorter.toLowerCase())
  return (longer.length - distance) / longer.length
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      )
    }
  }
  
  return matrix[str2.length][str1.length]
}

/**
 * Create a unified product record from sales and purchase data
 */
export function createUnifiedProduct(
  asin: string,
  salesRecords: z.infer<typeof SalesRecordSchema>[],
  purchaseRecords: z.infer<typeof PurchaseRecordSchema>[]
): UnifiedProduct {
  
  const productSales = salesRecords.filter(s => s.asin === asin)
  const productPurchases = purchaseRecords.filter(p => p.asin === asin)
  
  const totalQuantitySold = productSales.reduce((sum, s) => sum + s.quantityPurchased, 0)
  const totalQuantityPurchased = productPurchases.reduce((sum, p) => sum + p.itemQuantity, 0)
  const totalRevenue = productSales.reduce((sum, s) => sum + (s.itemTotal || 0), 0)
  const totalCost = productPurchases.reduce((sum, p) => sum + p.itemNetTotal, 0)
  const totalProfit = totalRevenue - totalCost
  const averageMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
  
  const firstPurchaseDate = productPurchases.length > 0 
    ? Math.min(...productPurchases.map(p => new Date(p.orderDate).getTime()))
    : new Date().getTime()
  
  const lastPurchaseDate = productPurchases.length > 0
    ? Math.max(...productPurchases.map(p => new Date(p.orderDate).getTime()))
    : new Date().getTime()
  
  const firstSaleDate = productSales.length > 0
    ? Math.min(...productSales.map(s => new Date(s.purchaseDate).getTime()))
    : new Date().getTime()
  
  const lastSaleDate = productSales.length > 0
    ? Math.max(...productSales.map(s => new Date(s.purchaseDate).getTime()))
    : new Date().getTime()
  
  // Get product details from first available record
  const firstSale = productSales[0]
  const firstPurchase = productPurchases[0]
  
  return {
    asin,
    sku: firstSale?.sku || firstPurchase?.itemModelNumber || '',
    title: firstSale?.productName || firstPurchase?.title || '',
    brand: firstPurchase?.brand || '',
    manufacturer: firstPurchase?.manufacturer || '',
    category: firstPurchase?.amazonProductCategory || '',
    segment: firstPurchase?.segment || '',
    family: firstPurchase?.family || '',
    class: firstPurchase?.class || '',
    commodity: firstPurchase?.commodity || '',
    weight: 0, // Would need to be populated from product catalog
    weightUnit: 'lb',
    dimensions: {
      length: 0,
      width: 0,
      height: 0,
      unit: 'in'
    },
    listedPrice: firstPurchase?.listedPpu || 0,
    purchasePrice: firstPurchase?.purchasePpu || 0,
    currency: firstPurchase?.currency || 'USD',
    totalQuantitySold,
    totalQuantityPurchased,
    currentStock: totalQuantityPurchased - totalQuantitySold,
    totalRevenue,
    totalCost,
    totalProfit,
    averageMargin,
    firstPurchaseDate: new Date(firstPurchaseDate).toISOString(),
    lastPurchaseDate: new Date(lastPurchaseDate).toISOString(),
    firstSaleDate: new Date(firstSaleDate).toISOString(),
    lastSaleDate: new Date(lastSaleDate).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

/**
 * Create unified order records linking sales and purchases
 */
export function createUnifiedOrders(
  salesRecords: z.infer<typeof SalesRecordSchema>[],
  purchaseRecords: z.infer<typeof PurchaseRecordSchema>[]
): UnifiedOrder[] {
  
  const unifiedOrders: UnifiedOrder[] = []
  
  for (const salesRecord of salesRecords) {
    const matchingResult = matchSalesToPurchase(salesRecord, purchaseRecords)
    
    const unifiedOrder: UnifiedOrder = {
      id: `${salesRecord.orderId}-${salesRecord.orderItemId || '1'}`,
      salesOrderId: salesRecord.orderId,
      purchaseOrderId: matchingResult.purchaseRecord?.orderId,
      asin: salesRecord.asin,
      sku: salesRecord.sku,
      title: salesRecord.productName,
      quantitySold: salesRecord.quantityPurchased,
      quantityPurchased: matchingResult.purchaseRecord?.itemQuantity,
      sellingPrice: salesRecord.itemPrice || 0,
      purchasePrice: matchingResult.purchaseRecord?.purchasePpu,
      revenue: salesRecord.itemTotal || 0,
      cost: matchingResult.purchaseRecord?.itemNetTotal,
      profit: matchingResult.purchaseRecord ? (salesRecord.itemTotal || 0) - matchingResult.purchaseRecord.itemNetTotal : undefined,
      margin: matchingResult.purchaseRecord && salesRecord.itemTotal ? 
        (((salesRecord.itemTotal || 0) - matchingResult.purchaseRecord.itemNetTotal) / (salesRecord.itemTotal || 0)) * 100 : undefined,
      saleDate: salesRecord.purchaseDate,
      purchaseDate: matchingResult.purchaseRecord?.orderDate,
      leadTime: matchingResult.purchaseRecord ? 
        Math.ceil((new Date(salesRecord.purchaseDate).getTime() - new Date(matchingResult.purchaseRecord.orderDate).getTime()) / (1000 * 60 * 60 * 24)) : undefined,
      salesSource: {
        channel: salesRecord.source?.channel || 'other',
        amazonAccount: salesRecord.source?.amazonAccount
      },
      purchaseSource: matchingResult.purchaseRecord ? {
        vendor: matchingResult.purchaseRecord.source?.vendor || 'amazon_com',
        domain: matchingResult.purchaseRecord.source?.domain
      } : undefined,
      salesStatus: 'completed', // Would need to be derived from actual status
      purchaseStatus: matchingResult.purchaseRecord?.orderStatus,
      deliveryStatus: matchingResult.purchaseRecord?.deliveryStatus,
      customer: {
        email: salesRecord.buyerEmail,
        name: salesRecord.buyerName,
        phone: salesRecord.buyerPhoneNumber,
        isBusiness: salesRecord.isBusinessOrder || false
      },
      shipping: {
        serviceLevel: salesRecord.shipServiceLevel || '',
        carrier: salesRecord.carrier,
        trackingNumber: salesRecord.trackingNumber,
        shipDate: salesRecord.shipDate,
        deliveryDate: salesRecord.deliveryDate,
        address: {
          recipient: salesRecord.recipientName || '',
          line1: salesRecord.shipAddress1 || '',
          line2: salesRecord.shipAddress2,
          line3: salesRecord.shipAddress3,
          city: salesRecord.shipCity || '',
          state: salesRecord.shipState || '',
          postalCode: salesRecord.shipPostalCode || '',
          country: salesRecord.shipCountry || ''
        }
      },
      fees: {
        commission: salesRecord.commission,
        referralFee: salesRecord.referralFee,
        fbaFees: salesRecord.fbaFees,
        shippingFees: salesRecord.shippingPrice,
        taxes: salesRecord.itemTax,
        totalFees: (salesRecord.commission || 0) + (salesRecord.referralFee || 0) + (salesRecord.fbaFees || 0) + (salesRecord.shippingPrice || 0) + (salesRecord.itemTax || 0)
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    unifiedOrders.push(unifiedOrder)
  }
  
  return unifiedOrders
}

/**
 * Calculate supply chain metrics for a product
 */
export function calculateSupplyChainMetrics(
  asin: string,
  unifiedOrders: UnifiedOrder[],
  periodStart: string,
  periodEnd: string
): SupplyChainMetrics {
  
  const productOrders = unifiedOrders.filter(o => o.asin === asin)
  const periodOrders = productOrders.filter(o => 
    o.saleDate >= periodStart && o.saleDate <= periodEnd
  )
  
  const totalRevenue = periodOrders.reduce((sum, o) => sum + o.revenue, 0)
  const totalCost = periodOrders.reduce((sum, o) => sum + (o.cost || 0), 0)
  const totalProfit = totalRevenue - totalCost
  const averageMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
  
  // Calculate lead time metrics
  const leadTimes = periodOrders
    .filter(o => o.leadTime !== undefined)
    .map(o => o.leadTime!)
  
  const averageLeadTime = leadTimes.length > 0 
    ? leadTimes.reduce((sum, lt) => sum + lt, 0) / leadTimes.length 
    : 0
  
  const leadTimeVariability = leadTimes.length > 0
    ? Math.sqrt(leadTimes.reduce((sum, lt) => sum + Math.pow(lt - averageLeadTime, 2), 0) / leadTimes.length)
    : 0
  
  // Calculate on-time delivery rate
  const onTimeDeliveries = periodOrders.filter(o => 
    o.shipping.deliveryDate && o.shipping.shipDate
  ).filter(o => {
    const deliveryDate = new Date(o.shipping.deliveryDate!)
    const shipDate = new Date(o.shipping.shipDate!)
    const daysToDeliver = Math.ceil((deliveryDate.getTime() - shipDate.getTime()) / (1000 * 60 * 60 * 24))
    return daysToDeliver <= 7 // Assuming 7 days is on-time
  }).length
  
  const onTimeDeliveryRate = periodOrders.length > 0 
    ? (onTimeDeliveries / periodOrders.length) * 100 
    : 0
  
  return {
    productId: asin,
    asin,
    sku: productOrders[0]?.sku || '',
    averageStockLevel: 0, // Would need inventory tracking
    stockoutFrequency: 0, // Would need inventory tracking
    reorderPoint: 0, // Would need inventory planning
    safetyStock: 0, // Would need inventory planning
    averageLeadTime,
    leadTimeVariability,
    onTimeDeliveryRate,
    totalRevenue,
    totalCost,
    totalProfit,
    averageMargin,
    marginTrend: 'stable', // Would need historical comparison
    sellThroughRate: 0, // Would need inventory tracking
    inventoryTurnover: 0, // Would need inventory tracking
    daysOfInventory: 0, // Would need inventory tracking
    returnRate: 0, // Would need return data
    defectRate: 0, // Would need quality data
    customerSatisfaction: 0, // Would need customer feedback
    periodStart,
    periodEnd,
    lastUpdated: new Date().toISOString()
  }
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type SalesRecord = z.infer<typeof SalesRecordSchema>
export type PurchaseRecord = z.infer<typeof PurchaseRecordSchema>

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate and parse sales data
 */
export function validateSalesData(data: any[]): SalesRecord[] {
  return data.map((row, index) => {
    try {
      return SalesRecordSchema.parse(row)
    } catch (error) {
      console.warn(`Invalid sales record at index ${index}:`, error)
      throw new Error(`Invalid sales record at index ${index}: ${error}`)
    }
  })
}

/**
 * Validate and parse purchase data
 */
export function validatePurchaseData(data: any[]): PurchaseRecord[] {
  return data.map((row, index) => {
    try {
      return PurchaseRecordSchema.parse(row)
    } catch (error) {
      console.warn(`Invalid purchase record at index ${index}:`, error)
      throw new Error(`Invalid purchase record at index ${index}: ${error}`)
    }
  })
}
