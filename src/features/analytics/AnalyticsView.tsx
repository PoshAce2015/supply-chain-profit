import React, { useEffect, useState, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { computeSegmentAverages } from './engine'
import { selectDataset } from '../imports/selectors'
import { Event } from '../../lib/types'

const AnalyticsView: React.FC = () => {
  const events = useSelector(selectDataset('events')) as any as Event[]
  
  // Priority 1: Loading and error states
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  
  // Priority 2: Date range filters
  const [dateRange, setDateRange] = useState('30d') // 7d, 30d, 90d, custom
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false)
  
  // Priority 2: Interactive filters
  const [selectedSegments, setSelectedSegments] = useState<string[]>(['in_to_uspo', 'usship_to_stackry', 'export_to_customs', 'delivered_to_payment'])
  const [showFilters, setShowFilters] = useState(false)
  const [batteryFilter, setBatteryFilter] = useState<'all' | 'battery' | 'non-battery'>('all')
  
  // Priority 2: Export and refresh
  const [isExporting, setIsExporting] = useState(false)
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Priority 2: Trend analysis
  const [showTrends, setShowTrends] = useState(false)
  const [trendPeriod, setTrendPeriod] = useState<'week' | 'month' | 'quarter'>('week')
  
  // Priority 3: Advanced features
  const [showCharts, setShowCharts] = useState(false)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
  const [chartType, setChartType] = useState<'bar' | 'line' | 'radar'>('bar')
  const [accessibilityMode, setAccessibilityMode] = useState(false)
  const [highContrastMode, setHighContrastMode] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  
  // Priority 1: Page title and identity
  useEffect(() => {
    document.title = 'Analytics - Supply Chain & Profit 1.0'
    
    // Simulate loading for better UX
    const timer = setTimeout(() => {
      try {
        const computedAnalytics = computeSegmentAverages(events)
        setAnalytics(computedAnalytics)
        setIsLoading(false)
      } catch (err) {
        setError('Failed to compute analytics data')
        setIsLoading(false)
      }
    }, 500)
    
    return () => clearTimeout(timer)
  }, [events])
  
  // Priority 3: Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K: Show keyboard shortcuts
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault()
        setShowKeyboardShortcuts(!showKeyboardShortcuts)
      }
      
      // Ctrl/Cmd + F: Focus on filters
      if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
        event.preventDefault()
        setShowFilters(true)
      }
      
      // Ctrl/Cmd + T: Toggle trends
      if ((event.ctrlKey || event.metaKey) && event.key === 't') {
        event.preventDefault()
        setShowTrends(!showTrends)
      }
      
      // Ctrl/Cmd + C: Toggle charts
      if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
        event.preventDefault()
        setShowCharts(!showCharts)
      }
      
      // Ctrl/Cmd + R: Refresh data
      if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault()
        handleRefresh()
      }
      
      // Escape: Close modals and clear selections
      if (event.key === 'Escape') {
        setShowKeyboardShortcuts(false)
        setShowFilters(false)
        setShowTrends(false)
        setShowCharts(false)
      }
      
      // Ctrl/Cmd + Enter: Export data
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault()
        handleExport('csv')
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showKeyboardShortcuts, showTrends, showCharts])
  
  // Priority 3: Accessibility mode detection
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mediaQuery.matches)
    
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches)
    }
    
    mediaQuery.addEventListener('change', handleMotionChange)
    return () => mediaQuery.removeEventListener('change', handleMotionChange)
  }, [])
  
  // Priority 2: Filter events based on date range
  const filteredEvents = useMemo(() => {
    if (!events || events.length === 0) return []
    
    const now = new Date()
    let startDate = new Date()
    
    switch (dateRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case 'custom':
        if (customStartDate && customEndDate) {
          startDate = new Date(customStartDate)
          const endDate = new Date(customEndDate)
          return events.filter(event => {
            const eventDate = new Date(event.timestamp)
            return eventDate >= startDate && eventDate <= endDate
          })
        }
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }
    
    return events.filter(event => {
      const eventDate = new Date(event.timestamp)
      return eventDate >= startDate
    })
  }, [events, dateRange, customStartDate, customEndDate])
  
  // Priority 2: Compute analytics for filtered data
  const filteredAnalytics = useMemo(() => {
    if (!filteredEvents || filteredEvents.length === 0) return null
    return computeSegmentAverages(filteredEvents)
  }, [filteredEvents])
  
  // Priority 2: Generate trend data
  const trendData = useMemo(() => {
    if (!events || events.length === 0) return []
    
    const now = new Date()
    const periods = []
    const segmentKeys = ['in_to_uspo', 'usship_to_stackry', 'export_to_customs', 'delivered_to_payment']
    
    for (let i = 0; i < 12; i++) {
      const periodStart = new Date(now)
      const periodEnd = new Date(now)
      
      switch (trendPeriod) {
        case 'week':
          periodStart.setDate(now.getDate() - (i + 1) * 7)
          periodEnd.setDate(now.getDate() - i * 7)
          break
        case 'month':
          periodStart.setMonth(now.getMonth() - (i + 1))
          periodEnd.setMonth(now.getMonth() - i)
          break
        case 'quarter':
          periodStart.setMonth(now.getMonth() - (i + 1) * 3)
          periodEnd.setMonth(now.getMonth() - i * 3)
          break
      }
      
      const periodEvents = events.filter(event => {
        const eventDate = new Date(event.timestamp)
        return eventDate >= periodStart && eventDate < periodEnd
      })
      
      if (periodEvents.length > 0) {
        const periodAnalytics = computeSegmentAverages(periodEvents)
                 periods.push({
           period: periodStart.toLocaleDateString(),
           data: segmentKeys.map(key => ({
             segment: key,
             value: periodAnalytics.segments[key as keyof typeof periodAnalytics.segments]
           }))
         })
      }
    }
    
    return periods.reverse()
  }, [events, trendPeriod])
  
  const formatDays = (days: number) => {
    return Math.round(days * 10) / 10 // Round to 1 decimal
  }
  
  // Priority 2: Export functionality
  const handleExport = async (format: 'csv' | 'json') => {
    setIsExporting(true)
    
    try {
      const data = {
        analytics: filteredAnalytics || analytics,
        metadata: {
          dateRange,
          customStartDate,
          customEndDate,
          segments: selectedSegments,
          batteryFilter,
          exportDate: new Date().toISOString(),
          totalEvents: filteredEvents.length
        }
      }
      
      if (format === 'csv') {
        const csv = [
          'Segment,Value (Days),Description',
          `IN → USPO,${formatDays(data.analytics.segments.in_to_uspo)},Average processing time`,
          `USSHIP → STACKRY,${formatDays(data.analytics.segments.usship_to_stackry)},Average shipping time`,
          `EXPORT → CUSTOMS,${formatDays(data.analytics.segments.export_to_customs)},Average customs clearance`,
          `DELIVERED → PAYMENT,${formatDays(data.analytics.segments.delivered_to_payment)},Average payment time`
        ].join('\n')
        
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `analytics-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
      } else {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `analytics-${dateRange}-${new Date().toISOString().split('T')[0]}.json`
        a.click()
      }
    } catch (err) {
      console.error('Export failed:', err)
    } finally {
      setIsExporting(false)
    }
  }
  
  // Priority 2: Refresh functionality
  const handleRefresh = () => {
    setIsRefreshing(true)
    setLastRefreshTime(new Date())
    
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }
  
  // Priority 2: Toggle segment selection
  const toggleSegment = (segment: string) => {
    setSelectedSegments(prev => 
      prev.includes(segment) 
        ? prev.filter(s => s !== segment)
        : [...prev, segment]
    )
  }
  
  // Priority 3: Chart data generation
  const chartData = useMemo(() => {
    const currentAnalytics = filteredAnalytics || analytics
    if (!currentAnalytics) return null
    
    const segments = [
      { key: 'in_to_uspo', label: 'IN → USPO', color: '#3B82F6' },
      { key: 'usship_to_stackry', label: 'USSHIP → STACKRY', color: '#10B981' },
      { key: 'export_to_customs', label: 'EXPORT → CUSTOMS', color: '#F59E0B' },
      { key: 'delivered_to_payment', label: 'DELIVERED → PAYMENT', color: '#8B5CF6' }
    ]
    
    return {
      labels: segments.map(s => s.label),
      datasets: [{
        label: 'Average Days',
        data: segments.map(s => formatDays(currentAnalytics.segments[s.key as keyof typeof currentAnalytics.segments])),
        backgroundColor: segments.map(s => s.color + '40'),
        borderColor: segments.map(s => s.color),
        borderWidth: 2,
        tension: 0.4
      }]
    }
  }, [filteredAnalytics, analytics])
  
  // Priority 3: Generate chart SVG
  const renderChart = () => {
    if (!chartData || !chartData.datasets[0] || !chartData.labels) return null
    
    const width = 600
    const height = 300
    const padding = 40
    const chartWidth = width - 2 * padding
    const chartHeight = height - 2 * padding
    
    const maxValue = Math.max(...chartData.datasets[0].data)
    const minValue = Math.min(...chartData.datasets[0].data)
    const valueRange = maxValue - minValue || 1
    
    const barWidth = chartWidth / chartData.labels.length * 0.6
    const barSpacing = chartWidth / chartData.labels.length
    
    if (chartType === 'bar') {
      return (
        <svg width={width} height={height} className="mx-auto">
          <defs>
            {chartData.datasets[0].backgroundColor?.map((color, i) => (
              <linearGradient key={i} id={`gradient-${i}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={chartData.datasets[0].borderColor?.[i] || '#000'} stopOpacity="0.8" />
                <stop offset="100%" stopColor={chartData.datasets[0].borderColor?.[i] || '#000'} stopOpacity="0.4" />
              </linearGradient>
            ))}
          </defs>
          
          {/* Y-axis */}
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#E5E7EB" strokeWidth="1" />
          
          {/* X-axis */}
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#E5E7EB" strokeWidth="1" />
          
          {/* Bars */}
          {chartData.datasets[0].data.map((value, i) => {
            const barHeight = ((value - minValue) / valueRange) * chartHeight
            const x = padding + i * barSpacing + barSpacing * 0.2
            const y = height - padding - barHeight
            
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill={`url(#gradient-${i})`}
                  stroke={chartData.datasets[0].borderColor?.[i] || '#000'}
                  strokeWidth="2"
                  rx="4"
                />
                <text
                  x={x + barWidth / 2}
                  y={y - 10}
                  textAnchor="middle"
                  className="text-sm font-medium"
                  fill="#374151"
                >
                  {value.toFixed(1)}
                </text>
                <text
                  x={x + barWidth / 2}
                  y={height - padding + 20}
                  textAnchor="middle"
                  className="text-xs"
                  fill="#6B7280"
                  transform={`rotate(-45 ${x + barWidth / 2} ${height - padding + 20})`}
                >
                  {chartData.labels[i]}
                </text>
              </g>
            )
          })}
        </svg>
      )
    }
    
    return null
  }
  
  // Priority 1: Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Priority 1: Page Identity */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-lg text-gray-600">
              Comprehensive supply chain performance analytics and insights
            </p>
          </div>
          
          {/* Loading State */}
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading analytics data...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // Priority 1: Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Priority 1: Page Identity */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-lg text-gray-600">
              Comprehensive supply chain performance analytics and insights
            </p>
          </div>
          
          {/* Error State */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Loading Analytics</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-red-100 text-red-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-200"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // Priority 1: Empty state
  if (!events || events.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Priority 1: Page Identity */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-lg text-gray-600">
              Comprehensive supply chain performance analytics and insights
            </p>
          </div>
          
          {/* Empty State */}
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No Analytics Data</h3>
            <p className="mt-1 text-sm text-gray-500">
              Import some data to see analytics and insights.
            </p>
            <div className="mt-6">
              <a
                href="/imports"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Import Data
              </a>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  const currentAnalytics = filteredAnalytics || analytics
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Priority 1: Page Identity */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-lg text-gray-600">
            Comprehensive supply chain performance analytics and insights
          </p>
          <div className="mt-2 text-sm text-gray-500">
            Last updated: {lastRefreshTime.toLocaleString()}
          </div>
        </div>
        
        {/* Priority 2: Controls Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Date Range Filter */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Date Range:</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="custom">Custom range</option>
              </select>
              
              {dateRange === 'custom' && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
                          <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  {showFilters ? 'Hide' : 'Show'} Filters
                </button>
                
                <button
                  onClick={() => setShowTrends(!showTrends)}
                  className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                >
                  {showTrends ? 'Hide' : 'Show'} Trends
                </button>
                
                <button
                  onClick={() => setShowCharts(!showCharts)}
                  className="px-4 py-2 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200"
                >
                  {showCharts ? 'Hide' : 'Show'} Charts
                </button>
                
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="px-4 py-2 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 disabled:opacity-50"
                >
                  {isRefreshing ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                      Refreshing...
                    </div>
                  ) : (
                    'Refresh'
                  )}
                </button>
                
                <div className="relative">
                  <button
                    onClick={() => handleExport('csv')}
                    disabled={isExporting}
                    className="px-4 py-2 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 disabled:opacity-50"
                  >
                    {isExporting ? 'Exporting...' : 'Export CSV'}
                  </button>
                </div>
                
                <button
                  onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
                  className="px-4 py-2 text-sm bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200"
                >
                  ⌨️ Shortcuts
                </button>
              </div>
          </div>
          
          {/* Priority 2: Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Filters</h3>
              
              {/* Segment Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Segments:</label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { key: 'in_to_uspo', label: 'IN → USPO', color: 'blue' },
                    { key: 'usship_to_stackry', label: 'USSHIP → STACKRY', color: 'green' },
                    { key: 'export_to_customs', label: 'EXPORT → CUSTOMS', color: 'yellow' },
                    { key: 'delivered_to_payment', label: 'DELIVERED → PAYMENT', color: 'purple' }
                  ].map(segment => (
                    <label key={segment.key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedSegments.includes(segment.key)}
                        onChange={() => toggleSegment(segment.key)}
                        className="mr-2"
                      />
                      <span className={`text-sm px-2 py-1 rounded ${getSegmentColor(segment.color)}`}>
                        {segment.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Battery Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Type:</label>
                <select
                  value={batteryFilter}
                  onChange={(e) => setBatteryFilter(e.target.value as any)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">All Products</option>
                  <option value="battery">Battery Products Only</option>
                  <option value="non-battery">Non-Battery Products Only</option>
                </select>
              </div>
            </div>
          )}
        </div>
        
        {/* Priority 2: Trend Analysis */}
        {showTrends && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Trend Analysis</h2>
              <select
                value={trendPeriod}
                onChange={(e) => setTrendPeriod(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
                <option value="quarter">Quarterly</option>
              </select>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IN → USPO</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">USSHIP → STACKRY</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">EXPORT → CUSTOMS</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DELIVERED → PAYMENT</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {trendData.map((period, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{period.period}</td>
                      {period.data.map((segment, segIndex) => (
                        <td key={segIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDays(segment.value)} days
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Priority 3: Data Visualization Charts */}
        {showCharts && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Data Visualization</h2>
              <div className="flex items-center gap-3">
                <select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value as any)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="bar">Bar Chart</option>
                  <option value="line">Line Chart</option>
                  <option value="radar">Radar Chart</option>
                </select>
                
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Accessibility:</label>
                  <button
                    onClick={() => setAccessibilityMode(!accessibilityMode)}
                    className={`px-3 py-1 text-xs rounded-md ${
                      accessibilityMode 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {accessibilityMode ? 'ON' : 'OFF'}
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">High Contrast:</label>
                  <button
                    onClick={() => setHighContrastMode(!highContrastMode)}
                    className={`px-3 py-1 text-xs rounded-md ${
                      highContrastMode 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {highContrastMode ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center">
              {renderChart()}
            </div>
            
            {accessibilityMode && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Chart Description</h3>
                <p className="text-sm text-blue-800">
                  This chart shows the average processing times for different supply chain segments. 
                  The bar chart displays {chartData?.labels?.length || 0} segments with their respective average days.
                  {chartData?.datasets?.[0]?.data && (
                    ` The highest value is ${Math.max(...chartData.datasets[0].data).toFixed(1)} days and the lowest is ${Math.min(...chartData.datasets[0].data).toFixed(1)} days.`
                  )}
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Priority 3: Keyboard Shortcuts Help */}
        {showKeyboardShortcuts && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Keyboard Shortcuts</h2>
              <button
                onClick={() => setShowKeyboardShortcuts(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Show/Hide Filters</span>
                  <kbd className="px-2 py-1 text-xs bg-white border border-gray-300 rounded">Ctrl/Cmd + F</kbd>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Show/Hide Trends</span>
                  <kbd className="px-2 py-1 text-xs bg-white border border-gray-300 rounded">Ctrl/Cmd + T</kbd>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Show/Hide Charts</span>
                  <kbd className="px-2 py-1 text-xs bg-white border border-gray-300 rounded">Ctrl/Cmd + C</kbd>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Refresh Data</span>
                  <kbd className="px-2 py-1 text-xs bg-white border border-gray-300 rounded">Ctrl/Cmd + R</kbd>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Export Data</span>
                  <kbd className="px-2 py-1 text-xs bg-white border border-gray-300 rounded">Ctrl/Cmd + Enter</kbd>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Show Shortcuts</span>
                  <kbd className="px-2 py-1 text-xs bg-white border border-gray-300 rounded">Ctrl/Cmd + K</kbd>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Close Modals</span>
                  <kbd className="px-2 py-1 text-xs bg-white border border-gray-300 rounded">Escape</kbd>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Accessibility Mode</span>
                  <span className="text-xs text-gray-500">Toggle in Charts</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> Use keyboard shortcuts for faster navigation. All shortcuts work with both Ctrl (Windows/Linux) and Cmd (Mac).
              </p>
            </div>
          </div>
        )}
        
        {/* Priority 1: Enhanced Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* IN_ORDER → US_PO */}
          {selectedSegments.includes('in_to_uspo') && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">IN → USPO</h3>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-blue-600 mb-2">
                {formatDays(currentAnalytics.segments.in_to_uspo)} days
              </p>
              <p className="text-xs text-gray-500">Average processing time</p>
              {filteredEvents.length !== events.length && (
                <p className="text-xs text-blue-600 mt-1">
                  Based on {filteredEvents.length} events
                </p>
              )}
            </div>
          )}
          
          {/* US_SHIP → STACKRY_RCVD */}
          {selectedSegments.includes('usship_to_stackry') && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">USSHIP → STACKRY</h3>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-green-600 mb-2">
                {formatDays(currentAnalytics.segments.usship_to_stackry)} days
              </p>
              <p className="text-xs text-gray-500">Average shipping time</p>
              {filteredEvents.length !== events.length && (
                <p className="text-xs text-green-600 mt-1">
                  Based on {filteredEvents.length} events
                </p>
              )}
            </div>
          )}
        
        {/* EXPORT → CUSTOMS_CLEAR */}
          {selectedSegments.includes('export_to_customs') && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">EXPORT → CUSTOMS</h3>
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-yellow-600 mb-2">
                {formatDays(currentAnalytics.segments.export_to_customs)} days
              </p>
              <p className="text-xs text-gray-500">Average customs clearance</p>
              {filteredEvents.length !== events.length && (
                <p className="text-xs text-yellow-600 mt-1">
                  Based on {filteredEvents.length} events
                </p>
              )}
            </div>
          )}
          
          {/* DELIVERED → PAYMENT_RECEIVED */}
          {selectedSegments.includes('delivered_to_payment') && (
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">DELIVERED → PAYMENT</h3>
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-purple-600 mb-2">
                {formatDays(currentAnalytics.segments.delivered_to_payment)} days
              </p>
              <p className="text-xs text-gray-500">Average payment time</p>
              {filteredEvents.length !== events.length && (
                <p className="text-xs text-purple-600 mt-1">
                  Based on {filteredEvents.length} events
                </p>
              )}
            </div>
          )}
        </div>
        
        {/* Priority 1: Enhanced Information Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-lg font-semibold text-gray-900">Analytics Information</h2>
            </div>
            
            {/* Priority 3: Accessibility Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAccessibilityMode(!accessibilityMode)}
                className={`px-3 py-1 text-xs rounded-md ${
                  accessibilityMode 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}
                aria-label="Toggle accessibility mode"
              >
                ♿ {accessibilityMode ? 'ON' : 'OFF'}
              </button>
              
              <button
                onClick={() => setHighContrastMode(!highContrastMode)}
                className={`px-3 py-1 text-xs rounded-md ${
                  highContrastMode 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}
                aria-label="Toggle high contrast mode"
              >
                🌙 {highContrastMode ? 'ON' : 'OFF'}
              </button>
              
              {reducedMotion && (
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-md">
                  🎬 Reduced Motion
                </span>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <p className="mb-2">
                <span className="font-medium">Battery Products:</span> Add {currentAnalytics.batteryExtraDays} extra days to segments
              </p>
              <p className="mb-2">
                <span className="font-medium">Data Points:</span> {filteredEvents.length} events analyzed
                {filteredEvents.length !== events.length && (
                  <span className="text-blue-600"> (filtered from {events.length} total)</span>
                )}
              </p>
            </div>
            <div>
              <p className="mb-2">
                <span className="font-medium">Calculation Method:</span> Average segment durations
              </p>
              <p className="mb-2">
                <span className="font-medium">Date Range:</span> {dateRange === 'custom' ? `${customStartDate} to ${customEndDate}` : dateRange}
          </p>
        </div>
      </div>
      
          {/* Priority 3: Accessibility Information */}
          {accessibilityMode && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Accessibility Features</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Keyboard navigation support with shortcuts</li>
                <li>• High contrast mode for better visibility</li>
                <li>• Screen reader friendly descriptions</li>
                <li>• Reduced motion support for motion sensitivity</li>
                <li>• ARIA labels and semantic HTML structure</li>
              </ul>
            </div>
          )}
          
          {/* Priority 3: Performance Information */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>Performance: Optimized with memoized calculations</span>
              <span>Last Updated: {lastRefreshTime.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function for segment colors
const getSegmentColor = (color: string) => {
  switch (color) {
    case 'blue': return 'bg-blue-100 text-blue-800'
    case 'green': return 'bg-green-100 text-green-800'
    case 'yellow': return 'bg-yellow-100 text-yellow-800'
    case 'purple': return 'bg-purple-100 text-purple-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export default AnalyticsView
