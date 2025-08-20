import React, { useState, useMemo, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { buildCashflow } from './engine'
import { CashflowInput } from './types'
import { selectDataset } from '../imports/selectors'
import { getDefaultRates } from '../../lib/calc/defaults'
import { Event, Order, USPO } from '../../lib/types'

const CashflowView: React.FC = () => {
  const events = useSelector(selectDataset('events')) as Event[]
  const orders = useSelector(selectDataset('indiaListings')) as Order[]
  const uspos = useSelector(selectDataset('uspo')) as USPO[]
  const rates = getDefaultRates()
  
  const [input, setInput] = useState<CashflowInput>({
    openingINR: 1000000, // 10 lakh INR
    horizonDays: 90,
    settlementLagDays: 30,
    fx: rates.FX,
  })
  
  const [result, setResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showChart, setShowChart] = useState(true)
  
  // Advanced filtering states
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  
  // Scenario analysis states
  const [scenarios, setScenarios] = useState<any[]>([])
  const [currentScenario, setCurrentScenario] = useState('realistic')
  const [showScenarios, setShowScenarios] = useState(false)
  
  // Enhanced event details states
  const [expandedEvents, setExpandedEvents] = useState<Set<number>>(new Set())
  
  // Keyboard shortcuts and accessibility
  const [showShortcuts, setShowShortcuts] = useState(false)
  
  // Advanced features states
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [showAdvancedCharts, setShowAdvancedCharts] = useState(false)
  const [dashboardLayout, setDashboardLayout] = useState('default')
  const [showHistorical, setShowHistorical] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  const handleCompute = async () => {
    setIsLoading(true)
    try {
      // Simulate computation time for better UX
      await new Promise(resolve => setTimeout(resolve, 500))
      const cashflowResult = buildCashflow(
        { events, orders, uspos },
        input,
        rates
      )
      setResult(cashflowResult)
    } catch (error) {
      console.error('Cashflow computation error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-compute when data changes
  useEffect(() => {
    if (events.length > 0 && orders.length > 0 && uspos.length > 0) {
      handleCompute()
    }
  }, [events.length, orders.length, uspos.length])

  // Real-time updates with debouncing
  useEffect(() => {
    if (!autoRefresh) return
    
    const timeoutId = setTimeout(() => {
      if (events.length > 0 && orders.length > 0 && uspos.length > 0) {
        handleCompute()
      }
    }, 2000) // 2 second debounce
    
    return () => clearTimeout(timeoutId)
  }, [events, orders, uspos, autoRefresh])

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'e':
            e.preventDefault()
            handleExport()
            break
          case 'r':
            e.preventDefault()
            handleCompute()
            break
          case 'f':
            e.preventDefault()
            setShowFilters(!showFilters)
            break
          case 's':
            e.preventDefault()
            setShowScenarios(!showScenarios)
            break
          case '?':
            e.preventDefault()
            setShowShortcuts(!showShortcuts)
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showFilters, showScenarios, showShortcuts])

  // Memoized calculations for performance
  const kpiMetrics = useMemo(() => {
    if (!result) return null
    
    const totalInflow = result.events
      .filter((e: any) => e.type === 'INFLOW')
      .reduce((sum: number, e: any) => sum + e.amountINR, 0)
    
    const totalOutflow = result.events
      .filter((e: any) => e.type === 'OUTFLOW')
      .reduce((sum: number, e: any) => sum + e.amountINR, 0)
    
    const endingBalance = result.daily[result.daily.length - 1]?.balance || input.openingINR
    const netCashflow = endingBalance - input.openingINR
    
    return {
      runwayDays: result.runwayDays,
      endingBalance,
      totalInflow,
      totalOutflow,
      netCashflow,
      eventCount: result.events.length
    }
  }, [result, input.openingINR])

  // Chart data for visualization
  const chartData = useMemo(() => {
    if (!result?.daily) return []
    
    return result.daily.map((day: { balance: number; date: string }, index: number) => ({
      x: index,
      y: day.balance,
      date: day.date
    }))
  }, [result])
  
  const formatINR = (amount: number) => {
    return `₹${Math.round(amount).toLocaleString('en-IN')}`
  }

  // Export functionality
  const handleExport = () => {
    if (!result) return
    
    const csvData = [
      ['Date', 'Balance (₹)', 'Events'],
      ...result.daily.map((day: any) => [
        day.date,
        day.balance.toFixed(2),
        result.events.filter((e: any) => e.date.startsWith(day.date)).length
      ])
    ]
    
    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `cashflow-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Scenario analysis
  const createScenarios = () => {
    const optimistic = { ...input, fx: input.fx * 0.95, settlementLagDays: input.settlementLagDays - 5 }
    const pessimistic = { ...input, fx: input.fx * 1.05, settlementLagDays: input.settlementLagDays + 5 }
    const realistic = input
    
    return [
      { name: 'Optimistic', params: optimistic, color: 'green' },
      { name: 'Realistic', params: realistic, color: 'blue' },
      { name: 'Pessimistic', params: pessimistic, color: 'red' }
    ]
  }

  // Toggle event expansion
  const toggleEventExpansion = (index: number) => {
    const newExpanded = new Set(expandedEvents)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedEvents(newExpanded)
  }

  // Advanced chart calculations
  const waterfallData = useMemo(() => {
    if (!result?.events) return []
    
    return result.events.map((event: any, index: number) => ({
      label: event.label,
      value: event.type === 'INFLOW' ? event.amountINR : -event.amountINR,
      type: event.type,
      date: event.date
    }))
  }, [result])

  const burnRateData = useMemo(() => {
    if (!result?.daily) return []
    
    const burnRates = []
    for (let i = 1; i < result.daily.length; i++) {
      const dailyChange = result.daily[i].balance - result.daily[i-1].balance
      burnRates.push({
        day: i,
        burnRate: dailyChange,
        cumulative: result.daily[i].balance
      })
    }
    return burnRates
  }, [result])

  // Historical comparison data (simulated)
  const historicalData = useMemo(() => {
    if (!result) return null
    
    // Simulate historical data for comparison
    const historical = {
      previousMonth: {
        runwayDays: Math.max(1, result.runwayDays - 15),
        endingBalance: result.daily[result.daily.length - 1]?.balance * 0.8,
        totalInflow: kpiMetrics?.totalInflow * 0.9 || 0,
        totalOutflow: kpiMetrics?.totalOutflow * 0.95 || 0
      },
      currentMonth: {
        runwayDays: result.runwayDays,
        endingBalance: result.daily[result.daily.length - 1]?.balance,
        totalInflow: kpiMetrics?.totalInflow || 0,
        totalOutflow: kpiMetrics?.totalOutflow || 0
      }
    }
    return historical
  }, [result, kpiMetrics])

  // Render cashflow chart
  const renderChart = () => {
    if (!chartData.length) return null
    
    const width = 800
    const height = 300
    const margin = { top: 20, right: 30, bottom: 40, left: 60 }
    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom
    
    const minBalance = Math.min(...chartData.map((d: { y: number }) => d.y))
    const maxBalance = Math.max(...chartData.map((d: { y: number }) => d.y))
    const balanceRange = maxBalance - minBalance
    
    const xScale = (x: number) => margin.left + (x / (chartData.length - 1)) * chartWidth
    const yScale = (y: number) => margin.top + chartHeight - ((y - minBalance) / balanceRange) * chartHeight
    
    const points = chartData.map((d: { x: number; y: number }) => `${xScale(d.x)},${yScale(d.y)}`).join(' ')
    
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Cashflow Trend</h3>
          <button
            onClick={() => setShowChart(!showChart)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showChart ? 'Hide Chart' : 'Show Chart'}
          </button>
        </div>
        
        {showChart && (
          <div className="overflow-x-auto">
            <svg width={width} height={height} className="w-full">
              {/* Grid lines */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* Y-axis */}
              <line
                x1={margin.left}
                y1={margin.top}
                x2={margin.left}
                y2={height - margin.bottom}
                stroke="#d1d5db"
                strokeWidth="2"
              />
              
              {/* X-axis */}
              <line
                x1={margin.left}
                y1={height - margin.bottom}
                x2={width - margin.right}
                y2={height - margin.bottom}
                stroke="#d1d5db"
                strokeWidth="2"
              />
              
              {/* Chart line */}
              <polyline
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="3"
                points={points}
              />
              
              {/* Gradient definition */}
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
              
              {/* Data points */}
              {chartData.map((point: { x: number; y: number }, index: number) => (
                <circle
                  key={index}
                  cx={xScale(point.x)}
                  cy={yScale(point.y)}
                  r="4"
                  fill="#3b82f6"
                  className="hover:r-6 transition-all duration-200"
                />
              ))}
              
              {/* Labels */}
              <text x={margin.left - 10} y={height / 2} textAnchor="end" className="text-sm fill-gray-600">
                Balance (₹)
              </text>
              <text x={width / 2} y={height - 5} textAnchor="middle" className="text-sm fill-gray-600">
                Days
              </text>
            </svg>
          </div>
        )}
      </div>
    )
  }

  // Render waterfall chart
  const renderWaterfallChart = () => {
    if (!waterfallData.length) return null
    
    const width = 800
    const height = 400
    const margin = { top: 20, right: 30, bottom: 60, left: 80 }
    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom
    
    const maxValue = Math.max(...waterfallData.map((d: { value: number }) => Math.abs(d.value)))
    const yScale = (value: number) => margin.top + chartHeight - (value / maxValue) * chartHeight
    
    let cumulative = 0
    const bars = waterfallData.map((item: { value: number; type: string }, index: number) => {
      const barHeight = Math.abs(item.value) / maxValue * chartHeight
      const y = item.value >= 0 ? yScale(cumulative + item.value) : yScale(cumulative)
      cumulative += item.value
      
      return {
        x: margin.left + (index / waterfallData.length) * chartWidth,
        y,
        width: chartWidth / waterfallData.length - 2,
        height: barHeight,
        value: item.value,
        type: item.type
      }
    })
    
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Cashflow Waterfall</h3>
          <div className="text-sm text-gray-500">
            Cumulative cashflow impact
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <svg width={width} height={height} className="w-full">
            {/* Grid */}
            <defs>
              <pattern id="waterfallGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#waterfallGrid)" />
            
            {/* Bars */}
            {bars.map((bar: { x: number; y: number; width: number; height: number; type: string }, index: number) => (
              <rect
                key={index}
                x={bar.x}
                y={bar.y}
                width={bar.width}
                height={bar.height}
                fill={bar.type === 'INFLOW' ? '#10b981' : '#ef4444'}
                className="hover:opacity-80 transition-opacity"
              />
            ))}
            
            {/* Labels */}
            <text x={margin.left - 10} y={height / 2} textAnchor="end" className="text-sm fill-gray-600">
              Balance (₹)
            </text>
            <text x={width / 2} y={height - 10} textAnchor="middle" className="text-sm fill-gray-600">
              Events Timeline
            </text>
          </svg>
        </div>
      </div>
    )
  }

  // Render burn rate chart
  const renderBurnRateChart = () => {
    if (!burnRateData.length) return null
    
    const width = 800
    const height = 300
    const margin = { top: 20, right: 30, bottom: 40, left: 60 }
    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom
    
    const maxBurnRate = Math.max(...burnRateData.map(d => Math.abs(d.burnRate)))
    const yScale = (value: number) => margin.top + chartHeight - ((value + maxBurnRate) / (2 * maxBurnRate)) * chartHeight
    
    const points = burnRateData.map((point, index) => ({
      x: margin.left + (index / (burnRateData.length - 1)) * chartWidth,
      y: yScale(point.burnRate)
    }))
    
    const linePath = points.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ')
    
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Daily Burn Rate</h3>
          <div className="text-sm text-gray-500">
            Daily cashflow changes
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <svg width={width} height={height} className="w-full">
            {/* Grid */}
            <defs>
              <pattern id="burnRateGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#burnRateGrid)" />
            
            {/* Zero line */}
            <line
              x1={margin.left}
              y1={yScale(0)}
              x2={width - margin.right}
              y2={yScale(0)}
              stroke="#d1d5db"
              strokeWidth="2"
              strokeDasharray="5,5"
            />
            
            {/* Burn rate line */}
            <path
              d={linePath}
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="3"
            />
            
            {/* Data points */}
            {points.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="4"
                fill="#8b5cf6"
                className="hover:r-6 transition-all duration-200"
              />
            ))}
            
            {/* Labels */}
            <text x={margin.left - 10} y={height / 2} textAnchor="end" className="text-sm fill-gray-600">
              Daily Change (₹)
            </text>
            <text x={width / 2} y={height - 5} textAnchor="middle" className="text-sm fill-gray-600">
              Days
            </text>
          </svg>
        </div>
      </div>
    )
  }
  
  return (
    <div 
      data-testid="cashflow-view" 
      className={`${isMobile ? 'p-3' : 'p-6'}`}
      role="main"
      aria-label="Cashflow Analysis Dashboard"
    >
              <h1>Cashflow</h1>
      
      {/* Empty State */}
      {events.length === 0 && orders.length === 0 && uspos.length === 0 && (
        <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
          <div className="text-6xl mb-4">💰</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No Cashflow Data</h3>
          <p className="text-gray-600 mb-4">
            Import your events, orders, and USPO data to start cashflow analysis
          </p>
          <button
            onClick={() => window.location.href = '/imports'}
            className="btn-primary px-4 py-2 rounded-md transition-colors"
          >
            Import Data
          </button>
        </div>
      )}
      
      {/* Loading State */}
      {isLoading && (
        <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Computing Cashflow</h3>
          <p className="text-gray-600">Analyzing your financial data...</p>
        </div>
      )}
      
      {/* Input Form - Only show when there's data */}
      {(events.length > 0 || orders.length > 0 || uspos.length > 0) && (
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
          {/* Advanced Controls */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Cashflow Parameters</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                aria-label="Toggle filters"
              >
                🔍 Filters
              </button>
              <button
                onClick={() => setShowScenarios(!showScenarios)}
                className="btn-primary px-3 py-1 text-sm rounded"
                aria-label="Toggle scenarios"
              >
                📊 Scenarios
              </button>
              <button
                onClick={handleExport}
                disabled={!result}
                className="btn-success px-3 py-1 text-sm rounded disabled:opacity-50"
                aria-label="Export data"
              >
                📥 Export
              </button>
              <button
                onClick={() => setShowShortcuts(!showShortcuts)}
                className="btn-neutral px-3 py-1 text-sm rounded"
                aria-label="Show shortcuts"
              >
                ⌨️ Shortcuts
              </button>
              <button
                onClick={() => setShowAdvancedCharts(!showAdvancedCharts)}
                className="btn-primary px-3 py-1 text-sm rounded"
                aria-label="Toggle advanced charts"
              >
                📊 Advanced
              </button>
              <button
                onClick={() => setShowHistorical(!showHistorical)}
                className="btn-secondary px-3 py-1 text-sm rounded"
                aria-label="Show historical comparison"
              >
                📈 History
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Advanced Filters</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">End Date</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Event Types</label>
                  <select
                    multiple
                    value={selectedCategories}
                    onChange={(e) => setSelectedCategories(Array.from(e.target.selectedOptions, option => option.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="INFLOW">Cash Inflow</option>
                    <option value="OUTFLOW">Cash Outflow</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Scenario Analysis */}
          {showScenarios && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Scenario Analysis</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {createScenarios().map((scenario) => (
                  <div
                    key={scenario.name}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      currentScenario === scenario.name.toLowerCase()
                        ? `border-${scenario.color}-500 bg-${scenario.color}-50`
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                    onClick={() => setCurrentScenario(scenario.name.toLowerCase())}
                    role="button"
                    tabIndex={0}
                    aria-label={`Select ${scenario.name} scenario`}
                  >
                    <h5 className="font-medium text-gray-900">{scenario.name}</h5>
                    <p className="text-sm text-gray-600">
                      FX: {scenario.params.fx.toFixed(2)} | Lag: {scenario.params.settlementLagDays} days
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Keyboard Shortcuts Help */}
          {showShortcuts && (
            <div className="mb-4 p-4 bg-purple-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Keyboard Shortcuts</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div><kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl+E</kbd> Export</div>
                <div><kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl+R</kbd> Refresh</div>
                <div><kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl+F</kbd> Filters</div>
                <div><kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl+S</kbd> Scenarios</div>
              </div>
            </div>
          )}

          {/* Advanced Features Panel */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Advanced Features</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoRefresh"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="autoRefresh" className="text-sm text-gray-600">
                  Auto-refresh data
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={dashboardLayout}
                  onChange={(e) => setDashboardLayout(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="default">Default Layout</option>
                  <option value="compact">Compact Layout</option>
                  <option value="detailed">Detailed Layout</option>
                </select>
                <label className="text-sm text-gray-600">Dashboard Layout</label>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  {isMobile ? '📱 Mobile View' : '🖥️ Desktop View'}
                </span>
              </div>
            </div>
          </div>
        <h3 className="text-lg font-medium mb-4">Cashflow Parameters</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Opening Balance (₹)
            </label>
            <input
              type="number"
              value={input.openingINR}
              onChange={(e) => setInput({ ...input, openingINR: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Horizon (Days)
            </label>
            <input
              type="number"
              value={input.horizonDays}
              onChange={(e) => setInput({ ...input, horizonDays: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Settlement Lag (Days)
            </label>
            <input
              type="number"
              value={input.settlementLagDays}
              onChange={(e) => setInput({ ...input, settlementLagDays: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              FX Rate
            </label>
            <input
              type="number"
              value={input.fx}
              onChange={(e) => setInput({ ...input, fx: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <button
          onClick={handleCompute}
          disabled={isLoading}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Computing...' : 'Compute Cashflow'}
        </button>
      </div>
      )}
      
      {/* KPI Dashboard */}
      {kpiMetrics && !isLoading && (
        <div className={`grid gap-4 mb-6 ${
          isMobile 
            ? 'grid-cols-1' 
            : dashboardLayout === 'compact' 
            ? 'grid-cols-2 lg:grid-cols-4' 
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
        }`}>
          {/* Runway Days */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Runway Days</p>
                <p className="text-gray-900 text-2xl font-bold">{kpiMetrics.runwayDays}</p>
              </div>
              <div className="text-3xl">⏰</div>
            </div>
            <div className="mt-2 text-xs opacity-90">
              {kpiMetrics.runwayDays < 30 ? '⚠️ Critical' : kpiMetrics.runwayDays < 60 ? '⚠️ Warning' : '✅ Healthy'}
            </div>
          </div>
          
          {/* Ending Balance */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Ending Balance</p>
                <p className="text-gray-900 text-2xl font-bold">{formatINR(kpiMetrics.endingBalance)}</p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
            <div className="mt-2 text-xs opacity-90">
              {kpiMetrics.netCashflow >= 0 ? '📈 Positive' : '📉 Negative'}
            </div>
          </div>
          
          {/* Total Inflow */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Inflow</p>
                <p className="text-gray-900 text-2xl font-bold">{formatINR(kpiMetrics.totalInflow)}</p>
              </div>
              <div className="text-3xl">📥</div>
            </div>
            <div className="mt-2 text-xs opacity-90">
              {kpiMetrics.eventCount} events
            </div>
          </div>
          
          {/* Total Outflow */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Outflow</p>
                <p className="text-gray-900 text-2xl font-bold">{formatINR(kpiMetrics.totalOutflow)}</p>
              </div>
              <div className="text-3xl">📤</div>
            </div>
            <div className="mt-2 text-xs opacity-90">
              Net: {formatINR(kpiMetrics.netCashflow)}
            </div>
          </div>
        </div>
      )}
      
      {/* Results */}
      {result && !isLoading && (
        <div className="space-y-6">
          {/* Cashflow Chart */}
          {renderChart()}
          
          {/* Advanced Charts */}
          {showAdvancedCharts && (
            <>
              {renderWaterfallChart()}
              {renderBurnRateChart()}
            </>
          )}
          
          {/* Historical Comparison */}
          {showHistorical && historicalData && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium mb-4">Historical Comparison</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-3">Previous Month</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Runway Days:</span>
                      <span className="text-sm font-medium">{historicalData.previousMonth.runwayDays}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Ending Balance:</span>
                      <span className="text-sm font-medium">{formatINR(historicalData.previousMonth.endingBalance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Inflow:</span>
                      <span className="text-sm font-medium">{formatINR(historicalData.previousMonth.totalInflow)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Outflow:</span>
                      <span className="text-sm font-medium">{formatINR(historicalData.previousMonth.totalOutflow)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-3">Current Month</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Runway Days:</span>
                      <span className="text-sm font-medium">{historicalData.currentMonth.runwayDays}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Ending Balance:</span>
                      <span className="text-sm font-medium">{formatINR(historicalData.currentMonth.endingBalance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Inflow:</span>
                      <span className="text-sm font-medium">{formatINR(historicalData.currentMonth.totalInflow)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Outflow:</span>
                      <span className="text-sm font-medium">{formatINR(historicalData.currentMonth.totalOutflow)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-800">
                  <strong>Trend Analysis:</strong> {
                    historicalData.currentMonth.runwayDays > historicalData.previousMonth.runwayDays 
                      ? '📈 Improving runway days' 
                      : historicalData.currentMonth.runwayDays < historicalData.previousMonth.runwayDays
                      ? '📉 Declining runway days'
                      : '➡️ Stable runway days'
                  }
                </div>
              </div>
            </div>
          )}
          
          {/* Summary */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium mb-4">Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Runway Days</p>
                <p className="text-red-600 text-2xl font-bold">{result.runwayDays}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ending Balance</p>
                <p className="text-green-600 text-2xl font-bold">
                  {formatINR(result.daily[result.daily.length - 1]?.balance || 0)}
                </p>
              </div>
            </div>
          </div>
          
          {/* Enhanced Daily Balances Table */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Daily Balances</h3>
              <div className="text-sm text-gray-500">
                Showing first 10 of {result.daily.length} days
              </div>
            </div>
            <div className="overflow-x-auto">
              <table 
                className="min-w-full border border-gray-200"
                role="table"
                aria-label="Daily cashflow balances"
              >
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b"
                      scope="col"
                    >
                      Date
                    </th>
                    <th 
                      className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b"
                      scope="col"
                    >
                      Balance (₹)
                    </th>
                    <th 
                      className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b"
                      scope="col"
                    >
                      Events
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {result.daily.slice(0, 10).map((day: any, index: number) => {
                    const dayEvents = result.events.filter((e: any) => e.date.startsWith(day.date))
                    return (
                      <tr 
                        key={index} 
                        className="hover:bg-gray-50"
                        role="row"
                      >
                        <td 
                          className="px-3 py-2 text-sm text-gray-900 border-b"
                          role="cell"
                        >
                          {day.date}
                        </td>
                        <td 
                          className="px-3 py-2 text-sm text-gray-900 text-right border-b"
                          role="cell"
                        >
                          {formatINR(day.balance)}
                        </td>
                        <td 
                          className="px-3 py-2 text-sm text-gray-600 text-center border-b"
                          role="cell"
                        >
                          {dayEvents.length > 0 ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                              {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Enhanced Events List */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Cashflow Events</h3>
              <div className="text-sm text-gray-500">
                {result.events.length} total events
              </div>
            </div>
            <div className="space-y-2" role="list" aria-label="Cashflow events">
              {result.events.slice(0, 10).map((event: any, index: number) => (
                <div 
                  key={index} 
                  className="border border-gray-200 rounded-lg overflow-hidden"
                  role="listitem"
                >
                  {/* Event Header */}
                  <div 
                    className="flex justify-between items-center p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleEventExpansion(index)}
                    onKeyDown={(e) => e.key === 'Enter' && toggleEventExpansion(index)}
                    role="button"
                    tabIndex={0}
                    aria-expanded={expandedEvents.has(index)}
                    aria-label={`${event.type} event on ${event.date.split('T')[0]} - ${event.label}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        event.type === 'INFLOW' ? 'bg-green-500' : 'bg-red-500'
                      }`} aria-hidden="true"></div>
                      <div>
                        <span className="text-sm font-medium">{event.date.split('T')[0]}</span>
                        <span className="ml-2 text-sm text-gray-600">{event.label}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${
                        event.type === 'INFLOW' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {event.type === 'INFLOW' ? '+' : '-'}{formatINR(event.amountINR)}
                      </span>
                      <span className="text-gray-400">
                        {expandedEvents.has(index) ? '▼' : '▶'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Expanded Event Details */}
                  {expandedEvents.has(index) && (
                    <div className="p-3 bg-white border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Event Type:</span>
                          <span className="ml-2 text-gray-600">{event.type}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Amount:</span>
                          <span className="ml-2 text-gray-600">{formatINR(event.amountINR)}</span>
                        </div>
                        {event.asin && (
                          <div>
                            <span className="font-medium text-gray-700">ASIN:</span>
                            <span className="ml-2 text-gray-600">{event.asin}</span>
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-gray-700">Date:</span>
                          <span className="ml-2 text-gray-600">{new Date(event.date).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {result.events.length > 10 && (
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">
                    Showing first 10 of {result.events.length} events
                  </p>
                  <button 
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                    onClick={() => {/* TODO: Implement pagination */}}
                  >
                    Load more events
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CashflowView
