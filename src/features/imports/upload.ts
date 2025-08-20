import { parseCsv } from '../../lib/csv/parse'
import { getCategorySchema, CategorySchema } from './categorySchemas'

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
  return column.toLowerCase().trim().replace(/\s+/g, '_')
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
    if (schemaKeys.includes(normalized)) {
      mapping.set(index, normalized)
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
  
  // Parse CSV
  const result = parseCsv(text, { delimiter })
  return {
    headers: result.headers,
    rows: result.rows
  }
}

// Main import function
export const handleImportFile = async (
  categoryId: string, 
  file: File
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
    
    // Call existing domain importer (placeholder for now)
    // In a real implementation, this would call the existing ingest function
    if (normalizedRows.length > 0) {
      // TODO: Replace with actual domain importer call
      console.log(`Importing ${normalizedRows.length} rows for category ${categoryId}:`, normalizedRows)
      
      // Set test hook for Playwright tests
      if (typeof window !== 'undefined') {
        (window as any).__test_lastImport = {
          category: categoryId,
          rowsCount: normalizedRows.length
        }
      }
    }
    
    return {
      success: errors.length === 0 || normalizedRows.length > 0,
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
