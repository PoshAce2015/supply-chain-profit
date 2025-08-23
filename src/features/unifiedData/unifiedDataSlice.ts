import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { 
  SalesRecord, 
  PurchaseRecord, 
  UnifiedProduct, 
  UnifiedOrder, 
  SupplyChainMetrics,
  validateSalesData,
  validatePurchaseData
} from '../../lib/unifiedDataModel'
import { addTimelineData } from '../imports/importsSlice';
import { setTimeline } from '../timeline/timelineSlice';

// ============================================================================
// STATE INTERFACE
// ============================================================================

interface UnifiedDataState {
  // Raw Data
  salesRecords: SalesRecord[]
  purchaseRecords: PurchaseRecord[]
  
  // Unified Data
  unifiedProducts: UnifiedProduct[]
  unifiedOrders: UnifiedOrder[]
  
  // Metrics
  supplyChainMetrics: SupplyChainMetrics[]
  
  // Processing State
  isProcessing: boolean
  processingProgress: number
  lastProcessedAt: string | null
  
  // Matching Statistics
  matchingStats: {
    totalSalesRecords: number
    totalPurchaseRecords: number
    matchedRecords: number
    unmatchedSalesRecords: number
    matchRate: number
    averageConfidence: number
  }
  
  // Error State
  errors: string[]
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: UnifiedDataState = {
  salesRecords: [],
  purchaseRecords: [],
  unifiedProducts: [],
  unifiedOrders: [],
  supplyChainMetrics: [],
  isProcessing: false,
  processingProgress: 0,
  lastProcessedAt: null,
  matchingStats: {
    totalSalesRecords: 0,
    totalPurchaseRecords: 0,
    matchedRecords: 0,
    unmatchedSalesRecords: 0,
    matchRate: 0,
    averageConfidence: 0
  },
  errors: []
}

// ============================================================================
// SLICE
// ============================================================================

const unifiedDataSlice = createSlice({
  name: 'unifiedData',
  initialState,
  reducers: {
    // ========================================================================
    // DATA IMPORT ACTIONS
    // ========================================================================
    
    /**
     * Import sales data
     */
    importSalesData: (
      state,
      action: PayloadAction<{ data: any[]; source?: string }>
    ) => {
      try {
        const validatedData = validateSalesData(action.payload.data)
        state.salesRecords = validatedData
        state.errors = state.errors.filter(error => !error.includes('sales'))
      } catch (error) {
        state.errors.push(`Sales data import failed: ${error}`)
      }
    },
    
    /**
     * Import purchase data
     */
    importPurchaseData: (
      state,
      action: PayloadAction<{ data: any[]; source?: string }>
    ) => {
      try {
        const validatedData = validatePurchaseData(action.payload.data)
        state.purchaseRecords = validatedData
        state.errors = state.errors.filter(error => !error.includes('purchase'))
      } catch (error) {
        state.errors.push(`Purchase data import failed: ${error}`)
      }
    },
    
    // ========================================================================
    // PROCESSING ACTIONS
    // ========================================================================
    
    /**
     * Start processing unified data
     */
    startProcessing: (state) => {
      state.isProcessing = true
      state.processingProgress = 0
      state.errors = []
    },
    
    /**
     * Update processing progress
     */
    updateProcessingProgress: (
      state,
      action: PayloadAction<{ progress: number; message?: string }>
    ) => {
      state.processingProgress = action.payload.progress
    },
    
    /**
     * Complete processing
     */
    completeProcessing: (state) => {
      state.isProcessing = false
      state.processingProgress = 100
      state.lastProcessedAt = new Date().toISOString()
    },
    
    // ========================================================================
    // UNIFIED DATA CREATION
    // ========================================================================
    
    /**
     * Create unified products from sales and purchase data
     */
    createUnifiedProducts: (state) => {
      try {
        // Get unique ASINs from both sales and purchase data
        const salesAsins = new Set(state.salesRecords.map(s => s.asin))
        const purchaseAsins = new Set(state.purchaseRecords.map(p => p.asin))
        const allAsins = new Set([...salesAsins, ...purchaseAsins])
        
        const unifiedProducts: UnifiedProduct[] = []
        
        allAsins.forEach(asin => {
          const unifiedProduct = createUnifiedProduct(
            asin,
            state.salesRecords,
            state.purchaseRecords
          )
          unifiedProducts.push(unifiedProduct)
        })
        
        state.unifiedProducts = unifiedProducts
      } catch (error) {
        state.errors.push(`Failed to create unified products: ${error}`)
      }
    },
    
    /**
     * Create unified orders from sales and purchase data
     */
    createUnifiedOrders: (state) => {
      try {
        const unifiedOrders = createUnifiedOrders(
          state.salesRecords,
          state.purchaseRecords
        )
        
        state.unifiedOrders = unifiedOrders
        
        // Update matching statistics
        const totalSalesRecords = state.salesRecords.length
        const totalPurchaseRecords = state.purchaseRecords.length
        const matchedRecords = unifiedOrders.filter(o => o.purchaseOrderId).length
        const unmatchedSalesRecords = totalSalesRecords - matchedRecords
        const matchRate = totalSalesRecords > 0 ? (matchedRecords / totalSalesRecords) * 100 : 0
        
        state.matchingStats = {
          totalSalesRecords,
          totalPurchaseRecords,
          matchedRecords,
          unmatchedSalesRecords,
          matchRate,
          averageConfidence: 0 // Would need to track confidence scores
        }
      } catch (error) {
        state.errors.push(`Failed to create unified orders: ${error}`)
      }
    },
    
    // ========================================================================
    // METRICS CALCULATION
    // ========================================================================
    
    /**
     * Calculate supply chain metrics for all products
     */
    calculateSupplyChainMetrics: (
      state,
      action: PayloadAction<{ periodStart: string; periodEnd: string }>
    ) => {
      try {
        const { periodStart, periodEnd } = action.payload
        
        const metrics: SupplyChainMetrics[] = []
        const uniqueAsins = new Set(state.unifiedOrders.map(o => o.asin))
        
        uniqueAsins.forEach(asin => {
          const metric = calculateSupplyChainMetrics(
            asin,
            state.unifiedOrders,
            periodStart,
            periodEnd
          )
          metrics.push(metric)
        })
        
        state.supplyChainMetrics = metrics
      } catch (error) {
        state.errors.push(`Failed to calculate supply chain metrics: ${error}`)
      }
    },
    
    // ========================================================================
    // DATA MANAGEMENT
    // ========================================================================
    
    /**
     * Clear all data
     */
    clearAllData: (state) => {
      state.salesRecords = []
      state.purchaseRecords = []
      state.unifiedProducts = []
      state.unifiedOrders = []
      state.supplyChainMetrics = []
      state.matchingStats = {
        totalSalesRecords: 0,
        totalPurchaseRecords: 0,
        matchedRecords: 0,
        unmatchedSalesRecords: 0,
        matchRate: 0,
        averageConfidence: 0
      }
      state.errors = []
      state.lastProcessedAt = null
    },
    
    /**
     * Remove error
     */
    removeError: (
      state,
      action: PayloadAction<{ index: number }>
    ) => {
      state.errors.splice(action.payload.index, 1)
    },
    
    /**
     * Clear all errors
     */
    clearErrors: (state) => {
      state.errors = []
    },
    
    // ========================================================================
    // DATA UPDATES
    // ========================================================================
    
    /**
     * Update unified product
     */
    updateUnifiedProduct: (
      state,
      action: PayloadAction<{ asin: string; updates: Partial<UnifiedProduct> }>
    ) => {
      const { asin, updates } = action.payload
      const index = state.unifiedProducts.findIndex(p => p.asin === asin)
      
      if (index !== -1) {
        state.unifiedProducts[index] = {
          ...state.unifiedProducts[index],
          ...updates,
          updatedAt: new Date().toISOString()
        }
      }
    },
    
    /**
     * Update unified order
     */
    updateUnifiedOrder: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<UnifiedOrder> }>
    ) => {
      const { id, updates } = action.payload
      const index = state.unifiedOrders.findIndex(o => o.id === id)
      
      if (index !== -1) {
        state.unifiedOrders[index] = {
          ...state.unifiedOrders[index],
          ...updates,
          updatedAt: new Date().toISOString()
        }
      }
    }
  }
})

