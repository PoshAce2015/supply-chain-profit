import { ValidatorInputRow } from './types'

export function parsePasted(text: string): ValidatorInputRow[] {
  if (!text.trim()) return []
  
  const lines = text.trim().split('\n')
  if (lines.length < 2) return [] // Need at least header + 1 row
  
  // Parse header and normalize column names
  const headerLine = lines[0]
  if (!headerLine) return []
  
  const delimiter = headerLine.includes('\t') ? '\t' : ','
  const headers = headerLine.split(delimiter).map(h => h.trim().toLowerCase())
  
  // Map normalized headers to field names
  const headerMap: Record<string, keyof ValidatorInputRow> = {
    'asin': 'asin',
    'sku': 'sku',
    'category': 'category',
    'sellingpriceinr': 'sellingPriceINR',
    'sellingprice': 'sellingPriceINR',
    'price': 'sellingPriceINR',
    'buyershippinginr': 'buyerShipINR',
    'buyership': 'buyerShipINR',
    'shipping': 'buyerShipINR',
    'referralpercent': 'referralPercent',
    'referral%': 'referralPercent',
    'referral': 'referralPercent',
    'actualfeesinr': 'actualFeesINR',
    'actualfees': 'actualFeesINR',
    'fees': 'actualFeesINR',
    'gstonfeesinr': 'gstOnFeesINR',
    'gstonfees': 'gstOnFeesINR',
    'gst': 'gstOnFeesINR',
    'netproceedsinr': 'netProceedsINR',
    'netproceeds': 'netProceedsINR',
    'net': 'netProceedsINR'
  }
  
  // Parse data rows
  const rows: ValidatorInputRow[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]?.trim()
    if (!line) continue
    
    const values = line.split(delimiter).map(v => v.trim())
    const row: Partial<ValidatorInputRow> = {}
    
    headers.forEach((header, index) => {
      const field = headerMap[header]
      if (field && values[index] !== undefined) {
        const value = values[index]
        
        // Coerce numbers for numeric fields
        if (['sellingPriceINR', 'buyerShipINR', 'referralPercent', 'actualFeesINR', 'gstOnFeesINR', 'netProceedsINR'].includes(field)) {
          const numValue = parseFloat(value.replace(/[^\d.-]/g, ''))
          if (!isNaN(numValue)) {
            (row as any)[field] = numValue
          }
        } else {
          // String fields
          (row as any)[field] = value
        }
      }
    })
    
    // Only add rows that have at least a selling price
    if (row.sellingPriceINR !== undefined) {
      rows.push(row as ValidatorInputRow)
    }
  }
  
  return rows
}
