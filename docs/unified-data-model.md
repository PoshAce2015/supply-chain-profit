# Unified Data Model Documentation

## Overview

The Unified Data Model is a comprehensive system that links sales and purchase records to provide end-to-end supply chain visibility and profit analysis. It creates a single source of truth for all product-related data, enabling advanced analytics and business intelligence.

## Architecture

### Core Components

1. **Data Schemas** - Zod-validated schemas for sales and purchase data
2. **Matching Engine** - Intelligent algorithms to link sales and purchase records
3. **Unified Models** - Consolidated data structures for products and orders
4. **Metrics Engine** - Supply chain performance calculations
5. **Redux State Management** - Centralized data storage and processing

### Data Flow

```
Sales Data (CSV) → Validation → Matching Engine → Unified Orders
                                    ↓
Purchase Data (CSV) → Validation → Matching Engine → Unified Products
                                    ↓
                              Metrics Engine → Supply Chain Metrics
```

## Data Schemas

### Sales Record Schema

The sales record schema captures data from Amazon Seller Central and other sales platforms:

```typescript
interface SalesRecord {
  // Order Information
  orderId: string
  orderItemId?: string
  purchaseDate: string
  paymentsDate?: string
  reportingDate?: string
  promiseDate?: string
  daysPastPromise?: number
  
  // Customer Information
  buyerEmail?: string
  buyerName?: string
  buyerPhoneNumber?: string
  isBusinessOrder?: boolean
  purchaseOrderNumber?: string
  priceDesignation?: string
  isIba?: boolean
  
  // Product Information
  sku: string
  productName: string
  asin: string
  quantityPurchased: number
  quantityShipped?: number
  quantityToShip?: number
  
  // Pricing Information
  itemPrice?: number
  itemTax?: number
  shippingPrice?: number
  shippingTax?: number
  itemPromotionDiscount?: number
  shipPromotionDiscount?: number
  itemTotal?: number
  currency?: string
  
  // Commission and Fees
  commission?: number
  referralFee?: number
  variableClosingFee?: number
  perItemFee?: number
  fbaFees?: number
  otherTransactionFee?: number
  other?: number
  
  // Shipping Information
  shipServiceLevel?: string
  recipientName?: string
  shipAddress1?: string
  shipAddress2?: string
  shipAddress3?: string
  shipCity?: string
  shipState?: string
  shipPostalCode?: string
  shipCountry?: string
  carrier?: string
  trackingNumber?: string
  shipDate?: string
  deliveryDate?: string
  
  // Business Intelligence
  vergeOfCancellation?: boolean
  vergeOfLateShipment?: boolean
  isPrime?: boolean
  isPrimeEligible?: boolean
  marketplace?: string
  marketplaceId?: string
  
  // Source Information
  source?: {
    channel: 'amazon_seller_central' | 'flipkart' | 'poshace' | 'website' | 'other'
    amazonAccount?: string
  }
}
```

### Purchase Record Schema

The purchase record schema captures data from Amazon.com and other purchase platforms:

```typescript
interface PurchaseRecord {
  // Order Information
  orderDate: string
  orderId: string
  accountGroup?: string
  poNumber?: string
  orderQuantity: number
  currency: string
  
  // Financial Information
  orderSubtotal: number
  orderShippingHandling?: number
  orderPromotion?: number
  orderTax?: number
  orderNetTotal: number
  
  // Status Information
  orderStatus: string
  approver?: string
  accountUser?: string
  accountUserEmail?: string
  
  // Shipment Information
  shipmentDate?: string
  shipmentStatus?: string
  deliveryStatus?: string
  expectedDeliveryDate?: string
  carrierTrackingNumber?: string
  shipmentQuantity?: number
  shippingAddress?: string
  
  // Product Information
  amazonProductCategory?: string
  asin: string
  title: string
  brand?: string
  manufacturer?: string
  itemModelNumber?: string
  partNumber?: string
  
  // Pricing Information
  listedPpu?: number
  purchasePpu: number
  itemQuantity: number
  itemSubtotal: number
  itemNetTotal: number
  
  // Source Information
  source?: {
    vendor: 'amazon_com' | 'walmart_com' | 'ebay_com' | 'newegg_com' | 'custom'
    domain?: string
  }
}
```

## Matching Strategies

### Primary Matching: ASIN

The most reliable matching strategy uses the Amazon Standard Identification Number (ASIN):

```typescript
// Exact ASIN match
const asinMatch = purchaseRecords.find(p => p.asin === salesRecord.asin)
```

**Confidence Level**: 100%

### Secondary Matching: SKU

When ASIN matching fails, the system attempts SKU matching:

```typescript
// SKU matching across different fields
const skuMatch = purchaseRecords.find(p => 
  p.itemModelNumber === salesRecord.sku ||
  p.partNumber === salesRecord.sku
)
```

**Confidence Level**: 90%

### Tertiary Matching: Product Name Similarity

For cases where exact matches fail, the system uses fuzzy string matching:

