import * as XLSX from 'xlsx'

export interface ParsedCsv {
  headers: string[]
  rows: string[][]
}

export interface ParseOptions {
  delimiter?: string
}

export function parseCsv(text: string, options: ParseOptions = {}): ParsedCsv {
  const delimiter = options.delimiter || ','
  const lines = text.split('\n').filter(line => line.trim() !== '')
  
  if (lines.length === 0) {
    return { headers: [], rows: [] }
  }

  const firstLine = lines[0]
  if (!firstLine) {
    return { headers: [], rows: [] }
  }

  const headers = firstLine.split(delimiter).map(h => h.trim())
  const dataRows = lines.slice(1).map(line => 
    line.split(delimiter).map(cell => cell.trim())
  )

  return {
    headers,
    rows: dataRows,
  }
}

// New Excel parsing functions
export function parseExcel(file: File): Promise<ParsedCsv> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        
        // Get the first worksheet
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        
        // Convert to JSON with headers
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][]
        
        if (jsonData.length === 0) {
          resolve({ headers: [], rows: [] })
          return
        }
        
        const headers = jsonData[0].map(h => String(h || '').trim())
        const rows = jsonData.slice(1).map(row => 
          row.map(cell => String(cell || '').trim())
        )
        
        resolve({ headers, rows })
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${error}`))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read Excel file'))
    }
    
    reader.readAsArrayBuffer(file)
  })
}

export function detectFileType(file: File): 'csv' | 'excel' | 'unknown' {
  const fileName = file.name.toLowerCase()
  const fileExtension = fileName.split('.').pop()
  
  if (fileExtension === 'csv' || fileExtension === 'txt' || fileExtension === 'tsv') {
    return 'csv'
  }
  
  if (fileExtension === 'xlsx' || fileExtension === 'xls') {
    return 'excel'
  }
  
  return 'unknown'
}

export function parseFile(file: File, options: ParseOptions = {}): Promise<ParsedCsv> {
  const fileType = detectFileType(file)
  
  if (fileType === 'excel') {
    return parseExcel(file)
  } else if (fileType === 'csv') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string
          const result = parseCsv(text, options)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  } else {
    return Promise.reject(new Error(`Unsupported file type: ${file.name}`))
  }
}
