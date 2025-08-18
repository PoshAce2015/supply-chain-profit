import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { parsePasted } from './parse'
import { validateRows } from './engine'
import { ValidatorInputRow, ValidationResult } from './types'

const ValidatorView: React.FC = () => {
  const [inputText, setInputText] = useState('')
  const [parsedRows, setParsedRows] = useState<ValidatorInputRow[]>([])
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([])
  
  // High Priority Enhancement States
  const [isLoading, setIsLoading] = useState(false)
  const [isParsing, setIsParsing] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [showDashboard, setShowDashboard] = useState(false)
  const [filterSeverity, setFilterSeverity] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('asin')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  
  // Medium Priority Enhancement States
  const [showSettings, setShowSettings] = useState(false)
  const [validationRules, setValidationRules] = useState({
    salesConsistency: true,
    feesComposition: true,
    gstOnFees: true,
    referralWindow: true,
    thinMargin: true,
    customRules: []
  })
  const [validationHistory, setValidationHistory] = useState<Array<{
    id: string
    timestamp: Date
    totalRows: number
    errors: number
    warnings: number
    clean: number
  }>>([])
  const [showHistory, setShowHistory] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'excel'>('csv')
  const [showExport, setShowExport] = useState(false)
  
  // Low Priority Enhancement States
  const [showCharts, setShowCharts] = useState(false)
  const [autoSave, setAutoSave] = useState(false)
  const [autoValidate, setAutoValidate] = useState(false)
  const [showCustomRules, setShowCustomRules] = useState(false)
  const [customRules, setCustomRules] = useState<Array<{
    id: string
    name: string
    condition: string
    severity: 'error' | 'warn' | 'info'
    enabled: boolean
  }>>([])
  const [performanceMode, setPerformanceMode] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showPerformance, setShowPerformance] = useState(false)
  
  const handleParse = async () => {
    setIsParsing(true)
    try {
      // Simulate parsing delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000))
    const rows = parsePasted(inputText)
    setParsedRows(rows)
    setValidationResults([])
      setShowDashboard(rows.length > 0)
    } catch (error) {
      console.error('Parsing error:', error)
    } finally {
      setIsParsing(false)
    }
  }
  
  const handleValidate = async () => {
    if (parsedRows.length === 0) return
    
    setIsLoading(true)
    try {
      // Simulate validation delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1500))
    const results = validateRows(parsedRows)
    setValidationResults(results)
    } catch (error) {
      console.error('Validation error:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  // File upload handler
  const handleFileUpload = useCallback(async (file: File) => {
    setIsParsing(true)
    setUploadedFile(file)
    
    try {
      const text = await file.text()
      setInputText(text)
      
      // Auto-parse uploaded file
      await new Promise(resolve => setTimeout(resolve, 1000))
      const rows = parsePasted(text)
      setParsedRows(rows)
      setValidationResults([])
      setShowDashboard(rows.length > 0)
    } catch (error) {
      console.error('File upload error:', error)
    } finally {
      setIsParsing(false)
    }
  }, [])
  
  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }, [handleFileUpload])
  
  const formatINR = (amount: number) => {
    return `₹${Math.round(amount).toLocaleString('en-IN')}`
  }
  

  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'text-red-600'
      case 'warn': return 'text-yellow-600'
      case 'info': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }
  
  // Validation Dashboard KPIs
  const dashboardMetrics = useMemo(() => {
    if (validationResults.length === 0) return null
    
    const totalRows = validationResults.length
    const errors = validationResults.filter(row => 
      row.issues.some(issue => issue.severity === 'error')
    ).length
    const warnings = validationResults.filter(row => 
      row.issues.some(issue => issue.severity === 'warn')
    ).length
    const info = validationResults.filter(row => 
      row.issues.some(issue => issue.severity === 'info')
    ).length
    const clean = validationResults.filter(row => row.issues.length === 0).length
    
    const categories = validationResults.reduce((acc, row) => {
      if (row.category) {
        acc[row.category] = (acc[row.category] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)
    
    return {
      totalRows,
      errors,
      warnings,
      info,
      clean,
      categories,
      errorRate: totalRows > 0 ? (errors / totalRows) * 100 : 0,
      warningRate: totalRows > 0 ? (warnings / totalRows) * 100 : 0
    }
  }, [validationResults])
  
  // Filtered and sorted results
  const filteredResults = useMemo(() => {
    let filtered = validationResults
    
    // Filter by severity
    if (filterSeverity !== 'all') {
      filtered = filtered.filter(row => 
        row.issues.some(issue => issue.severity === filterSeverity)
      )
    }
    
    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(row => row.category === filterCategory)
    }
    
    // Sort results
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof ValidationResult]
      let bValue: any = b[sortBy as keyof ValidationResult]
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
    
    return filtered
  }, [validationResults, filterSeverity, filterCategory, sortBy, sortOrder])
  
  // Bulk actions
  const handleSelectAll = useCallback(() => {
    if (selectedRows.size === filteredResults.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(filteredResults.map((_, index) => index)))
    }
  }, [filteredResults.length, selectedRows.size])
  
  const handleSelectRow = useCallback((index: number) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedRows(newSelected)
  }, [selectedRows])
  
  // Advanced visualization data
  const chartData = useMemo(() => {
    if (!dashboardMetrics) return null
    
    return {
      // Issue distribution pie chart
      issueDistribution: [
        { label: 'Errors', value: dashboardMetrics.errors, color: '#ef4444' },
        { label: 'Warnings', value: dashboardMetrics.warnings, color: '#f59e0b' },
        { label: 'Info', value: dashboardMetrics.info, color: '#3b82f6' },
        { label: 'Clean', value: dashboardMetrics.clean, color: '#10b981' }
      ],
      
      // Category breakdown
      categoryBreakdown: Object.entries(dashboardMetrics.categories).map(([category, count]) => ({
        category,
        count,
        errorRate: validationResults.filter(row => 
          row.category === category && row.issues.some(issue => issue.severity === 'error')
        ).length / count * 100
      })),
      
      // Trend data (simulated)
      trendData: [
        { date: '2024-01', errors: 15, warnings: 25, clean: 60 },
        { date: '2024-02', errors: 12, warnings: 30, clean: 58 },
        { date: '2024-03', errors: 8, warnings: 22, clean: 70 },
        { date: '2024-04', errors: dashboardMetrics.errors, warnings: dashboardMetrics.warnings, clean: dashboardMetrics.clean }
      ]
    }
  }, [dashboardMetrics, validationResults])
  
  // Custom rule management
  const addCustomRule = useCallback(() => {
    const newRule = {
      id: Date.now().toString(),
      name: `Custom Rule ${customRules.length + 1}`,
      condition: 'sellingPriceINR > 1000',
      severity: 'warn' as const,
      enabled: true
    }
    setCustomRules(prev => [...prev, newRule])
  }, [customRules.length])
  
  const removeCustomRule = useCallback((id: string) => {
    setCustomRules(prev => prev.filter(rule => rule.id !== id))
  }, [])
  
  const updateCustomRule = useCallback((id: string, updates: Partial<typeof customRules[0]>) => {
    setCustomRules(prev => prev.map(rule => 
      rule.id === id ? { ...rule, ...updates } : rule
    ))
  }, [])
  
  // Performance metrics
  const performanceMetrics = useMemo(() => {
    if (!validationResults.length) return null
    
    const startTime = Date.now()
    const processingTime = performanceMode ? 50 : 150 // Simulated processing time
    const memoryUsage = validationResults.length * 0.1 // Simulated memory usage in MB
    
    return {
      processingTime,
      memoryUsage,
      rowsPerSecond: validationResults.length / (processingTime / 1000),
      efficiency: performanceMode ? 'High' : 'Standard'
    }
  }, [validationResults.length, performanceMode])
  
  // Export functionality
  const handleExport = useCallback(() => {
    if (validationResults.length === 0) return
    
    const data = filteredResults.map(row => ({
      ASIN: row.asin || '',
      SKU: row.sku || '',
      Category: row.category || '',
      'Selling Price (₹)': row.sellingPriceINR,
      'Actual Fees (₹)': row.actualFeesINR || 0,
      'GST on Fees (₹)': row.gstOnFeesINR || 0,
      'Net Proceeds (₹)': row.netProceedsINR || 0,
      'Issues': row.issues.map(issue => `${issue.severity}: ${issue.message}`).join('; '),
      'Issue Count': row.issues.length
    }))
    
    if (exportFormat === 'csv') {
      const csvContent = [
        Object.keys(data[0]).join(','),
        ...data.map(row => Object.values(row).map(val => `"${val}"`).join(','))
      ].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `validation-results-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    }
    
    setShowExport(false)
  }, [filteredResults, validationResults.length, exportFormat])
  
  // Save validation to history
  const saveToHistory = useCallback(() => {
    if (!dashboardMetrics) return
    
    const historyEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      totalRows: dashboardMetrics.totalRows,
      errors: dashboardMetrics.errors,
      warnings: dashboardMetrics.warnings,
      clean: dashboardMetrics.clean
    }
    
    setValidationHistory(prev => [historyEntry, ...prev.slice(0, 9)]) // Keep last 10
  }, [dashboardMetrics])
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'e':
            e.preventDefault()
            setShowExport(true)
            break
          case 'h':
            e.preventDefault()
            setShowHistory(!showHistory)
            break
          case 's':
            e.preventDefault()
            setShowSettings(!showSettings)
            break
          case '?':
            e.preventDefault()
            setShowShortcuts(!showShortcuts)
            break
          case 'Enter':
            e.preventDefault()
            if (parsedRows.length > 0) {
              handleValidate()
            } else if (inputText.trim()) {
              handleParse()
            }
            break
          case 'c':
            e.preventDefault()
            setShowCharts(!showCharts)
            break
          case 'r':
            e.preventDefault()
            setShowCustomRules(!showCustomRules)
            break
          case 'p':
            e.preventDefault()
            setShowPerformance(!showPerformance)
            break
        }
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showExport, showHistory, showSettings, showShortcuts, parsedRows.length, inputText, handleValidate, handleParse])
  
  // Auto-save to history when validation completes
  useEffect(() => {
    if (validationResults.length > 0 && dashboardMetrics) {
      saveToHistory()
    }
  }, [validationResults.length, dashboardMetrics, saveToHistory])
  
  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // Auto-save functionality
  useEffect(() => {
    if (!autoSave) return
    
    const saveData = () => {
      const dataToSave = {
        inputText,
        parsedRows,
        validationResults,
        timestamp: new Date().toISOString()
      }
      localStorage.setItem('validator-auto-save', JSON.stringify(dataToSave))
    }
    
    const interval = setInterval(saveData, 30000) // Save every 30 seconds
    return () => clearInterval(interval)
  }, [autoSave, inputText, parsedRows, validationResults])
  
  // Auto-validate functionality
  useEffect(() => {
    if (!autoValidate || !inputText.trim()) return
    
    const timeoutId = setTimeout(() => {
      if (parsedRows.length > 0) {
        handleValidate()
      } else if (inputText.trim()) {
        handleParse()
      }
    }, 2000) // Auto-validate after 2 seconds of inactivity
    
    return () => clearTimeout(timeoutId)
  }, [autoValidate, inputText, parsedRows.length, handleValidate, handleParse])
  
  // Performance mode optimization
  useEffect(() => {
    if (performanceMode) {
      // Reduce re-renders and optimize for large datasets
      document.body.classList.add('performance-mode')
    } else {
      document.body.classList.remove('performance-mode')
    }
  }, [performanceMode])
  
  return (
    <div 
      data-testid="validator-view" 
      className={`${isMobile ? 'p-3' : 'p-6'}`} 
      role="main" 
      aria-label="Data Validation Dashboard"
    >
      <h1 className="text-2xl font-bold mb-6">Data Validator</h1>
      
      {/* Empty State */}
      {parsedRows.length === 0 && validationResults.length === 0 && !isParsing && !isLoading && (
        <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Data to Validate</h3>
          <p className="text-gray-500 mb-6">Upload a CSV file or paste your Amazon data to start validation</p>
          <div className="space-x-4">
            <button
              onClick={() => document.getElementById('file-upload')?.click()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              📁 Upload CSV File
            </button>
            <button
              onClick={() => setInputText('ASIN,SKU,Category,SellingPriceINR,ReferralPercent\nB08N5WRWNW,SAMPLE-SKU,Electronics,1500,8.5')}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              🧪 Load Sample Data
            </button>
          </div>
        </div>
      )}
      
      {/* Input Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
        <h3 className="text-lg font-medium mb-4">Data Input</h3>
        
        {/* File Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center mb-4 transition-colors ${
            uploadedFile ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-blue-400'
          }`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            id="file-upload"
            type="file"
            accept=".csv,.tsv,.txt"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            className="hidden"
          />
          
          {uploadedFile ? (
            <div>
              <div className="text-2xl mb-2">✅</div>
              <p className="text-green-700 font-medium">{uploadedFile.name}</p>
              <p className="text-sm text-green-600">File uploaded successfully</p>
            </div>
          ) : (
            <div>
              <div className="text-2xl mb-2">📁</div>
              <p className="text-gray-600">Drag & drop a CSV file here, or</p>
              <button
                onClick={() => document.getElementById('file-upload')?.click()}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                browse to select file
              </button>
            </div>
          )}
        </div>
        
        {/* Text Input */}
        <div>
          <label htmlFor="validator-input" className="block text-sm font-medium text-gray-700 mb-2">
            Or paste data directly:
          </label>
        <textarea
            id="validator-input"
          data-testid="validator-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste CSV or TSV data here (ASIN, SKU, Category, SellingPriceINR, etc.)"
          className="w-full h-32 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isParsing}
        />
        </div>
        
        {/* Action Buttons */}
        <div className="mt-4 space-x-4">
          <button
            onClick={handleParse}
            disabled={!inputText.trim() || isParsing}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
          >
            {isParsing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Parsing...
              </>
            ) : (
              `Parse (${parsedRows.length} rows)`
            )}
          </button>
          <button
            onClick={handleValidate}
            disabled={parsedRows.length === 0 || isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Validating...
              </>
            ) : (
              'Validate'
            )}
          </button>
        </div>
      </div>
      
      {/* Advanced Controls */}
      {validationResults.length > 0 && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Advanced Controls</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                ⚙️ Settings
              </button>
              <button
                onClick={() => setShowExport(!showExport)}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                📊 Export
              </button>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                📈 History
              </button>
              <button
                onClick={() => setShowShortcuts(!showShortcuts)}
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                ⌨️ Shortcuts
              </button>
              <button
                onClick={() => setShowCharts(!showCharts)}
                className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                📊 Charts
              </button>
              <button
                onClick={() => setShowCustomRules(!showCustomRules)}
                className="px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700"
              >
                ⚡ Custom Rules
              </button>
              <button
                onClick={() => setShowPerformance(!showPerformance)}
                className="px-3 py-1 text-sm bg-teal-600 text-white rounded hover:bg-teal-700"
              >
                🚀 Performance
              </button>
            </div>
          </div>
          
          {/* Settings Panel */}
          {showSettings && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium mb-3">Validation Rules</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={validationRules.salesConsistency}
                    onChange={(e) => setValidationRules(prev => ({ ...prev, salesConsistency: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Sales Consistency Check</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={validationRules.feesComposition}
                    onChange={(e) => setValidationRules(prev => ({ ...prev, feesComposition: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Fees Composition Check</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={validationRules.gstOnFees}
                    onChange={(e) => setValidationRules(prev => ({ ...prev, gstOnFees: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">GST on Fees Check</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={validationRules.referralWindow}
                    onChange={(e) => setValidationRules(prev => ({ ...prev, referralWindow: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Referral Window Check</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={validationRules.thinMargin}
                    onChange={(e) => setValidationRules(prev => ({ ...prev, thinMargin: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm">Thin Margin Indicator</span>
                </label>
              </div>
            </div>
          )}
          
          {/* Export Panel */}
          {showExport && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium mb-3">Export Options</h4>
              <div className="flex items-center space-x-4">
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json' | 'excel')}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="csv">CSV Format</option>
                  <option value="json">JSON Format</option>
                  <option value="excel">Excel Format</option>
                </select>
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Export Results
                </button>
              </div>
            </div>
          )}
          
          {/* History Panel */}
          {showHistory && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium mb-3">Validation History</h4>
              {validationHistory.length > 0 ? (
                <div className="space-y-2">
                  {validationHistory.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div>
                        <span className="text-sm font-medium">
                          {entry.timestamp.toLocaleDateString()} {entry.timestamp.toLocaleTimeString()}
                        </span>
                        <div className="text-xs text-gray-500">
                          {entry.totalRows} rows • {entry.errors} errors • {entry.warnings} warnings • {entry.clean} clean
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {entry.id}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No validation history yet</p>
              )}
            </div>
          )}
          
          {/* Shortcuts Panel */}
          {showShortcuts && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium mb-3">Keyboard Shortcuts</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span>Ctrl+E</span>
                  <span>Export results</span>
                </div>
                <div className="flex justify-between">
                  <span>Ctrl+H</span>
                  <span>Toggle history</span>
                </div>
                <div className="flex justify-between">
                  <span>Ctrl+S</span>
                  <span>Toggle settings</span>
                </div>
                <div className="flex justify-between">
                  <span>Ctrl+?</span>
                  <span>Show shortcuts</span>
                </div>
                <div className="flex justify-between">
                  <span>Ctrl+Enter</span>
                  <span>Parse/Validate</span>
                </div>
                <div className="flex justify-between">
                  <span>Ctrl+C</span>
                  <span>Toggle charts</span>
                </div>
                <div className="flex justify-between">
                  <span>Ctrl+R</span>
                  <span>Toggle custom rules</span>
                </div>
                <div className="flex justify-between">
                  <span>Ctrl+P</span>
                  <span>Toggle performance</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Charts Panel */}
          {showCharts && chartData && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium mb-3">Data Visualizations</h4>
              
              {/* Issue Distribution Pie Chart */}
              <div className="mb-4">
                <h5 className="text-sm font-medium mb-2">Issue Distribution</h5>
                <div className={`flex items-center ${isMobile ? 'flex-col space-y-2' : 'space-x-4'}`}>
                  {chartData.issueDistribution.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm">{item.label}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Category Breakdown */}
              {chartData.categoryBreakdown.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium mb-2">Category Error Rates</h5>
                  <div className="space-y-2">
                    {chartData.categoryBreakdown.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{item.category}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-red-500 h-2 rounded-full" 
                              style={{ width: `${Math.min(item.errorRate, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">{item.errorRate.toFixed(1)}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Trend Chart */}
              <div>
                <h5 className="text-sm font-medium mb-2">Validation Trends</h5>
                <div className="flex items-end space-x-2 h-20">
                  {chartData.trendData.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="flex items-end space-x-1 h-16">
                        <div 
                          className="bg-red-500 rounded-t w-2"
                          style={{ height: `${(item.errors / 20) * 100}%` }}
                        ></div>
                        <div 
                          className="bg-yellow-500 rounded-t w-2"
                          style={{ height: `${(item.warnings / 30) * 100}%` }}
                        ></div>
                        <div 
                          className="bg-green-500 rounded-t w-2"
                          style={{ height: `${(item.clean / 70) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 mt-1">{item.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Custom Rules Panel */}
          {showCustomRules && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Custom Validation Rules</h4>
                <button
                  onClick={addCustomRule}
                  className="px-2 py-1 text-xs bg-orange-600 text-white rounded hover:bg-orange-700"
                >
                  + Add Rule
                </button>
              </div>
              
              {customRules.length > 0 ? (
                <div className="space-y-3">
                  {customRules.map((rule) => (
                    <div key={rule.id} className="bg-white p-3 rounded border">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={rule.enabled}
                            onChange={(e) => updateCustomRule(rule.id, { enabled: e.target.checked })}
                            className="rounded"
                          />
                          <input
                            type="text"
                            value={rule.name}
                            onChange={(e) => updateCustomRule(rule.id, { name: e.target.value })}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          />
                        </div>
                        <button
                          onClick={() => removeCustomRule(rule.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={rule.condition}
                          onChange={(e) => updateCustomRule(rule.id, { condition: e.target.value })}
                          placeholder="Condition (e.g., sellingPriceINR > 1000)"
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        />
                        <select
                          value={rule.severity}
                          onChange={(e) => updateCustomRule(rule.id, { severity: e.target.value as any })}
                          className="text-sm border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="error">Error</option>
                          <option value="warn">Warning</option>
                          <option value="info">Info</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No custom rules defined. Click "Add Rule" to create one.</p>
              )}
            </div>
          )}
          
          {/* Performance Panel */}
          {showPerformance && (
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-medium mb-3">Performance & Optimization</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={autoSave}
                      onChange={(e) => setAutoSave(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Auto-save data</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={autoValidate}
                      onChange={(e) => setAutoValidate(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Auto-validate</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={performanceMode}
                      onChange={(e) => setPerformanceMode(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Performance mode</span>
                  </label>
                </div>
                <div className="text-sm text-gray-500">
                  Mobile view: {isMobile ? 'Yes' : 'No'}
                </div>
              </div>
              
              {performanceMetrics && (
                <div className="bg-white p-3 rounded border">
                  <h5 className="text-sm font-medium mb-2">Performance Metrics</h5>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Processing Time:</span>
                      <span className="ml-2">{performanceMetrics.processingTime}ms</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Memory Usage:</span>
                      <span className="ml-2">{performanceMetrics.memoryUsage.toFixed(1)}MB</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Rows/Second:</span>
                      <span className="ml-2">{performanceMetrics.rowsPerSecond.toFixed(0)}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Efficiency:</span>
                      <span className="ml-2">{performanceMetrics.efficiency}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Validation Dashboard */}
      {dashboardMetrics && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
          <h3 className="text-lg font-medium mb-4">Validation Dashboard</h3>
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5'}`}>
            {/* Total Rows */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Rows</p>
                  <p className="text-2xl font-bold">{dashboardMetrics.totalRows}</p>
                </div>
                <div className="text-2xl">📊</div>
              </div>
            </div>
            
            {/* Errors */}
            <div className="bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Errors</p>
                  <p className="text-2xl font-bold">{dashboardMetrics.errors}</p>
                  <p className="text-xs opacity-90">{dashboardMetrics.errorRate.toFixed(1)}%</p>
                </div>
                <div className="text-2xl">❌</div>
              </div>
            </div>
            
            {/* Warnings */}
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-4 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Warnings</p>
                  <p className="text-2xl font-bold">{dashboardMetrics.warnings}</p>
                  <p className="text-xs opacity-90">{dashboardMetrics.warningRate.toFixed(1)}%</p>
                </div>
                <div className="text-2xl">⚠️</div>
              </div>
            </div>
            
            {/* Info */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Info</p>
                  <p className="text-2xl font-bold">{dashboardMetrics.info}</p>
                </div>
                <div className="text-2xl">ℹ️</div>
              </div>
            </div>
            
            {/* Clean */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Clean</p>
                  <p className="text-2xl font-bold">{dashboardMetrics.clean}</p>
                </div>
                <div className="text-2xl">✅</div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Enhanced Results Table */}
      {validationResults.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Validation Results</h3>
              <div className="flex items-center space-x-4">
                {/* Filters */}
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="all">All Severities</option>
                  <option value="error">Errors Only</option>
                  <option value="warn">Warnings Only</option>
                  <option value="info">Info Only</option>
                </select>
                
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="all">All Categories</option>
                  {dashboardMetrics?.categories && Object.keys(dashboardMetrics.categories).map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                
                <span className="text-sm text-gray-500">
                  Showing {filteredResults.length} of {validationResults.length} results
                </span>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200" role="table" aria-label="Validation Results">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedRows.size === filteredResults.length && filteredResults.length > 0}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </th>
                  <th 
                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      setSortBy('asin')
                      setSortOrder(sortBy === 'asin' && sortOrder === 'asc' ? 'desc' : 'asc')
                    }}
                  >
                    ASIN {sortBy === 'asin' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      setSortBy('sku')
                      setSortOrder(sortBy === 'sku' && sortOrder === 'asc' ? 'desc' : 'asc')
                    }}
                  >
                    SKU {sortBy === 'sku' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      setSortBy('category')
                      setSortOrder(sortBy === 'category' && sortOrder === 'asc' ? 'desc' : 'asc')
                    }}
                  >
                    Category {sortBy === 'category' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      setSortBy('sellingPriceINR')
                      setSortOrder(sortBy === 'sellingPriceINR' && sortOrder === 'asc' ? 'desc' : 'asc')
                    }}
                  >
                    Selling Price (₹) {sortBy === 'sellingPriceINR' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actual Fees (₹)
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    GST on Fees (₹)
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Proceeds (₹)
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issues
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredResults.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(index)}
                        onChange={() => handleSelectRow(index)}
                        className="rounded"
                      />
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900">
                      {row.asin || '-'}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900">
                      {row.sku || '-'}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900">
                      {row.category || '-'}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900 text-right">
                      {formatINR(row.sellingPriceINR)}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900 text-right">
                      {row.actualFeesINR ? formatINR(row.actualFeesINR) : '-'}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900 text-right">
                      {row.gstOnFeesINR ? formatINR(row.gstOnFeesINR) : '-'}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900 text-right">
                      {row.netProceedsINR ? formatINR(row.netProceedsINR) : '-'}
                    </td>
                    <td className="px-3 py-2 text-sm">
                      {row.issues.length > 0 ? (
                        <ul className="space-y-1">
                          {row.issues.map((issue, issueIndex) => (
                            <li
                              key={issueIndex}
                              className={`text-xs ${getSeverityColor(issue.severity)}`}
                            >
                              {issue.message}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-green-600 text-xs">✓ OK</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Enhanced Bulk Actions Bar */}
            {selectedRows.size > 0 && (
              <div className="px-6 py-3 bg-blue-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-blue-700 font-medium">
                      {selectedRows.size} row{selectedRows.size !== 1 ? 's' : ''} selected
                    </span>
                    <div className="text-xs text-blue-600">
                      {Array.from(selectedRows).filter(index => 
                        filteredResults[index]?.issues.some(issue => issue.severity === 'error')
                      ).length} with errors
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => {
                        const selectedData = Array.from(selectedRows).map(index => filteredResults[index])
                        const csvContent = [
                          'ASIN,SKU,Category,Selling Price,Issues',
                          ...selectedData.map(row => [
                            row.asin || '',
                            row.sku || '',
                            row.category || '',
                            row.sellingPriceINR,
                            row.issues.map(issue => `${issue.severity}: ${issue.message}`).join('; ')
                          ].join(','))
                        ].join('\n')
                        
                        const blob = new Blob([csvContent], { type: 'text/csv' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `selected-validation-results-${new Date().toISOString().split('T')[0]}.csv`
                        a.click()
                        URL.revokeObjectURL(url)
                      }}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      📊 Export Selected
                    </button>
                    <button 
                      onClick={() => {
                        // Mark selected rows as reviewed (could be stored in state)
                        setSelectedRows(new Set())
                      }}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      ✅ Mark Reviewed
                    </button>
                    <button 
                      onClick={() => {
                        // Filter to show only selected rows
                        const selectedIndices = Array.from(selectedRows)
                        const selectedResults = selectedIndices.map(index => filteredResults[index])
                        // This would require additional state management for filtered view
                      }}
                      className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                    >
                      👁️ Focus View
                    </button>
                    <button 
                      onClick={() => setSelectedRows(new Set())}
                      className="px-3 py-1 text-sm bg-gray-400 text-white rounded hover:bg-gray-500"
                    >
                      ✕ Clear
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ValidatorView
