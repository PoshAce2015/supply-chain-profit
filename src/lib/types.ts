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

export type OrderChannel = 'amazon_in' | 'flipkart' | 'poshace' | 'website' | 'other';
export type OrderClass = 'b2b' | 'b2c' | undefined;

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
  source?: {
    channel: OrderChannel;
    orderClass?: OrderClass;
  } | undefined;
}

// Helper constants for UI labels
export const CHANNEL_LABELS: Record<OrderChannel, string> = {
  amazon_in: 'Amazon Seller Central (IN)',
  flipkart: 'Flipkart',
  poshace: 'Poshace',
  website: 'Website',
  other: 'Other'
};

export const CLASS_LABELS: Record<Exclude<OrderClass, undefined>, string> = {
  b2b: 'B2B',
  b2c: 'B2C'
};

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
export type FileType = 'keepa' | 'indiaListings' | 'uspo' | 'events' | 'settlement' | 'userPurchase' | 'userSales'
