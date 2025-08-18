import React, { useState, useCallback, useEffect } from 'react'
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
  rows: string[][]
}

interface UploadState {
  isDragging: boolean
  isUploading: boolean
  progress: number
}

interface ImportStep {
  id: string
  title: string
  description: string
  status: 'pending' | 'active' | 'completed' | 'error'
  error?: string
}

interface ImportHistory {
  id: string
  fileType: FileType
  fileName: string
  timestamp: Date
  status: 'success' | 'error' | 'processing'
  rowsProcessed: number
  errors: string[]
}

// Priority 3: Advanced Features - Batch Import
interface BatchImportJob {
  id: string
  name: string
  files: Array<{
    fileType: FileType
    fileName: string
    status: 'pending' | 'processing' | 'completed' | 'error'
    progress: number
  }>
  status: 'pending' | 'running' | 'completed' | 'failed'
  createdAt: Date
  completedAt?: Date
  totalFiles: number
  completedFiles: number
}

// Priority 3: Advanced Features - Data Transformation
interface DataTransformation {
  id: string
  name: string
  type: 'filter' | 'map' | 'aggregate' | 'format'
  config: Record<string, any>
  enabled: boolean
}

// Priority 3: Performance Optimizations - Import Metrics
interface ImportMetrics {
  startTime: number
  endTime?: number
  duration?: number
  rowsProcessed: number
  memoryUsage: number
  fileSize: number
  processingSpeed: number // rows per second
}

