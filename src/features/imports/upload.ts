import { parseCsv } from '../../lib/csv/parse'
import * as Papa from 'papaparse'
import { getCategorySchema, CategorySchema } from './categorySchemas'
import { ingestFiles, IngestResult, TimelineEvent, OrderSummary } from '../../lib/imports/ingest'
import { setTimelineData, setIngestResult } from '../orders/ordersSlice'
import { store } from '../../app/store'

export interface ImportResult {
  success: boolean
  rowsCount: number
  errors: string[]
  warnings: string[]
  categoryId: string
}

export interface NormalizedRecord {
  [key: string]: string | number | Date | null
}

// Normalize column names to lowercase and trim whitespace
const normalizeColumnName = (column: string): string => {
  return column
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]+/g, '')
}

// Coerce value to appropriate type
const coerceValue = (value: string, key: string): string | number | Date | null => {
  if (!value || value.trim() === '') return null
  
  const trimmed = value.trim()
  
  // Try to parse as number
  if (!isNaN(Number(trimmed)) && trimmed !== '') {
    return Number(trimmed)
  }
  
  // Try to parse as date (multiple formats)
  const dateFormats = [
    /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
    /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
    /^\d{2}-\d{2}-\d{4}$/, // MM-DD-YYYY
    /^\d{1,2}\/\d{1,2}\/\d{2}$/, // M/D/YY
  ]
  
  for (const format of dateFormats) {
    if (format.test(trimmed)) {
      const date = new Date(trimmed)
      if (!isNaN(date.getTime())) {
        return date
      }
    }
  }
  
  // Return as string
  return trimmed
}

// Map CSV headers to schema columns
const mapHeadersToSchema = (headers: string[], schema: CategorySchema): Map<number, string> => {
  const mapping = new Map<number, string>()
  const normalizedHeaders = headers.map(normalizeColumnName)
  const schemaKeys = schema.schema.map(col => col.key)
  
  headers.forEach((header, index) => {
    const normalized = normalizedHeaders[index]
    
    // Direct match
    if (schemaKeys.includes(normalized)) {
      mapping.set(index, normalized)
      return
    }
    
    // Handle common variations - Amazon Seller Central format
    const variations: Record<string, string[]> = {
      'order-id': ['order_id', 'orderid', 'order id'],
      'order-item-id': ['order_item_id', 'orderitemid', 'order item id'],
      'purchase-date': ['purchase_date', 'purchasedate', 'order_date', 'order date'],
      'payments-date': ['payments_date', 'paymentsdate', 'payment_date'],
      'reporting-date': ['reporting_date', 'reportingdate'],
      'promise-date': ['promise_date', 'promisedate'],
      'days-past-promise': ['days_past_promise', 'dayspastpromise'],
      'buyer-email': ['buyer_email', 'buyeremail', 'buyer email'],
      'buyer-name': ['buyer_name', 'buyername', 'buyer name'],
      'buyer-phone-number': ['buyer_phone_number', 'buyerphonenumber', 'buyer phone number'],
      'sku': ['product_sku', 'productsku'],
      'product-name': ['product_name', 'productname', 'title', 'product title'],
      'quantity-purchased': ['quantity_purchased', 'quantitypurchased', 'qty', 'quantity'],
      'quantity-shipped': ['quantity_shipped', 'quantityshipped'],
      'quantity-to-ship': ['quantity_to_ship', 'quantitytoship'],
      'ship-service-level': ['ship_service_level', 'shipservicelevel'],
      'recipient-name': ['recipient_name', 'recipientname'],
      'ship-address-1': ['ship_address_1', 'shipaddress1', 'address_1'],
      'ship-address-2': ['ship_address_2', 'shipaddress2', 'address_2'],
      'ship-address-3': ['ship_address_3', 'shipaddress3', 'address_3'],
      'ship-city': ['ship_city', 'shipcity', 'city'],
      'ship-state': ['ship_state', 'shipstate', 'state'],
      'ship-postal-code': ['ship_postal_code', 'shippostalcode', 'postal_code', 'pincode'],
      'ship-country': ['ship_country', 'shipcountry', 'country'],
      'is-business-order': ['is_business_order', 'isbusinessorder'],
      'purchase-order-number': ['purchase_order_number', 'purchaseordernumber'],
      'price-designation': ['price_designation', 'pricedesignation'],
      'is-iba': ['is_iba', 'isiba'],
      'verge-of-cancellation': ['verge_of_cancellation', 'vergeofcancellation'],
      'verge-of-lateShipment': ['verge_of_lateshipment', 'vergeoflateshipment', 'verge-of-lateshipment']
    }
    
    // Check variations
    for (const [schemaKey, variants] of Object.entries(variations)) {
      if (variants.includes(normalized) && schemaKeys.includes(schemaKey)) {
        mapping.set(index, schemaKey)
        return
      }
    }

    // Additional Purchase category variations (Amazon.com Business purchases)
    const purchaseVariations: Record<string, string[]> = {
      'po_id': ['po-number', 'po', 'po number', 'order-id', 'order id'],
      'order_date': ['order-date'],
      'supplier': ['seller-name', 'seller credentials', 'seller-credentials'],
      'asin': ['asin'],
      'sku': ['sku', 'part-number', 'item-model-number', 'part number', 'item model number'],
      'title': ['title', 'product title'],
      'qty': ['order-quantity', 'item-quantity', 'shipment-quantity', 'received-quantity'],
      'unit_cost': ['purchase-ppu', 'listed-ppu', 'unit-price', 'unit price'],
      'ship_to': ['shipping-address', 'ship-to', 'ship to'],
      'tracking': ['carrier-tracking', 'carrier-tracking-'],
      'carrier': ['carrier-name'],
      'invoice_no': ['po-line-item-id', 'invoice-no', 'invoice number']
    }

    for (const [schemaKey, variants] of Object.entries(purchaseVariations)) {
      if (variants.includes(normalized) && schemaKeys.includes(schemaKey)) {
        mapping.set(index, schemaKey)
        return
      }
    }
  })
  
  return mapping
}

