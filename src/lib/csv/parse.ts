export interface ParsedCsv {
  headers: string[]
  rows: string[][]
}

export function parseCsv(text: string): ParsedCsv {
  const lines = text.split('\n').filter(line => line.trim() !== '')
  
  if (lines.length === 0) {
    return { headers: [], rows: [] }
  }

  const firstLine = lines[0]
  if (!firstLine) {
    return { headers: [], rows: [] }
  }

  const headers = firstLine.split(',').map(h => h.trim())
  const dataRows = lines.slice(1).map(line => 
    line.split(',').map(cell => cell.trim())
  )

  return {
    headers,
    rows: dataRows,
  }
}