// ============================================================================
// EXPORTS
// ============================================================================

export const {
  importSalesData,
  importPurchaseData,
  startProcessing,
  updateProcessingProgress,
  completeProcessing,
  createUnifiedProducts,
  createUnifiedOrders,
  calculateSupplyChainMetrics,
  clearAllData,
  removeError,
  clearErrors,
  updateUnifiedProduct,
  updateUnifiedOrder
} = unifiedDataSlice.actions

export default unifiedDataSlice.reducer

// ============================================================================
// SELECTORS
// ============================================================================

export const selectSalesRecords = (state: { unifiedData: UnifiedDataState }) => 
  state.unifiedData.salesRecords

export const selectPurchaseRecords = (state: { unifiedData: UnifiedDataState }) => 
  state.unifiedData.purchaseRecords

export const selectUnifiedProducts = (state: { unifiedData: UnifiedDataState }) => 
  state.unifiedData.unifiedProducts

export const selectUnifiedOrders = (state: { unifiedData: UnifiedDataState }) => 
  state.unifiedData.unifiedOrders

export const selectSupplyChainMetrics = (state: { unifiedData: UnifiedDataState }) => 
  state.unifiedData.supplyChainMetrics

export const selectProcessingState = (state: { unifiedData: UnifiedDataState }) => ({
  isProcessing: state.unifiedData.isProcessing,
  progress: state.unifiedData.processingProgress,
  lastProcessedAt: state.unifiedData.lastProcessedAt
})