// Normalize a row of data according to the schema
const normalizeRow = (row: string[], headerMapping: Map<number, string>, schema: CategorySchema): NormalizedRecord => {
  const record: NormalizedRecord = {}
  
  // Initialize all schema fields as null
  schema.schema.forEach(col => {
    record[col.key] = null
  })
  
  // Map values from CSV to schema
  row.forEach((value, index) => {
    const schemaKey = headerMapping.get(index)
    if (schemaKey) {
      record[schemaKey] = coerceValue(value, schemaKey)
    }
  })
  
  return record
}

// Validate required fields
const validateRequiredFields = (record: NormalizedRecord, schema: CategorySchema): string[] => {
  const errors: string[] = []
  
  schema.schema.forEach(col => {
    if (col.required && (record[col.key] === null || record[col.key] === '')) {
      errors.push(`Missing required field: ${col.label}`)
    }
  })
  
  return errors
}

// Detect file type and parse accordingly
const parseFile = async (file: File): Promise<{ headers: string[], rows: string[][] }> => {
  const text = await file.text()
  
  // Try to detect delimiter
  const firstLine = text.split('\n')[0]
  const commaCount = (firstLine.match(/,/g) || []).length
  const tabCount = (firstLine.match(/\t/g) || []).length
  
  let delimiter = ','
  if (tabCount > commaCount) {
    delimiter = '\t'
  }
  
  // Parse based on delimiter
  if (delimiter === '\t') {
    const result = parseCsv(text, { delimiter })
    return { headers: result.headers, rows: result.rows }
  }
  
  // Robust CSV parse (handles quotes, commas in fields)
  const { data, meta } = Papa.parse(text, { header: true, skipEmptyLines: true }) as any
  const headers: string[] = (meta?.fields || []).map((h: string) => h)
  const rows: string[][] = (data || []).map((row: Record<string, any>) => headers.map(h => (row[h] ?? '').toString()))
  return { headers, rows }
}