```typescript
// Levenshtein distance-based similarity
const similarity = calculateStringSimilarity(salesProductName, purchaseProductName)
if (similarity > 0.8) {
  // Consider as match
}
```

**Confidence Level**: 80%+ (depending on similarity score)

## Unified Data Models

### Unified Product

A consolidated view of product performance across sales and purchases:

```typescript
interface UnifiedProduct {
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
}
```

### Unified Order

A linked record connecting sales and purchase data:

```typescript
interface UnifiedOrder {
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
}
```

## Supply Chain Metrics

### Performance Indicators

The system calculates comprehensive supply chain metrics:

```typescript
interface SupplyChainMetrics {
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
}
```

## Usage Examples

### Importing Data

```typescript
import { importSalesData, importPurchaseData } from './unifiedDataSlice'

// Import sales data
dispatch(importSalesData({
  data: salesCsvData,
  source: 'amazon_seller_central'
}))

// Import purchase data
dispatch(importPurchaseData({
  data: purchaseCsvData,
  source: 'amazon_com'
}))
```

### Processing Unified Data

```typescript
import { processUnifiedData } from './unifiedDataSlice'

// Process all data with date range
dispatch(processUnifiedData(
  '2024-01-01',
  '2024-12-31'
))
```

### Accessing Data

```typescript
import { useSelector } from 'react-redux'
import {
  selectUnifiedProducts,
  selectUnifiedOrders,
  selectSupplyChainMetrics,
  selectMatchingStats
} from './unifiedDataSlice'

// Get unified products
const products = useSelector(selectUnifiedProducts)

// Get unified orders
const orders = useSelector(selectUnifiedOrders)

// Get supply chain metrics
const metrics = useSelector(selectSupplyChainMetrics)

// Get matching statistics
const stats = useSelector(selectMatchingStats)
```

## Key Features

### 1. Intelligent Matching

- **Multi-strategy approach**: ASIN, SKU, and fuzzy name matching
- **Confidence scoring**: Each match includes a confidence level
- **Fallback mechanisms**: Multiple strategies ensure maximum match coverage

### 2. Data Validation

- **Zod schemas**: Type-safe validation for all data
- **Error handling**: Comprehensive error reporting and recovery
- **Data integrity**: Ensures data quality and consistency

### 3. Performance Optimization

- **Efficient algorithms**: Optimized for large datasets (10k+ records)
- **Caching**: Redux state management with persistence
- **Lazy loading**: Data processed on-demand

### 4. Business Intelligence

- **Profit analysis**: Real-time margin calculations
- **Supply chain metrics**: Lead time, delivery performance, inventory turnover
- **Trend analysis**: Margin trends and performance indicators

### 5. Extensibility

- **Modular design**: Easy to add new data sources
- **Configurable matching**: Customizable matching strategies
- **Plugin architecture**: Extensible metrics and calculations

## Best Practices

### Data Import

1. **Validate data quality** before import
2. **Use consistent date formats** (ISO 8601)
3. **Handle missing data** gracefully
4. **Log import errors** for debugging

### Matching Configuration

1. **Start with ASIN matching** for highest accuracy
2. **Configure SKU mapping** for vendor-specific identifiers
3. **Set appropriate similarity thresholds** for fuzzy matching
4. **Review unmatched records** regularly

### Performance Optimization

1. **Process data in batches** for large datasets
2. **Use date ranges** to limit processing scope
3. **Cache frequently accessed data**
4. **Monitor memory usage** with large datasets

### Error Handling

1. **Implement retry logic** for failed operations
2. **Provide user-friendly error messages**
3. **Log detailed error information** for debugging
4. **Graceful degradation** when data is incomplete

## Troubleshooting

### Common Issues

1. **Low match rates**: Check ASIN consistency between sources
2. **Performance issues**: Reduce date range or batch size
3. **Memory errors**: Process data in smaller chunks
4. **Validation errors**: Review data format and required fields

### Debugging Tools

1. **Matching statistics**: Monitor match rates and confidence levels
2. **Error logs**: Review validation and processing errors
3. **Data preview**: Examine raw data before processing
4. **Performance metrics**: Monitor processing time and memory usage

## Future Enhancements

### Planned Features

1. **Machine learning matching**: AI-powered record linking
2. **Real-time processing**: Live data synchronization
3. **Advanced analytics**: Predictive modeling and forecasting
4. **API integration**: Direct platform connections
5. **Custom metrics**: User-defined performance indicators

### Scalability Improvements

1. **Database integration**: Move from localStorage to proper database
2. **Distributed processing**: Handle larger datasets
3. **Caching layers**: Improve performance for frequent queries
4. **Data compression**: Reduce storage requirements

## Conclusion

The Unified Data Model provides a robust foundation for supply chain analytics and profit optimization. By linking sales and purchase data through intelligent matching algorithms, it enables comprehensive business intelligence and data-driven decision making.

The modular architecture ensures scalability and extensibility, while the comprehensive validation and error handling guarantee data quality and reliability. This system serves as the backbone for advanced supply chain management and profit optimization strategies.