export const selectMatchingStats = (state: { unifiedData: UnifiedDataState }) => 
  state.unifiedData.matchingStats

export const selectErrors = (state: { unifiedData: UnifiedDataState }) => 
  state.unifiedData.errors

// ============================================================================
// DERIVED SELECTORS
// ============================================================================

export const selectProductById = (state: { unifiedData: UnifiedDataState }, asin: string) =>
  state.unifiedData.unifiedProducts.find(p => p.asin === asin)

export const selectOrdersByProduct = (state: { unifiedData: UnifiedDataState }, asin: string) =>
  state.unifiedData.unifiedOrders.filter(o => o.asin === asin)

export const selectMetricsByProduct = (state: { unifiedData: UnifiedDataState }, asin: string) =>
  state.unifiedData.supplyChainMetrics.find(m => m.asin === asin)

export const selectProfitableProducts = (state: { unifiedData: UnifiedDataState }) =>
  state.unifiedData.unifiedProducts.filter(p => p.averageMargin > 0)

export const selectLowMarginProducts = (state: { unifiedData: UnifiedDataState }, threshold: number = 10) =>
  state.unifiedData.unifiedProducts.filter(p => p.averageMargin < threshold)

export const selectHighMarginProducts = (state: { unifiedData: UnifiedDataState }, threshold: number = 20) =>
  state.unifiedData.unifiedProducts.filter(p => p.averageMargin > threshold)

export const selectUnmatchedSalesRecords = (state: { unifiedData: UnifiedDataState }) =>
  state.unifiedData.unifiedOrders.filter(o => !o.purchaseOrderId)

export const selectMatchedOrders = (state: { unifiedData: UnifiedDataState }) =>
  state.unifiedData.unifiedOrders.filter(o => o.purchaseOrderId)

// ============================================================================
// THUNK ACTIONS (for async operations)
// ============================================================================

/**
 * Process all data and create unified model
 */
export const processUnifiedData = (periodStart?: string, periodEnd?: string) => 
  async (dispatch: any, getState: any) => {
    
    dispatch(startProcessing())
    
    try {
      // Step 1: Create unified products
      dispatch(updateProcessingProgress({ progress: 25, message: 'Creating unified products...' }))
      dispatch(createUnifiedProducts())
      
      // Step 2: Create unified orders
      dispatch(updateProcessingProgress({ progress: 50, message: 'Creating unified orders...' }))
      dispatch(createUnifiedOrders())
      
      // Step 3: Calculate metrics
      dispatch(updateProcessingProgress({ progress: 75, message: 'Calculating metrics...' }))
      
      const startDate = periodStart || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
      const endDate = periodEnd || new Date().toISOString()
      
      dispatch(calculateSupplyChainMetrics({ periodStart: startDate, periodEnd: endDate }))
      
      // Step 4: Complete
      dispatch(updateProcessingProgress({ progress: 100, message: 'Processing complete!' }))
      dispatch(completeProcessing())
      
    } catch (error) {
      dispatch(completeProcessing())
      throw error
    }
  }

