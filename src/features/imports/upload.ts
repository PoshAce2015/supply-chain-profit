import { parseCsv } from '../../lib/csv/parse'
import * as Papa from 'papaparse'
import { getCategorySchema, CategorySchema } from './categorySchemas'
import { ingestFiles, IngestResult, TimelineEvent, OrderSummary } from '../../lib/imports/ingest'
import { setTimelineData, setIngestResult } from '../orders/ordersSlice'
import { store } from '../../app/store'
import { PurchaseVendorId, normalizeDomain } from '../../types/purchase'
import { buildTimeline } from '../timeline/stitcher'
import { setTimeline } from '../timeline/timelineSlice'
import { addTimelineData } from './importsSlice'

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

type ImportMeta = {
  source?: any; // keep existing
  purchaseSource?: { vendor?: string; domain?: string };
};

function normalizeVendor(v?: string): PurchaseVendorId {
  const s = (v || '').toLowerCase().trim();
  if (s.includes('amazon')) return 'amazon_com';
  if (s.includes('walmart')) return 'walmart_com';
  if (s.includes('ebay'))   return 'ebay_com';
  if (s.includes('newegg')) return 'newegg_com';
  if (s === 'custom')       return 'custom';
  return 'custom';
}

function normalizeRowVendor(row: any): { vendor: PurchaseVendorId; domain?: string } | undefined {
  // Accept row.vendor, row.source, row.website, or row.domain from legacy files
  const vendorStr = row.vendor ?? row.source ?? row.website;
  const domainStr = row.domain ?? row.store_domain ?? row.merchant_domain;
  if (!vendorStr && !domainStr) return undefined;
  const vendor = normalizeVendor(vendorStr);
  const domain =
    vendor === 'custom'
      ? normalizeDomain(String(domainStr || '')) // custom rows require domain
      : undefined;
  return { vendor, domain: domain || undefined };
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

  // Try to parse as currency/number (handles $/€/£/₹, commas, and parentheses for negatives)
  const numericCandidateRaw = trimmed.replace(/[,]/g, '')
  const parenNegative = /^\(.*\)$/.test(trimmed)
  const numericClean = numericCandidateRaw.replace(/[^0-9.-]/g, '')
  if (numericClean !== '' && numericClean !== '.' && numericClean !== '-' && numericClean !== '-.') {
    let num = Number(numericClean)
    if (!Number.isNaN(num)) {
      if (parenNegative) num = -Math.abs(num)
      return num
    }
  }
  
  // Try to parse as date (multiple formats) but return as ISO string for Redux compatibility
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}$/i,                               // YYYY-MM-DD
    /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}.*$/i,     // ISO-like with time
    /^\d{1,2}\/\d{1,2}\/\d{4}(?:[ T]\d{1,2}:\d{2}(?::\d{2})?\s?(?:AM|PM)?)?$/i, // M/D/YYYY with optional time
    /^\d{1,2}-\d{1,2}-\d{4}$/i                            // M-D-YYYY
  ]
  for (const pattern of datePatterns) {
    if (pattern.test(trimmed)) {
      const d = new Date(trimmed)
      if (!isNaN(d.getTime())) return d.toISOString() // Return as ISO string instead of Date object
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
      'supplier': ['seller-name', 'seller credentials', 'seller-credentials', 'seller'],
      'asin': ['asin'],
      'sku': ['sku', 'part-number', 'item-model-number', 'part number', 'item model number'],
      'title': ['title', 'product title'],
      'qty': ['order-quantity', 'item-quantity', 'shipment-quantity', 'received-quantity'],
      'unit_cost': ['purchase-ppu', 'listed-ppu', 'unit-price', 'unit price', 'item-net-total', 'item_net_total'],
      'ship_to': ['shipping-address', 'ship-to', 'ship to'],
      'tracking': ['carrier-tracking', 'carrier-tracking-', 'tracking-number', 'tracking_no', 'tracking no', 'trackingnumber'],
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
  dispatch?: any,
  meta?: ImportMeta
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
    
    // Check for unmapped headers (filter noisy known purchase fields)
    const normalizedHeaders = headers.map(normalizeColumnName)
    const unmappedIndexes = normalizedHeaders
      .map((h, i) => ({ h, i }))
      .filter(({ i }) => !headerMapping.has(i))

    const ignoredPurchaseHeaders = new Set<string>([
      'account-group','currency','order-subtotal','order-shipping-handling','order-promotion','order-tax','order-net-total','order-status','approver','account-user','account-user-email',
      'shipment-date','shipment-status','delivery-status','expected-delivery-date','shipment-subtotal','shipment-shipping-handling','shipment-promotion','shipment-tax','shipment-net-total',
      'amazon-internal-product-category','unspsc','segment','family','class','commodity','brand-code','brand','manufacturer','national-stock-number','product-condition','company-compliance',
      'item-subtotal','item-shipping-handling','item-promotion','item-tax','item-net-total','tax-exemption-applied','tax-exemption-type','tax-exemption-opt-out','pricing-savings-program','pricing-discount-applied',
      'receiving-status','received-date','receiver-name','receiver-email','gl-code','department','cost-center','project-code','location','custom-field-1'
    ])

    const unmappedHeaders = (categoryId === 'purchase')
      ? unmappedIndexes
          .filter(({ h }) => !ignoredPurchaseHeaders.has(h))
          .map(({ i }) => headers[i])
      : unmappedIndexes.map(({ i }) => headers[i])
    
    // For purchase imports, suppress unmapped warnings entirely to avoid noise from Amazon Business extras
    if (unmappedHeaders.length > 0 && categoryId !== 'purchase') {
      warnings.push(`Unmapped columns: ${unmappedHeaders.join(', ')}`)
    }
    
    // Normalize rows
    let normalizedRows: NormalizedRecord[] = []
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

    // Back-compat shim for any old combined IDs
    function normalizeSource(raw?: { channel?: string; orderClass?: string } | string) {
      // Accept legacy strings like "flipkart_b2b" or "amazon_in_b2c"
      if (typeof raw === 'string') {
        const low = raw.toLowerCase();
        const fromCombo = (combo: string) => {
          if (combo.startsWith('flipkart')) return { channel:'flipkart' as const, orderClass: combo.includes('b2b') ? 'b2b' : combo.includes('b2c') ? 'b2c' : undefined };
          if (combo.startsWith('amazon'))   return { channel:'amazon_in' as const, orderClass: combo.includes('b2b') ? 'b2b' : combo.includes('b2c') ? 'b2c' : undefined };
          if (combo.startsWith('poshace'))  return { channel:'poshace' as const, orderClass: combo.includes('b2b') ? 'b2b' : combo.includes('b2c') ? 'b2c' : undefined };
          if (combo.startsWith('website'))  return { channel:'website' as const, orderClass: combo.includes('b2b') ? 'b2b' : combo.includes('b2c') ? 'b2c' : undefined };
          return { channel:'other' as const, orderClass: undefined };
        };
        return fromCombo(low);
      }
      const ch = raw?.channel as any;
      const oc = raw?.orderClass as any;
      const allowedCh = ['amazon_in','flipkart','poshace','website','other'];
      const allowedOc = ['b2b','b2c'];
      return {
        channel: allowedCh.includes(ch) ? ch : 'other',
        orderClass: allowedOc.includes(oc) ? oc : undefined
      } as { channel: 'amazon_in'|'flipkart'|'poshace'|'website'|'other'; orderClass?: 'b2b'|'b2c' };
    }

    if (categoryId === 'sales') {
      const src = normalizeSource(meta?.source ?? 'other');
      normalizedRows = normalizedRows.map(r => {
        // If legacy r.source exists as string like "flipkart_b2b", normalize it; 
        // else stamp from meta:
        const existing = (r as any).source;
        const stamped = existing ? normalizeSource(existing) : src;
        return { ...r, source: stamped };
      });
    }

    if (categoryId === 'purchase') {
      const fromMeta = meta?.purchaseSource
        ? {
            vendor: normalizeVendor(meta.purchaseSource.vendor),
            domain:
              normalizeVendor(meta.purchaseSource.vendor) === 'custom'
                ? normalizeDomain(meta.purchaseSource.domain || '')
                : undefined
          }
        : undefined;

      normalizedRows = normalizedRows.map(r => {
        const legacy = normalizeRowVendor(r);
        const stamped = legacy ?? fromMeta;
        return stamped ? { ...r, purchaseSource: stamped } : r;
      });
    }
    
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

        // Store imported rows for timeline stitching (AFTER bulk ingestion)
        if (dispatch && normalizedRows.length > 0) {
          console.log(`📥 Storing ${normalizedRows.length} rows for category: ${categoryId}`);
          dispatch(addTimelineData({
            category: categoryId,
            rows: normalizedRows
          }))
          
          // Debug: Check what was actually stored
          setTimeout(() => {
            const currentState = store.getState();
            const storedData = currentState.imports?.timelineData?.[categoryId];
            console.log(`📊 Verified storage for ${categoryId}:`, storedData?.length || 0, 'rows');
            
            // Also check all categories to see if any data was lost
            const allTimelineData = currentState.imports?.timelineData;
            if (allTimelineData) {
              Object.keys(allTimelineData).forEach(cat => {
                const count = allTimelineData[cat]?.length || 0;
                if (count > 0) {
                  console.log(`📊 Category ${cat}: ${count} rows`);
                }
              });
            }
          }, 100);
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
            sample: normalizedRows[0],
            timelineEvents: ingestResult?.events?.length || 0,
            orderSummaries: ingestResult?.summaries?.length || 0
          }
        }

        // Rebuild timeline after successful import
        try {
          console.log('🔄 Rebuilding timeline...');
          const currentState = store.getState();
          console.log('🔍 Current state before rebuild:', {
            sales: currentState.imports?.timelineData?.sales?.length || 0,
            purchase: currentState.imports?.timelineData?.purchase?.length || 0
          });
          
          const all = selectAllImportedRowsByCategory(currentState);
          console.log('📊 Collected data for timeline:', all);
          
          if (all.length === 0) {
            console.log('⚠️ No data found for timeline rebuilding');
            console.log('🔍 Debugging state structure:');
            console.log('- imports.timelineData:', currentState.imports?.timelineData);
            console.log('- imports.byCategory:', currentState.imports?.byCategory);
            console.log('- orders.ingestResult:', currentState.orders?.ingestResult);
          } else {
            console.log('📊 Sample data from first category:', all[0]);
            const timeline = buildTimeline(all);
            console.log('📈 Built timeline:', timeline);
            store.dispatch(setTimeline(timeline));
            console.log('✅ Timeline updated in store');
          }
        } catch (error) {
          console.warn('Timeline rebuild failed:', error);
          console.error('Full error:', error);
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

// Selector to get all imported rows by category
function selectAllImportedRowsByCategory(state: any) {
  const out: { category: string; rows: any[] }[] = [];
  
  console.log('🔍 Checking timeline data structure...');
  
  // Get data from the new timeline data structure (this is where we store it)
  const timelineData = state.imports?.timelineData;
  console.log('Timeline data:', timelineData);
  
  if (timelineData) {
    for (const [category, rows] of Object.entries(timelineData)) {
      if (Array.isArray(rows) && rows.length > 0) {
        console.log(`📁 Found ${rows.length} rows for category: ${category}`);
        out.push({ category, rows });
      }
    }
  }
  
  console.log('📊 Total data collected:', out);
  return out;
}