// Main import function
export const handleImportFile = async (
  categoryId: string,
  file: File,
  dispatch?: any
): Promise<ImportResult> => {
  const schema = getCategorySchema(categoryId)
  if (!schema) {
    return {
      success: false,
      rowsCount: 0,
      errors: [`Unknown category: ${categoryId}`],
      warnings: [],
      categoryId
    }
  }
  
  try {
    // Parse file
    const { headers, rows } = await parseFile(file)
    
    if (headers.length === 0) {
      return {
        success: false,
        rowsCount: 0,
        errors: ['No headers found in file'],
        warnings: [],
        categoryId
      }
    }
    
    // Map headers to schema
    const headerMapping = mapHeadersToSchema(headers, schema)
    const warnings: string[] = []
    
    // Check for unmapped headers
    const mappedHeaders = Array.from(headerMapping.values())
    const unmappedHeaders = headers.filter((_, index) => !headerMapping.has(index))
    
    if (unmappedHeaders.length > 0) {
      warnings.push(`Unmapped columns: ${unmappedHeaders.join(', ')}`)
    }
    
    // Normalize rows
    const normalizedRows: NormalizedRecord[] = []
    const errors: string[] = []
    
    rows.forEach((row, rowIndex) => {
      try {
        const normalized = normalizeRow(row, headerMapping, schema)
        // For purchase category, do not hard-fail on missing fields
        if (categoryId === 'purchase') {
          normalizedRows.push(normalized)
          return
        }
        const rowErrors = validateRequiredFields(normalized, schema)
        
        if (rowErrors.length > 0) {
          errors.push(`Row ${rowIndex + 2}: ${rowErrors.join(', ')}`)
        } else {
          normalizedRows.push(normalized)
        }
      } catch (error) {
        errors.push(`Row ${rowIndex + 2}: Failed to parse row`)
      }
    })
    
    // Call bulk ingestion system (always for purchase; else only when we have rows)
    if (normalizedRows.length > 0 || categoryId === 'purchase') {
      try {
        console.log('Starting bulk ingestion for', normalizedRows.length, 'rows')
        
        // Process the actual file data through the ingest system
        const ingestResult = await processBulkIngestion([{
          name: file.name,
          text: await file.text(), // Get the actual file content
          arrayBuffer: undefined
        }], categoryId)
        
        console.log('Bulk ingestion result:', ingestResult)
        
        // Store results in Redux (skip timeline update for purchase imports)
        if (ingestResult && dispatch && categoryId !== 'purchase') {
          dispatch(setTimelineData({
            timeline: ingestResult.timeline,
            summaries: ingestResult.summaries
          }))
          dispatch(setIngestResult(ingestResult))
        }
        // Always keep full ingest result for reconciliation panels
        if (ingestResult && dispatch && categoryId === 'purchase') {
          dispatch(setIngestResult(ingestResult))
        }
        
        // If this is a Purchase import, attempt to match purchase rows to existing orders by ASIN/SKU
        if (ingestResult && categoryId === 'purchase') {
          try {
            const prev = (store.getState() as any)?.orders?.ingestResult
            const prevOrderRows: any[] = prev?.tables?.orders?.rows || []
            const currentOrderRows: any[] = ingestResult?.tables?.orders?.rows || []
            // Prefer parsed purchases table; fallback to normalizedRows if not present
            const purchaseRows: any[] = (ingestResult as any)?.tables?.purchases?.rows?.length
              ? (ingestResult as any).tables.purchases.rows
              : (normalizedRows as any[])

            // Build a set of ASINs from existing orders (derive from SKU if needed)
            const asinFromSku = (sku?: string): string | null => {
              if (!sku) return null
              const m = sku.toUpperCase().match(/\bB0[A-Z0-9]{8}\b/)
              return m ? m[0] : null
            }
            const asinFromAny = (row: any): string | null => {
              return (
                (row['ASIN'] as string) ||
                (row['asin'] as string) ||
                asinFromSku(row['sku'] as string) ||
                null
              )
            }

            const orderAsins = new Set<string>()
            ;[...prevOrderRows, ...currentOrderRows].forEach((r) => {
              const a = asinFromAny(r)
              if (a) orderAsins.add(a.toUpperCase())
            })

            let matched = 0
            let unmatched = 0
            const examples: string[] = []
            purchaseRows.forEach((r) => {
              const a = asinFromAny(r)
              if (a && orderAsins.has(a.toUpperCase())) matched += 1
              else {
                unmatched += 1
                if (examples.length < 5) {
                  const title = (r['Title'] || r['title'] || '').toString().slice(0, 60)
                  examples.push(`${a || 'NO-ASIN'} — ${title}`)
                }
              }
            })

            if (purchaseRows.length > 0) {
              warnings.push(`Purchase match summary: ${matched}/${purchaseRows.length} matched by ASIN/SKU, ${unmatched} unmatched`)
            }
            if (unmatched > 0) {
              warnings.push(`Unmatched examples: ${examples.join(' | ')}`)
            }
          } catch (e) {
            // Non-blocking
            console.warn('Purchase matching failed:', e)
          }
        }
        
        // Set test hook for Playwright tests
        if (typeof window !== 'undefined') {
          (window as any).__test_lastImport = {
            category: categoryId,
            rowsCount: normalizedRows.length,
            timelineEvents: ingestResult?.events?.length || 0,
            orderSummaries: ingestResult?.summaries?.length || 0
          }
        }
      } catch (error) {
        console.error('Bulk ingestion error:', error)
        errors.push(`Bulk ingestion failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
    
    return {
      success: errors.length === 0 || normalizedRows.length > 0 || categoryId === 'purchase',
      rowsCount: normalizedRows.length,
      errors,
      warnings,
      categoryId
    }
    
  } catch (error) {
    return {
      success: false,
      rowsCount: 0,
      errors: [`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`],
      warnings: [],
      categoryId
    }
  }
}

// Process bulk ingestion
const processBulkIngestion = async (files: any[], categoryId: string): Promise<IngestResult | null> => {
  try {
    console.log('Processing bulk ingestion for category:', categoryId)
    console.log('Files received:', files.length)
    
    // Process through the ingest system
    const result = await ingestFiles(files)
    console.log('Ingest result:', result)
    
    // If the ingest system doesn't return proper results, create timeline data from the file content
    // Only do this fallback for sales (orders) to avoid polluting timeline from purchases
    if ((!result || result.events.length === 0) && categoryId === 'sales') {
      console.log('Creating timeline data from file content...')
      
      const timeline: Record<string, TimelineEvent[]> = {}
      const summaries: OrderSummary[] = []
      const allEvents: TimelineEvent[] = []
      
      for (const file of files) {
        try {
          // Parse the TSV content
          const lines = file.text.split('\n').filter(line => line.trim() !== '')
          if (lines.length < 2) continue // Need at least header + 1 data row
          
          const headers = lines[0].split('\t')
          const dataRows = lines.slice(1)
          
          console.log('Headers:', headers)
          console.log('Data rows:', dataRows.length)
          
          dataRows.forEach((row, index) => {
            const values = row.split('\t')
            const rowData: any = {}
            
            headers.forEach((header, i) => {
              rowData[header.trim()] = values[i]?.trim() || ''
            })
            
            // Extract order ID
            const orderId = rowData['order-id'] || `ORDER-${index + 1}`
            
            // Create timeline event
            const event: TimelineEvent = {
              orderId,
              at: rowData['purchase-date'] || new Date().toISOString(),
              type: 'ORDERED',
              source: 'amazon_orders_tsv',
              amount: parseFloat(rowData['quantity-purchased'] || '0') * 100, // Sample amount
              currency: 'INR',
              details: {
                sku: rowData['sku'] || '',
                productName: rowData['product-name'] || '',
                buyerEmail: rowData['buyer-email'] || '',
                shipCity: rowData['ship-city'] || '',
                shipState: rowData['ship-state'] || ''
              }
            }
            
            // Add to timeline
            if (!timeline[orderId]) {
              timeline[orderId] = []
            }
            timeline[orderId].push(event)
            allEvents.push(event)
            
            // Create summary
            const summary: OrderSummary = {
              orderId,
              firstSeen: event.at,
              lastSeen: event.at,
              branch: 'awaiting_payment',
              paidToDate: 0,
              refundedToDate: 0,
              delta: 0,
              flags: []
            }
            
            summaries.push(summary)
          })
          
        } catch (error) {
          console.error('Error processing file:', error)
        }
      }
      
      console.log('Created timeline with', Object.keys(timeline).length, 'orders')
      console.log('Created', summaries.length, 'summaries')
      
      return {
        tables: {
          orders: { columns: [], rows: [] },
          transactions: { columns: [], rows: [] },
          intlShipments: { columns: [], rows: [] },
          natShipments: { columns: [], rows: [] },
          cancellations: { columns: [], rows: [] }
        },
        events: allEvents,
        timeline,
        summaries
      }
    }
    
    return result
  } catch (error) {
    console.error('Bulk ingestion processing error:', error)
    return null
  }
}

// Download template function
export const downloadTemplate = (categoryId: string): void => {
  const schema = getCategorySchema(categoryId)
  if (!schema) return
  
  const headers = schema.schema.map(col => col.label)
  const examples = schema.schema.map(col => col.example || '')
  
  const csvContent = [headers.join(','), examples.join(',')].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = `${categoryId}-template.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
