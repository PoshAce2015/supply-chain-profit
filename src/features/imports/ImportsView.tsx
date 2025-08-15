import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { FileType } from '../../lib/types'
import { parseCsv } from '../../lib/csv/parse'
import { selectMappings } from './selectors'
import { useMappings, useIngest } from './hooks'
import HeaderMapper from './components/HeaderMapper'
import { CSV_TEMPLATES } from './templates'

interface FileData {
  headers: string[]
  sampleRowCount: number
  text: string
}

const ImportsView: React.FC = () => {
  const [fileData, setFileData] = useState<Record<FileType, FileData | null>>({
    keepa: null,
    indiaListings: null,
    uspo: null,
    events: null,
    settlement: null,
  })

  const mappings = useSelector(selectMappings)
  const { setMapping } = useMappings()
  const { ingest } = useIngest()

  const downloadTemplate = (fileType: FileType) => {
    const template = CSV_TEMPLATES[fileType]
    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${fileType}-template.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportMappings = () => {
    const dataStr = JSON.stringify(mappings, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mappings.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const importMappings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedMappings = JSON.parse(e.target?.result as string)
        Object.entries(importedMappings).forEach(([fileType, mapping]) => {
          setMapping(fileType as FileType, mapping as Record<string, string>)
        })
      } catch (error) {
        console.error('Failed to import mappings:', error)
        alert('Failed to import mappings. Please check the file format.')
      }
    }
    reader.readAsText(file)
  }

  const handleFileSelect = async (fileType: FileType, file: File) => {
    const text = await file.text()
    const { headers, rows } = parseCsv(text)
    
    setFileData(prev => ({
      ...prev,
      [fileType]: {
        headers,
        sampleRowCount: rows.length,
        text,
      },
    }))
  }

  const handleSaveMapping = (fileType: FileType, mapping: Record<string, string>) => {
    setMapping(fileType, mapping)
  }

  const handleIngest = (fileType: FileType) => {
    const data = fileData[fileType]
    if (data) {
      ingest(fileType, data.text)
    }
  }

  const fileTypes: { type: FileType; label: string }[] = [
    { type: 'keepa', label: 'Keepa' },
    { type: 'indiaListings', label: 'India Listings' },
    { type: 'uspo', label: 'US POs' },
    { type: 'events', label: 'Events' },
    { type: 'settlement', label: 'Settlement' },
  ]

  return (
    <div data-testid="imports-view" className="space-y-8">
      <h1 className="text-2xl font-bold">CSV Imports</h1>
      
      {/* Templates and Mappings Section */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Templates & Mappings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Download Templates */}
          <div>
            <h3 className="font-medium mb-2">Download CSV Templates</h3>
            <div className="space-y-2">
              {fileTypes.map(({ type, label }) => (
                <button
                  key={type}
                  onClick={() => downloadTemplate(type)}
                  className="block w-full px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded border border-blue-200 hover:bg-blue-100"
                >
                  Download {label} Template
                </button>
              ))}
            </div>
          </div>
          
          {/* Export/Import Mappings */}
          <div>
            <h3 className="font-medium mb-2">Mappings Management</h3>
            <div className="space-y-2">
              <button
                onClick={exportMappings}
                data-testid="export-mappings"
                className="block w-full px-3 py-2 text-sm bg-green-50 text-green-700 rounded border border-green-200 hover:bg-green-100"
              >
                Export Mappings
              </button>
              <div>
                <input
                  type="file"
                  accept=".json"
                  onChange={importMappings}
                  data-testid="import-mappings"
                  className="hidden"
                  id="import-mappings-input"
                />
                <label
                  htmlFor="import-mappings-input"
                  className="block w-full px-3 py-2 text-sm bg-yellow-50 text-yellow-700 rounded border border-yellow-200 hover:bg-yellow-100 text-center cursor-pointer"
                >
                  Import Mappings
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {fileTypes.map(({ type, label }) => (
        <div key={type} className="border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">{label}</h2>
          
          <div className="mb-4">
            <input
              type="file"
              accept=".csv"
              data-testid={`file-${type}`}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  handleFileSelect(type, file)
                }
              }}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {fileData[type] && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Headers ({fileData[type]!.headers.length})</h3>
                <div className="text-sm text-gray-600">
                  {fileData[type]!.headers.join(', ')}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Sample rows: {fileData[type]!.sampleRowCount}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Field Mapping</h3>
                <HeaderMapper
                  headers={fileData[type]!.headers}
                  mapping={mappings[type] || {}}
                  onChange={(mapping) => handleSaveMapping(type, mapping)}
                />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleSaveMapping(type, mappings[type] || {})}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Mapping
                </button>
                <button
                  onClick={() => handleIngest(type)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Ingest
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default ImportsView