const ImportsView: React.FC = () => {
  const [fileData, setFileData] = useState<Record<FileType, FileData | null>>({
    keepa: null,
    indiaListings: null,
    uspo: null,
    events: null,
    settlement: null,
  })

  const [uploadStates, setUploadStates] = useState<Record<FileType, UploadState>>({
    keepa: { isDragging: false, isUploading: false, progress: 0 },
    indiaListings: { isDragging: false, isUploading: false, progress: 0 },
    uspo: { isDragging: false, isUploading: false, progress: 0 },
    events: { isDragging: false, isUploading: false, progress: 0 },
    settlement: { isDragging: false, isUploading: false, progress: 0 },
  })

  const [activeTab, setActiveTab] = useState<FileType>('keepa')
  const [showPreview, setShowPreview] = useState<Record<FileType, boolean>>({
    keepa: false,
    indiaListings: false,
    uspo: false,
    events: false,
    settlement: false,
  })

  // Priority 2: Enhanced User Experience - Import Wizard
  const [showWizard, setShowWizard] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [importSteps, setImportSteps] = useState<ImportStep[]>([
    { id: 'upload', title: 'Upload File', description: 'Select and upload your CSV file', status: 'pending' },
    { id: 'validate', title: 'Validate Data', description: 'Check data format and structure', status: 'pending' },
    { id: 'map', title: 'Map Fields', description: 'Map CSV columns to system fields', status: 'pending' },
    { id: 'review', title: 'Review & Confirm', description: 'Review settings and confirm import', status: 'pending' },
    { id: 'import', title: 'Import Data', description: 'Process and import your data', status: 'pending' }
  ])

  // Priority 2: Data Management Features - Import History
  const [importHistory, setImportHistory] = useState<ImportHistory[]>([])
  const [showHistory, setShowHistory] = useState(false)

  // Priority 2: Enhanced User Experience - Error Handling
  const [errors, setErrors] = useState<Record<FileType, string[]>>({
    keepa: [],
    indiaListings: [],
    uspo: [],
    events: [],
    settlement: [],
  })

  const [showHelp, setShowHelp] = useState(false)

  // Priority 3: Advanced Features - Batch Import
  const [batchJobs, setBatchJobs] = useState<BatchImportJob[]>([])
  const [showBatchManager, setShowBatchManager] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<Array<{ fileType: FileType; file: File }>>([])

  // Priority 3: Advanced Features - Data Transformation
  const [transformations, setTransformations] = useState<DataTransformation[]>([])
  const [showTransformations, setShowTransformations] = useState(false)

  // Priority 3: Performance Optimizations - Import Metrics
  const [importMetrics, setImportMetrics] = useState<Record<string, ImportMetrics>>({})
  const [showMetrics, setShowMetrics] = useState(false)

  // Priority 3: User Experience Enhancements - Settings
  const [userSettings, setUserSettings] = useState({
    autoSave: true,
    showPreview: true,
    enableNotifications: true,
    darkMode: false,
    batchSize: 1000
  })

  const mappings = useSelector(selectMappings)
  const { setMapping } = useMappings()
  const { ingest } = useIngest()

  // Set page title and verify we're on the right page
  useEffect(() => {
    document.title = 'CSV Data Imports - Supply Chain & Profit 1.0'
    
    // Verify we're on the imports page
    if (window.location.pathname !== '/imports') {
      console.warn('ImportsView mounted but not on /imports path:', window.location.pathname)
    }
  }, [])

  // Breadcrumb navigation
  const breadcrumbs = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'CSV Imports', href: '/imports', current: true }
  ]

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

  // Priority 2: Enhanced User Experience - File Validation
  const validateFile = (file: File, fileType: FileType): string[] => {
    const validationErrors: string[] = []
    
    // File type validation
    if (!file.name.toLowerCase().endsWith('.csv')) {
      validationErrors.push('File must be a CSV file')
    }
    
    // File size validation (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      validationErrors.push('File size must be less than 10MB')
    }
    
    // File name validation
    if (file.name.length > 100) {
      validationErrors.push('File name is too long (max 100 characters)')
    }
    
    return validationErrors
  }

  const handleFileSelect = async (fileType: FileType, file: File) => {
    // Priority 2: Enhanced User Experience - File Validation
    const validationErrors = validateFile(file, fileType)
    if (validationErrors.length > 0) {
      setErrors(prev => ({ ...prev, [fileType]: validationErrors }))
      return
    }

    // Clear previous errors
    setErrors(prev => ({ ...prev, [fileType]: [] }))

    // Simulate upload progress
    setUploadStates(prev => ({
      ...prev,
      [fileType]: { ...prev[fileType], isUploading: true, progress: 0 }
    }))

    const progressInterval = setInterval(() => {
      setUploadStates(prev => ({
        ...prev,
        [fileType]: { 
          ...prev[fileType], 
          progress: Math.min(prev[fileType].progress + 20, 90)
        }
      }))
    }, 200)

    try {
      const text = await file.text()
      const { headers, rows } = parseCsv(text)
      
      // Priority 2: Enhanced User Experience - Data Validation
      const dataErrors: string[] = []
      if (rows.length === 0) {
        dataErrors.push('CSV file contains no data rows')
      }
      if (headers.length === 0) {
        dataErrors.push('CSV file contains no headers')
      }
      if (rows.length > 10000) {
        dataErrors.push('CSV file contains too many rows (max 10,000)')
      }

      if (dataErrors.length > 0) {
        setErrors(prev => ({ ...prev, [fileType]: dataErrors }))
        setUploadStates(prev => ({
          ...prev,
          [fileType]: { isDragging: false, isUploading: false, progress: 0 }
        }))
        clearInterval(progressInterval)
        return
      }
      
      setFileData(prev => ({
        ...prev,
        [fileType]: {
          headers,
          sampleRowCount: rows.length,
          text,
          rows: rows.slice(0, 10), // Keep first 10 rows for preview
        },
      }))

      setUploadStates(prev => ({
        ...prev,
        [fileType]: { isDragging: false, isUploading: false, progress: 100 }
      }))

      setTimeout(() => {
        setUploadStates(prev => ({
          ...prev,
          [fileType]: { isDragging: false, isUploading: false, progress: 0 }
        }))
      }, 1000)

    } catch (error) {
      console.error('Error processing file:', error)
      setErrors(prev => ({ 
        ...prev, 
        [fileType]: ['Failed to process CSV file. Please check the file format.'] 
      }))
      setUploadStates(prev => ({
        ...prev,
        [fileType]: { isDragging: false, isUploading: false, progress: 0 }
      }))
    }

    clearInterval(progressInterval)
  }

  const handleDragOver = useCallback((e: React.DragEvent, fileType: FileType) => {
    e.preventDefault()
    setUploadStates(prev => ({
      ...prev,
      [fileType]: { ...prev[fileType], isDragging: true }
    }))
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent, fileType: FileType) => {
    e.preventDefault()
    setUploadStates(prev => ({
      ...prev,
      [fileType]: { ...prev[fileType], isDragging: false }
    }))
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, fileType: FileType) => {
    e.preventDefault()
    setUploadStates(prev => ({
      ...prev,
      [fileType]: { ...prev[fileType], isDragging: false }
    }))

    const files = Array.from(e.dataTransfer.files)
    const csvFile = files.find(file => file.type === 'text/csv' || file.name.endsWith('.csv'))
    
    if (csvFile) {
      handleFileSelect(fileType, csvFile)
    }
  }, [])

  const handleSaveMapping = (fileType: FileType, mapping: Record<string, string>) => {
    setMapping(fileType, mapping)
  }

  // Priority 2: Enhanced User Experience - Import Wizard
  const startImportWizard = () => {
    setShowWizard(true)
    setCurrentStep(0)
    setImportSteps(steps => steps.map(step => ({ ...step, status: 'pending' })))
  }

  const nextStep = () => {
    if (currentStep < importSteps.length - 1) {
      setCurrentStep(currentStep + 1)
      setImportSteps(steps => 
        steps.map((step, index) => ({
          ...step,
          status: index === currentStep + 1 ? 'active' : 
                  index < currentStep + 1 ? 'completed' : 'pending'
        }))
      )
    }
  }

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setImportSteps(steps => 
        steps.map((step, index) => ({
          ...step,
          status: index === currentStep - 1 ? 'active' : 
                  index < currentStep - 1 ? 'completed' : 'pending'
        }))
      )
    }
  }

  // Priority 3: Advanced Features - Batch Import Functions
  const createBatchJob = (files: Array<{ fileType: FileType; file: File }>) => {
    const batchJob: BatchImportJob = {
      id: Date.now().toString(),
      name: `Batch Import ${new Date().toLocaleString()}`,
      files: files.map(({ fileType, file }) => ({
        fileType,
        fileName: file.name,
        status: 'pending',
        progress: 0
      })),
      status: 'pending',
      createdAt: new Date(),
      totalFiles: files.length,
      completedFiles: 0
    }
    
    setBatchJobs(prev => [batchJob, ...prev])
    return batchJob
  }

  const processBatchJob = async (batchJob: BatchImportJob) => {
    setBatchJobs(prev => 
      prev.map(job => 
        job.id === batchJob.id 
          ? { ...job, status: 'running' as const }
          : job
      )
    )

    for (const fileInfo of batchJob.files) {
      // Simulate processing each file
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setBatchJobs(prev => 
        prev.map(job => 
          job.id === batchJob.id 
            ? {
                ...job,
                files: job.files.map(f => 
                  f.fileName === fileInfo.fileName 
                    ? { ...f, status: 'completed' as const, progress: 100 }
                    : f
                ),
                completedFiles: job.completedFiles + 1
              }
            : job
        )
      )
    }

    setBatchJobs(prev => 
      prev.map(job => 
        job.id === batchJob.id 
          ? { ...job, status: 'completed' as const, completedAt: new Date() }
          : job
      )
    )
  }

  // Priority 3: Advanced Features - Data Transformation Functions
  const addTransformation = (transformation: Omit<DataTransformation, 'id'>) => {
    const newTransformation: DataTransformation = {
      ...transformation,
      id: Date.now().toString()
    }
    setTransformations(prev => [...prev, newTransformation])
  }

  const toggleTransformation = (id: string) => {
    setTransformations(prev => 
      prev.map(t => 
        t.id === id ? { ...t, enabled: !t.enabled } : t
      )
    )
  }

  // Priority 3: Performance Optimizations - Metrics Functions
  const startImportMetrics = (importId: string, fileSize: number) => {
    const metrics: ImportMetrics = {
      startTime: performance.now(),
      rowsProcessed: 0,
      memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
      fileSize,
      processingSpeed: 0
    }
    setImportMetrics(prev => ({ ...prev, [importId]: metrics }))
  }

  const updateImportMetrics = (importId: string, rowsProcessed: number) => {
    setImportMetrics(prev => {
      const current = prev[importId]
      if (!current) return prev

      const now = performance.now()
      const duration = (now - current.startTime) / 1000
      const processingSpeed = rowsProcessed / duration

      return {
        ...prev,
        [importId]: {
          ...current,
          rowsProcessed,
          processingSpeed,
          memoryUsage: (performance as any).memory?.usedJSHeapSize || 0
        }
      }
    })
  }

  const finishImportMetrics = (importId: string) => {
    setImportMetrics(prev => {
      const current = prev[importId]
      if (!current) return prev

      const endTime = performance.now()
      const duration = (endTime - current.startTime) / 1000

      return {
        ...prev,
        [importId]: {
          ...current,
          endTime,
          duration
        }
      }
    })
  }

  const handleIngest = (fileType: FileType) => {
    const data = fileData[fileType]
    if (data) {
      const importId = Date.now().toString()
      
      // Priority 3: Performance Optimizations - Start metrics
      startImportMetrics(importId, data.text.length)
      
      // Priority 2: Data Management Features - Add to Import History
      const importRecord: ImportHistory = {
        id: importId,
        fileType,
        fileName: `${fileType}-import-${new Date().toISOString()}`,
        timestamp: new Date(),
        status: 'processing',
        rowsProcessed: data.sampleRowCount,
        errors: []
      }
      
      setImportHistory(prev => [importRecord, ...prev])
      
      try {
        // Priority 3: Performance Optimizations - Update metrics during processing
        updateImportMetrics(importId, data.sampleRowCount)
        
        ingest(fileType, data.text)
        
        // Priority 3: Performance Optimizations - Finish metrics
        finishImportMetrics(importId)
        
        // Update import record with success
        setImportHistory(prev => 
          prev.map(record => 
            record.id === importRecord.id 
              ? { ...record, status: 'success' as const }
              : record
          )
        )
      } catch (error) {
        // Priority 3: Performance Optimizations - Finish metrics on error
        finishImportMetrics(importId)
        
        // Update import record with error
        setImportHistory(prev => 
          prev.map(record => 
            record.id === importRecord.id 
              ? { ...record, status: 'error' as const, errors: [error as string] }
              : record
          )
        )
      }
    }
  }

  const fileTypes: { type: FileType; label: string; description: string; icon: string }[] = [
    { 
      type: 'keepa', 
      label: 'Keepa Data', 
      description: 'Amazon product data from Keepa API',
      icon: '📊'
    },
    { 
      type: 'indiaListings', 
      label: 'India Listings', 
      description: 'Product listings from India marketplace',
      icon: '🇮🇳'
    },
    { 
      type: 'uspo', 
      label: 'US Purchase Orders', 
      description: 'Purchase order data from US operations',
      icon: '📋'
    },
    { 
      type: 'events', 
      label: 'Events', 
      description: 'Event and activity data',
      icon: '📅'
    },
    { 
      type: 'settlement', 
      label: 'Settlement', 
      description: 'Financial settlement data',
      icon: '💰'
    },
  ]

  return (
    <div data-testid="imports-view" className="min-h-screen bg-gray-50">
      {/* Breadcrumb Navigation */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <ol className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((breadcrumb, index) => (
            <li key={breadcrumb.name} className="flex items-center">
              {index > 0 && (
                <svg className="w-4 h-4 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {breadcrumb.current ? (
                <span className="text-gray-900 font-medium">{breadcrumb.name}</span>
              ) : (
                <a href={breadcrumb.href} className="text-gray-500 hover:text-gray-700">
                  {breadcrumb.name}
                </a>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <span className="text-4xl">📁</span>
                CSV Data Imports
              </h1>
              <p className="mt-2 text-lg text-gray-600">
                Upload and configure CSV files for data processing and analysis
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Priority 2: Enhanced User Experience - Import Wizard Button */}
              <button
                onClick={startImportWizard}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <span>🧙‍♂️</span>
                Import Wizard
              </button>
              
              {/* Priority 2: Data Management Features - Import History Button */}
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <span>📋</span>
                Import History
              </button>
              
              {/* Priority 3: Advanced Features - Batch Import Button */}
              <button
                onClick={() => setShowBatchManager(!showBatchManager)}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
              >
                <span>📦</span>
                Batch Import
              </button>
              
              {/* Priority 3: Advanced Features - Data Transformations Button */}
              <button
                onClick={() => setShowTransformations(!showTransformations)}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
              >
                <span>🔄</span>
                Transformations
              </button>
              
              {/* Priority 3: Performance Optimizations - Metrics Button */}
              <button
                onClick={() => setShowMetrics(!showMetrics)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <span>📊</span>
                Performance
              </button>
              
              <button
                onClick={exportMappings}
                data-testid="export-mappings"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <span>📤</span>
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
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer flex items-center gap-2"
                >
                  <span>📥</span>
                  Import Mappings
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Priority 2: Enhanced User Experience - Import Wizard Modal */}
        {showWizard && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Import Wizard</h2>
                <button
                  onClick={() => setShowWizard(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              {/* Wizard Steps */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                                     {importSteps.map((step, index) => (
                     <div key={step?.id || index} className="flex items-center">
                                             <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                         step?.status === 'completed' ? 'bg-green-500 text-white' :
                         step?.status === 'active' ? 'bg-blue-500 text-white' :
                         step?.status === 'error' ? 'bg-red-500 text-white' :
                         'bg-gray-200 text-gray-600'
                       }`}>
                         {step?.status === 'completed' ? '✓' : index + 1}
                       </div>
                       <div className="ml-3">
                         <div className="text-sm font-medium text-gray-900">{step?.title}</div>
                         <div className="text-xs text-gray-500">{step?.description}</div>
                       </div>
                                             {index < importSteps.length - 1 && (
                         <div className={`w-16 h-0.5 mx-4 ${
                           step?.status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                         }`} />
                       )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Wizard Content */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {importSteps[currentStep].title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {importSteps[currentStep].description}
                </p>
                
                {/* Step-specific content would go here */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    Step {currentStep + 1} content will be implemented here...
                  </p>
                </div>
              </div>
              
              {/* Wizard Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={previousStep}
                  disabled={currentStep === 0}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                <button
                  onClick={nextStep}
                  disabled={currentStep === importSteps.length - 1}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {currentStep === importSteps.length - 1 ? 'Finish' : 'Next →'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Priority 2: Data Management Features - Import History Panel */}
        {showHistory && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <span>📋</span>
                Import History
              </h2>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            {importHistory.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No import history yet</p>
            ) : (
              <div className="space-y-3">
                {importHistory.slice(0, 5).map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full ${
                        record.status === 'success' ? 'bg-green-500' :
                        record.status === 'error' ? 'bg-red-500' :
                        'bg-yellow-500'
                      }`} />
                      <div>
                        <div className="font-medium text-gray-900">{record.fileName}</div>
                        <div className="text-sm text-gray-500">
                          {record.rowsProcessed} rows • {record.timestamp.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${
                        record.status === 'success' ? 'text-green-600' :
                        record.status === 'error' ? 'text-red-600' :
                        'text-yellow-600'
                      }`}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </div>
                      {record.errors.length > 0 && (
                        <div className="text-xs text-red-500">
                          {record.errors.length} error(s)
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Priority 3: Advanced Features - Batch Import Panel */}
        {showBatchManager && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <span>📦</span>
                Batch Import Manager
              </h2>
              <button
                onClick={() => setShowBatchManager(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Batch Job Creation */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Create New Batch Job</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Select multiple files to process them in a batch import job.
                </p>
                <input
                  type="file"
                  multiple
                  accept=".csv"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || [])
                    const fileInfos = files.map(file => ({
                      fileType: 'keepa' as FileType, // Default type
                      file
                    }))
                    setSelectedFiles(fileInfos)
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {selectedFiles.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-900 mb-2">Selected Files:</p>
                    <div className="space-y-1">
                      {selectedFiles.map((fileInfo, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          • {fileInfo.file.name} ({fileInfo.fileType})
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        const batchJob = createBatchJob(selectedFiles)
                        processBatchJob(batchJob)
                        setSelectedFiles([])
                      }}
                      className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Start Batch Import
                    </button>
                  </div>
                )}
              </div>

              {/* Active Batch Jobs */}
              {batchJobs.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Active Batch Jobs</h3>
                  <div className="space-y-3">
                    {batchJobs.slice(0, 3).map((job) => (
                      <div key={job.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-gray-900">{job.name}</div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            job.status === 'completed' ? 'bg-green-100 text-green-800' :
                            job.status === 'running' ? 'bg-blue-100 text-blue-800' :
                            job.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {job.completedFiles} of {job.totalFiles} files completed
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(job.completedFiles / job.totalFiles) * 100}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Created: {job.createdAt.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Priority 3: Advanced Features - Data Transformations Panel */}
        {showTransformations && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <span>🔄</span>
                Data Transformations
              </h2>
              <button
                onClick={() => setShowTransformations(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Add New Transformation */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Add Transformation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="filter">Filter</option>
                      <option value="map">Map</option>
                      <option value="aggregate">Aggregate</option>
                      <option value="format">Format</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      placeholder="Transformation name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <button
                  onClick={() => addTransformation({
                    name: 'Sample Transformation',
                    type: 'filter',
                    config: {},
                    enabled: true
                  })}
                  className="mt-3 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Add Transformation
                </button>
              </div>

              {/* Active Transformations */}
              {transformations.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Active Transformations</h3>
                  <div className="space-y-2">
                    {transformations.map((transformation) => (
                      <div key={transformation.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{transformation.name}</div>
                          <div className="text-sm text-gray-500">{transformation.type}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleTransformation(transformation.id)}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              transformation.enabled 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {transformation.enabled ? 'Enabled' : 'Disabled'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Priority 3: Performance Optimizations - Metrics Panel */}
        {showMetrics && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <span>📊</span>
                Performance Metrics
              </h2>
              <button
                onClick={() => setShowMetrics(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Performance Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {Object.keys(importMetrics).length}
                  </div>
                  <div className="text-sm text-blue-800">Total Imports</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {Object.values(importMetrics).filter(m => m.duration).length}
                  </div>
                  <div className="text-sm text-green-800">Completed</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {Object.values(importMetrics).reduce((sum, m) => sum + m.rowsProcessed, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-purple-800">Total Rows</div>
                </div>
              </div>

              {/* Recent Import Metrics */}
              {Object.keys(importMetrics).length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Recent Import Performance</h3>
                  <div className="space-y-3">
                    {Object.entries(importMetrics).slice(0, 3).map(([id, metrics]) => (
                      <div key={id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-gray-900">Import #{id.slice(-6)}</div>
                          <div className="text-sm text-gray-500">
                            {metrics.duration ? `${metrics.duration.toFixed(2)}s` : 'Processing...'}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Rows:</span>
                            <span className="ml-2 font-medium">{metrics.rowsProcessed.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Speed:</span>
                            <span className="ml-2 font-medium">{metrics.processingSpeed.toFixed(0)} rows/s</span>
                          </div>
                          <div>
                            <span className="text-gray-600">File Size:</span>
                            <span className="ml-2 font-medium">{(metrics.fileSize / 1024).toFixed(1)} KB</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Memory:</span>
                            <span className="ml-2 font-medium">{(metrics.memoryUsage / 1024 / 1024).toFixed(1)} MB</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Templates Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>📋</span>
            CSV Templates
          </h2>
          <p className="text-gray-600 mb-4">
            Download sample CSV templates to understand the required format for each data type.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fileTypes.map(({ type, label, description, icon }) => (
              <button
                key={type}
                onClick={() => downloadTemplate(type)}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-left group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{icon}</span>
                  <span className="font-medium text-gray-900">{label}</span>
                </div>
                <p className="text-sm text-gray-600 group-hover:text-gray-700">
                  {description}
                </p>
                <div className="mt-2 text-xs text-blue-600 font-medium">
                  Download Template →
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* File Upload Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {fileTypes.map(({ type, label, icon }) => (
                <button
                  key={type}
                  onClick={() => setActiveTab(type)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                    activeTab === type
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{icon}</span>
                  {label}
                  {fileData[type] && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✓ Loaded
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {fileTypes.map(({ type, label, description, icon }) => (
              <div key={type} className={activeTab === type ? 'block' : 'hidden'}>
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2 mb-2">
                    <span>{icon}</span>
                    {label}
                  </h3>
                  <p className="text-gray-600">{description}</p>
                </div>

                {/* Priority 2: Enhanced User Experience - Error Display */}
                {errors[type].length > 0 && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-red-600">⚠️</span>
                      <span className="font-medium text-red-900">Validation Errors</span>
                    </div>
                    <ul className="text-sm text-red-700 space-y-1">
                      {errors[type].map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* File Upload Area */}
                <div className="mb-6">
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                      uploadStates[type].isDragging
                        ? 'border-blue-400 bg-blue-50'
                        : uploadStates[type].isUploading
                        ? 'border-gray-300 bg-gray-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragOver={(e) => handleDragOver(e, type)}
                    onDragLeave={(e) => handleDragLeave(e, type)}
                    onDrop={(e) => handleDrop(e, type)}
                  >
                    {uploadStates[type].isUploading ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Processing file...</p>
                          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadStates[type].progress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{uploadStates[type].progress}% complete</p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-4xl mb-4">📁</div>
                        <p className="text-lg font-medium text-gray-900 mb-2">
                          {fileData[type] ? 'File uploaded successfully!' : 'Upload your CSV file'}
                        </p>
                        <p className="text-sm text-gray-600 mb-4">
                          {fileData[type] 
                            ? `Loaded ${fileData[type]!.sampleRowCount} rows with ${fileData[type]!.headers.length} columns`
                            : 'Drag and drop your CSV file here, or click to browse'
                          }
                        </p>
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
                          className="hidden"
                          id={`file-input-${type}`}
                        />
                        <label
                          htmlFor={`file-input-${type}`}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
                        >
                          Choose File
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* File Data Display */}
                {fileData[type] && (
                  <div className="space-y-6">
                    {/* Headers Summary */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">File Summary</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Columns:</span>
                          <span className="ml-2 font-medium">{fileData[type]!.headers.length}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Rows:</span>
                          <span className="ml-2 font-medium">{fileData[type]!.sampleRowCount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Data Preview */}
                    <div className="bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h4 className="font-medium text-gray-900">Data Preview</h4>
                        <button
                          onClick={() => setShowPreview(prev => ({ ...prev, [type]: !prev[type] }))}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          {showPreview[type] ? 'Hide Preview' : 'Show Preview'}
                        </button>
                      </div>
                      {showPreview[type] && (
                        <div className="p-4">
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  {fileData[type]!.headers.map((header, index) => (
                                    <th key={index} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      {header}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {fileData[type]!.rows.slice(0, 5).map((row, rowIndex) => (
                                  <tr key={rowIndex}>
                                    {row.map((cell, cellIndex) => (
                                      <td key={cellIndex} className="px-3 py-2 text-sm text-gray-900">
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Showing first 5 rows of {fileData[type]!.sampleRowCount} total rows
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Field Mapping */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-4">Field Mapping</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        Map your CSV columns to the system's expected field names.
                      </p>
                      <HeaderMapper
                        headers={fileData[type]!.headers}
                        mapping={mappings[type] || {}}
                        onChange={(mapping) => handleSaveMapping(type, mapping)}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleSaveMapping(type, mappings[type] || {})}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <span>💾</span>
                        Save Mapping
                      </button>
                      <button
                        onClick={() => handleIngest(type)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <span>📥</span>
                        Import Data
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Priority 2: Enhanced User Experience - Help Section */}
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <span>💡</span>
              Need Help?
            </h2>
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="text-blue-600 hover:text-blue-700"
            >
              {showHelp ? 'Hide Help' : 'Show Help'}
            </button>
          </div>
          
          {showHelp && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Getting Started</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Download a template for your data type</li>
                    <li>• Fill in your data following the template format</li>
                    <li>• Upload your CSV file using drag & drop</li>
                    <li>• Map your columns to system fields</li>
                    <li>• Review and import your data</li>
                  </ul>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">Best Practices</h3>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Keep file sizes under 10MB</li>
                    <li>• Use consistent date formats (YYYY-MM-DD)</li>
                    <li>• Include all required fields</li>
                    <li>• Validate data before importing</li>
                    <li>• Save your field mappings for reuse</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ImportsView
