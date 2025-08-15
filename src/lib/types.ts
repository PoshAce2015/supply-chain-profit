// Canonical data types for CSV ingest
export interface Product {
  asin: string
  sku?: string
  title?: string
  category?: string
  brand?: string
  price?: number
  currency?: string
  weight?: number
  weightUnit?: string
}

export interface Order {
  asin: string
  sku: string
  orderId?: string
  quantity?: number
  sellingPriceINR?: number
  costPriceINR?: number
  orderDate?: string
  status?: string
  commission_value?: number
  commission_mode?: 'manual' | 'keepa'
}

export interface USPO {
  asin: string
  sku: string
  orderId: string
  quantity: number
  sellingPriceUSD: number
  costPriceUSD: number
  orderDate: string
  status: string
}

export interface Event {
  id: string
  type: string
  timestamp: string
  data: Record<string, any>
}

export interface Settlement {
  id: string
  asin?: string
  sku?: string
  date: string
  amount: number
  currency: string
  type: string
  status: string
  feesTotalINR?: number
}

export interface Run {
  id: string
  timestamp: string
  status: string
  data: Record<string, any>
}

export interface User {
  id: string
  email: string
  role: string
  permissions: string[]
}

// File types for CSV mapping
export type FileType = 'keepa' | 'indiaListings' | 'uspo' | 'events' | 'settlement'
