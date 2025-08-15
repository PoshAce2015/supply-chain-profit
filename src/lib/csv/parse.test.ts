import { describe, it, expect } from 'vitest'
import { parseCsv } from './parse'

describe('CSV Parser', () => {
  it('should parse Keepa CSV correctly', () => {
    const keepaCsv = `ASIN,Title,Category,Brand,Price,Currency
B08N5WRWNW,Amazon Echo Dot (4th Gen),Electronics,Amazon,49.99,USD
B08N5KWB9H,Fire TV Stick 4K,Electronics,Amazon,39.99,USD
B08N5KWB9H,Fire TV Stick 4K Max,Electronics,Amazon,54.99,USD`

    const result = parseCsv(keepaCsv)

    expect(result.headers).toEqual(['ASIN', 'Title', 'Category', 'Brand', 'Price', 'Currency'])
    expect(result.rows).toHaveLength(3)
    expect(result.rows[0]).toEqual(['B08N5WRWNW', 'Amazon Echo Dot (4th Gen)', 'Electronics', 'Amazon', '49.99', 'USD'])
    expect(result.rows[1]).toEqual(['B08N5KWB9H', 'Fire TV Stick 4K', 'Electronics', 'Amazon', '39.99', 'USD'])
    expect(result.rows[2]).toEqual(['B08N5KWB9H', 'Fire TV Stick 4K Max', 'Electronics', 'Amazon', '54.99', 'USD'])
  })

  it('should parse India Listings CSV correctly', () => {
    const indiaCsv = `ASIN,SKU,OrderID,Quantity,SellingPriceINR,CostPriceINR,OrderDate,Status
B08N5WRWNW,ECHO-DOT-4,ORD001,2,3999.00,2500.00,2024-01-15,Shipped
B08N5KWB9H,FIRE-TV-4K,ORD002,1,2999.00,1800.00,2024-01-16,Pending
B08N5KWB9H,FIRE-TV-MAX,ORD003,3,4499.00,3200.00,2024-01-17,Delivered`

    const result = parseCsv(indiaCsv)

    expect(result.headers).toEqual(['ASIN', 'SKU', 'OrderID', 'Quantity', 'SellingPriceINR', 'CostPriceINR', 'OrderDate', 'Status'])
    expect(result.rows).toHaveLength(3)
    expect(result.rows[0]).toEqual(['B08N5WRWNW', 'ECHO-DOT-4', 'ORD001', '2', '3999.00', '2500.00', '2024-01-15', 'Shipped'])
    expect(result.rows[1]).toEqual(['B08N5KWB9H', 'FIRE-TV-4K', 'ORD002', '1', '2999.00', '1800.00', '2024-01-16', 'Pending'])
    expect(result.rows[2]).toEqual(['B08N5KWB9H', 'FIRE-TV-MAX', 'ORD003', '3', '4499.00', '3200.00', '2024-01-17', 'Delivered'])
  })

  it('should handle empty CSV', () => {
    const result = parseCsv('')
    expect(result.headers).toEqual([])
    expect(result.rows).toEqual([])
  })

  it('should handle CSV with only headers', () => {
    const result = parseCsv('ASIN,SKU,Price')
    expect(result.headers).toEqual(['ASIN', 'SKU', 'Price'])
    expect(result.rows).toEqual([])
  })

  it('should trim whitespace from headers and values', () => {
    const result = parseCsv(' ASIN , SKU \n B08N5WRWNW , ECHO-DOT ')
    expect(result.headers).toEqual(['ASIN', 'SKU'])
    expect(result.rows[0]).toEqual(['B08N5WRWNW', 'ECHO-DOT'])
  })
})
