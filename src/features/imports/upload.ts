// Cache-busting version: 2025-01-08-cleanup
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
import { processImportsDataForTimeline } from '../timeline/timelineProcessor'
import { normId, canonHeader } from '../../lib/glueNormalize'
import type { LinkHint } from '../../types/linkHints'
import { importInternationalShipping } from '../../lib/glueImport'

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

// 1) Ensure the CSV parser does NOT coerce types (keeps "ARB_..." as string)
const PARSE_OPTS = {
  header: true,
  skipEmptyLines: true,
  dynamicTyping: false,            // <— important
  transformHeader: (h: string) => h.trim(),
};

// Normalize category keys to prevent drift (more robust)
function normalizeCategoryKey(categoryId: string) {
  const k = (categoryId || '').toLowerCase().trim();
  if (k.includes('international') || k.includes('shipping') || k === 'glue') return 'glue';
  if (k.startsWith('purch')) return 'purchase';
  if (k.startsWith('sale')) return 'sales';
  if (k === 'buy' || k === 'procurement') return 'purchase';
  return k; // fall back, but keep it lowercase
}

// Old glue processing function removed - now using comprehensive importInternationalShipping

// 2) After you map headers to schema, normalize per category
function normalizeImportedRow(row: any, category: "sales" | "purchase" | string) {
  // keep original value safe
  // ASIN/SKU normalization removed - glue-only matching
  
  return row;
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

  // Special handling for SKU fields - always keep as string
  if (key.toLowerCase().includes('sku') || key.toLowerCase().includes('asin')) {
    return trimmed
  }

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
  
  // Create a map of schema keys to their normalized versions
  const schemaKeyMap = new Map<string, string>()
  schema.schema.forEach(col => {
    schemaKeyMap.set(normalizeColumnName(col.key), col.key)
  })
  
  // Map headers to schema columns
  normalizedHeaders.forEach((header, index) => {
    if (schemaKeyMap.has(header)) {
      mapping.set(index, schemaKeyMap.get(header)!)
    } else {
      // For any unmapped columns, use the original header as the key
      mapping.set(index, headers[index])
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

// Flexible import function that handles any columns and skips empty ones
const flexibleImport = (file: File, categoryId: string, sourceInfo?: any): Promise<ImportResult> => {
  return new Promise(async (resolve) => {
    try {
      console.log(`🔄 Starting flexible import for ${categoryId}:`, file.name)
      
      const text = await file.text()
      const lines = text.split('\n').filter((line: string) => line.trim() !== '')
      
      if (lines.length < 2) {
        resolve({
          success: false,
          rowsCount: 0,
          errors: ['File must contain at least a header row and one data row'],
          warnings: [],
          categoryId
        })
        return
      }
      
      // Use the existing parseFile function to handle both CSV and TSV files properly
      const { headers, rows: dataRows } = await parseFile(file)
      
      console.log(`📊 Found ${headers.length} columns and ${dataRows.length} rows`)
      console.log('Headers:', headers.slice(0, 10)) // Show first 10 headers
      
      const normalizedRows: NormalizedRecord[] = []
      const warnings: string[] = []
      
      dataRows.forEach((values: string[], rowIndex: number) => {
        const rowData: NormalizedRecord = {}
        let hasData = false
        
        headers.forEach((header: string, colIndex: number) => {
          const rawValue = values[colIndex]
          const value = (typeof rawValue === 'string' ? rawValue : String(rawValue || '')).trim()
          
          // Skip empty columns
          if (value === '' || value === null || value === undefined) {
            return
          }
          
          // Normalize column name and map to schema key
          const normalizedHeader = normalizeColumnName(header)
          
          // For SKU fields, ensure we use the correct schema key
          const fieldKey = normalizedHeader === 'sku' ? 'sku' : normalizedHeader
          
          // Debug: Log SKU processing
          if (fieldKey === 'sku') {
          }
          
          // Coerce value to appropriate type
          const coercedValue = coerceValue(value, fieldKey)
          
          if (coercedValue !== null) {
            rowData[fieldKey] = coercedValue
            hasData = true
            
            // Debug: Log final SKU value
            if (fieldKey === 'sku') {
            }
          }
        })
        
        // Only add rows that have at least some data
        if (hasData) {
          // Add source information if provided
          if (sourceInfo) {
            rowData.source = sourceInfo
          }
          
          // Apply ASIN normalization
          const normalizedRow = normalizeImportedRow(rowData, categoryId)
          normalizedRows.push(normalizedRow)
        } else {
          warnings.push(`Row ${rowIndex + 2} skipped - no data found`)
        }
      })
      
      
      // Store in timeline data
      if (normalizedRows.length > 0) {
        const store = (await import('../../app/store')).store
        
        // Normalize category key to prevent drift
        const categoryKey = normalizeCategoryKey(categoryId);
        console.log(`[imports] Normalizing category: ${categoryId} -> ${categoryKey}`);
        
        // Special handling for glue category using comprehensive import function
        if (categoryKey === 'glue' || categoryKey === 'international-shipping') {
          try {
            const result = await importInternationalShipping(file);
            console.log(`[imports] Glue import result:`, result);

            // Rebuild timeline using glue-only processor after successful glue import
            try {
              const currentState = store.getState();
              const timelineData = currentState.imports?.timelineData;
              if (timelineData) {
                const rebuilt = processImportsDataForTimeline(timelineData);
                store.dispatch(setTimeline(rebuilt));
              }
            } catch (rebuildErr) {
              console.warn('Timeline rebuild after glue import failed:', rebuildErr);
            }
            
            resolve({
              success: result.ok,
              rowsCount: result.ok ? result.details?.counts?.total || 0 : 0,
              errors: result.ok ? [] : [result.message],
              warnings: result.ok ? [] : [result.message],
              categoryId
            });
            return;
          } catch (error) {
            console.error('[imports] Glue import error:', error);
            resolve({
              success: false,
              rowsCount: 0,
              errors: [`Glue import failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
              warnings: [],
              categoryId
            });
            return;
          }
        }
        
        store.dispatch(addTimelineData({
          category: categoryKey,
          rows: normalizedRows
        }))
        
        // Pre-flight check: Show ASIN coverage
        const rowsWithAsin = normalizedRows.filter(r => !!r.asin).length;
        console.log(`[imports] ASIN coverage — ${categoryKey}: ${rowsWithAsin}/${normalizedRows.length} rows have ASIN`);
        if (rowsWithAsin !== normalizedRows.length) {
          console.warn(`[imports] missing ASIN — ${categoryKey}: ${rowsWithAsin}/${normalizedRows.length} rows have ASIN`);
        }
        
        // Rebuild timeline using our new processor with ALL available data
        try {
          const currentState = store.getState()
          const timelineData = currentState.imports?.timelineData
          
          if (timelineData) {
            console.log('🔄 Rebuilding timeline with ALL available data...')
            console.log(`📊 Available data: Sales=${timelineData.sales?.length || 0}, Purchase=${timelineData.purchase?.length || 0}`)
            
            // Use our new timeline processor that handles ASIN extraction properly
            const timeline = processImportsDataForTimeline(timelineData)
            store.dispatch(setTimeline(timeline))
            
            console.log(`📊 Timeline result: ${Object.keys(timeline.byOrder).length} orders, ${timeline.orphan.length} orphan events`)
            
            // Show success message
            if (Object.keys(timeline.byOrder).length > 0) {
              console.log(`🎉 SUCCESS: Created ${Object.keys(timeline.byOrder).length} unified orders!`)
            }
          }
        } catch (error) {
          console.warn('Timeline rebuild failed:', error)
          warnings.push('Timeline rebuild failed - data imported but not linked')
        }
      }
      
      resolve({
        success: normalizedRows.length > 0,
        rowsCount: normalizedRows.length,
        errors: [],
        warnings,
        categoryId
      })
      
    } catch (error) {
      console.error('Flexible import error:', error)
      resolve({
        success: false,
        rowsCount: 0,
        errors: [`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
        categoryId
      })
    }
  })
}

// Main import function
export const importFile = async (
  file: File,
  categoryId: string,
  sourceInfo?: any
): Promise<ImportResult> => {
  try {
    console.log(`🚀 Starting import for ${categoryId}:`, file.name)
    
    // Use flexible import for all categories
    return await flexibleImport(file, categoryId, sourceInfo)
    
  } catch (error) {
    console.error('Import error:', error)
    return {
      success: false,
      rowsCount: 0,
      errors: [`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
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
