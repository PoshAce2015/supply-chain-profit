import { describe, it, expect } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'
import { importsReducer, setMapping, ingest } from './importsSlice'

describe('Imports Slice', () => {
  const createTestStore = () => {
    return configureStore({
      reducer: {
        imports: importsReducer,
      },
    })
  }

  it('should set mapping and ingest Keepa data correctly', () => {
    const store = createTestStore()
    
    // Set mapping for Keepa
    const keepaMapping = {
      'ASIN': 'asin',
      'Title': 'title',
      'Category': 'category',
      'Brand': 'brand',
      'Price': 'price',
      'Currency': 'currency',
    }
    
    store.dispatch(setMapping({ fileType: 'keepa', mapping: keepaMapping }))
    
    // Ingest Keepa CSV
    const keepaCsv = `ASIN,Title,Category,Brand,Price,Currency
B08N5WRWNW,Amazon Echo Dot (4th Gen),Electronics,Amazon,49.99,USD
B08N5KWB9H,Fire TV Stick 4K,Electronics,Amazon,39.99,USD`
    
    store.dispatch(ingest({ fileType: 'keepa', text: keepaCsv }))
    
    const state = store.getState().imports
    
    expect(state.datasets.keepa).toHaveLength(2)
    expect(state.datasets.keepa[0]).toEqual({
      asin: 'B08N5WRWNW',
      title: 'Amazon Echo Dot (4th Gen)',
      category: 'Electronics',
      brand: 'Amazon',
      price: '49.99',
      currency: 'USD',
    })
    expect(state.datasets.keepa[1]).toEqual({
      asin: 'B08N5KWB9H',
      title: 'Fire TV Stick 4K',
      category: 'Electronics',
      brand: 'Amazon',
      price: '39.99',
      currency: 'USD',
    })
  })

  it('should set mapping and ingest India Listings data correctly', () => {
    const store = createTestStore()
    
    // Set mapping for India Listings
    const indiaMapping = {
      'ASIN': 'asin',
      'SKU': 'sku',
      'OrderID': 'orderId',
      'Quantity': 'quantity',
      'SellingPriceINR': 'sellingPriceINR',
      'CostPriceINR': 'costPriceINR',
      'OrderDate': 'orderDate',
      'Status': 'status',
    }
    
    store.dispatch(setMapping({ fileType: 'indiaListings', mapping: indiaMapping }))
    
    // Ingest India Listings CSV
    const indiaCsv = `ASIN,SKU,OrderID,Quantity,SellingPriceINR,CostPriceINR,OrderDate,Status
B08N5WRWNW,ECHO-DOT-4,ORD001,2,3999.00,2500.00,2024-01-15,Shipped
B08N5KWB9H,FIRE-TV-4K,ORD002,1,2999.00,1800.00,2024-01-16,Pending`
    
    store.dispatch(ingest({ fileType: 'indiaListings', text: indiaCsv }))
    
    const state = store.getState().imports
    
    expect(state.datasets.indiaListings).toHaveLength(2)
    expect(state.datasets.indiaListings[0]).toEqual({
      asin: 'B08N5WRWNW',
      sku: 'ECHO-DOT-4',
      orderId: 'ORD001',
      quantity: '2',
      sellingPriceINR: '3999.00',
      costPriceINR: '2500.00',
      orderDate: '2024-01-15',
      status: 'Shipped',
    })
    expect(state.datasets.indiaListings[1]).toEqual({
      asin: 'B08N5KWB9H',
      sku: 'FIRE-TV-4K',
      orderId: 'ORD002',
      quantity: '1',
      sellingPriceINR: '2999.00',
      costPriceINR: '1800.00',
      orderDate: '2024-01-16',
      status: 'Pending',
    })
  })

  it('should ignore unmapped headers', () => {
    const store = createTestStore()
    
    const mapping = {
      'ASIN': 'asin',
      'SKU': 'sku',
    }
    
    store.dispatch(setMapping({ fileType: 'keepa', mapping }))
    
    const csv = `ASIN,SKU,UnmappedField,AnotherUnmapped
B08N5WRWNW,ECHO-DOT-4,ignored,also-ignored`
    
    store.dispatch(ingest({ fileType: 'keepa', text: csv }))
    
    const state = store.getState().imports
    
    expect(state.datasets.keepa[0]).toEqual({
      asin: 'B08N5WRWNW',
      sku: 'ECHO-DOT-4',
    })
    expect(state.datasets.keepa[0]).not.toHaveProperty('UnmappedField')
    expect(state.datasets.keepa[0]).not.toHaveProperty('AnotherUnmapped')
  })

  it('should throw error when ingesting without mapping', () => {
    const store = createTestStore()
    
    expect(() => {
      store.dispatch(ingest({ fileType: 'keepa', text: 'ASIN,SKU\nB08N5WRWNW,ECHO-DOT-4' }))
    }).toThrow('No mapping defined for file type: keepa')
  })
})