// New thunk to process unified data and populate timeline
export const processUnifiedDataForTimeline = createAsyncThunk(
  'unifiedData/processForTimeline',
  async (_, { dispatch, getState }) => {
    const state = getState() as RootState;
    const { salesRecords, purchaseRecords } = state.unifiedData;
    
    if (salesRecords.length === 0 && purchaseRecords.length === 0) {
      throw new Error('No data available for timeline processing');
    }

    console.log('🔄 Processing unified data for timeline...');
    console.log(`📊 Sales records: ${salesRecords.length}`);
    console.log(`📊 Purchase records: ${purchaseRecords.length}`);

    // Process sales data for timeline
    if (salesRecords.length > 0) {
      const validatedSalesData = salesRecords.map(record => {
        try {
          return validateSalesData(record);
        } catch (error) {
          console.warn('Invalid sales record:', record, error);
          return null;
        }
      }).filter(Boolean);

      if (validatedSalesData.length > 0) {
        dispatch(addTimelineData({ 
          category: 'sales', 
          rows: validatedSalesData 
        }));
        console.log(`✅ Added ${validatedSalesData.length} sales records to timeline`);
      }
    }

    // Process purchase data for timeline
    if (purchaseRecords.length > 0) {
      const validatedPurchaseData = purchaseRecords.map(record => {
        try {
          return validatePurchaseData(record);
        } catch (error) {
          console.warn('Invalid purchase record:', record, error);
          return null;
        }
      }).filter(Boolean);

      if (validatedPurchaseData.length > 0) {
        dispatch(addTimelineData({ 
          category: 'purchase', 
          rows: validatedPurchaseData 
        }));
        console.log(`✅ Added ${validatedPurchaseData.length} purchase records to timeline`);
      }
    }

    // Create timeline events from unified data with proper ASIN linking
    const timelineEvents = [];
    
    // Helper function to extract ASIN from sales SKU
    const extractAsinFromSales = (sku: string): string | null => {
      if (sku && sku.includes('_')) {
        const parts = sku.split('_');
        if (parts.length >= 2) {
          const potentialAsin = parts[1];
          if (potentialAsin && potentialAsin.length === 10 && /^[A-Z0-9]{10}$/.test(potentialAsin)) {
            return potentialAsin;
          }
        }
      }
      return null;
    };

    // Create a map of ASIN to order key for linking
    const asinToOrderKey = new Map<string, string>();
    
    // Process sales records first
    salesRecords.forEach((record, index) => {
      const salesAsin = extractAsinFromSales(record.sku);
      const orderKey = salesAsin || record['order-id'] || `sales_${index}`;
      
      if (salesAsin) {
        asinToOrderKey.set(salesAsin, orderKey);
      }
      
      timelineEvents.push({
        id: `sales_${index}`,
        category: 'sales' as const,
        orderKey: orderKey,
        when: record['purchase-date'] || new Date().toISOString(),
        raw: record
      });
    });

    // Process purchase records and link by ASIN
    purchaseRecords.forEach((record, index) => {
      const purchaseAsin = record.ASIN;
      let orderKey = record['Order ID'] || `purchase_${index}`;
      
      // Try to link by ASIN
      if (purchaseAsin && asinToOrderKey.has(purchaseAsin)) {
        orderKey = asinToOrderKey.get(purchaseAsin)!;
      } else if (purchaseAsin) {
        // Create new order key for this ASIN
        asinToOrderKey.set(purchaseAsin, orderKey);
      }
      
      timelineEvents.push({
        id: `purchase_${index}`,
        category: 'purchase' as const,
        orderKey: orderKey,
        when: record['Order Date'] || new Date().toISOString(),
        raw: record
      });
    });

    // Group events by order
    const byOrder: Record<string, any> = {};
    const orphan: any[] = [];

    timelineEvents.forEach(event => {
      if (event.orderKey) {
        if (!byOrder[event.orderKey]) {
          byOrder[event.orderKey] = {
            orderKey: event.orderKey,
            events: []
          };
        }
        byOrder[event.orderKey].events.push(event);
      } else {
        orphan.push(event);
      }
    });

    // Sort events by date
    Object.values(byOrder).forEach((order: any) => {
      order.events.sort((a: any, b: any) => {
        const dateA = new Date(a.when || 0);
        const dateB = new Date(b.when || 0);
        return dateA.getTime() - dateB.getTime();
      });
    });

    // Set timeline data
    dispatch(setTimeline({
      byOrder,
      orphan,
      lastBuildAt: new Date().toISOString()
    }));

    console.log(`✅ Timeline created with ${Object.keys(byOrder).length} orders and ${orphan.length} orphan events`);
    
    return {
      orderCount: Object.keys(byOrder).length,
      orphanCount: orphan.length,
      totalEvents: timelineEvents.length
    };
  }
);
