# Analytics Technical Implementation Guide

## Overview

This guide provides technical details for developers working with the analytics features. It covers the implementation architecture, data flow, and key technical decisions.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Component Structure](#component-structure)
3. [State Management](#state-management)
4. [Data Flow](#data-flow)
5. [Performance Optimizations](#performance-optimizations)
6. [Accessibility Implementation](#accessibility-implementation)
7. [Testing Strategy](#testing-strategy)
8. [Future Enhancements](#future-enhancements)

## Architecture Overview

### Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **State Management**: Redux Toolkit with RTK Query
- **Styling**: Tailwind CSS with custom components
- **Charts**: Custom SVG implementation (no external dependencies)
- **Build Tool**: Vite with HMR

### File Structure

```
src/features/analytics/
├── AnalyticsView.tsx          # Main component
├── engine.ts                  # Analytics calculation engine
├── types.ts                   # TypeScript type definitions
└── __tests__/                 # Test files
    ├── AnalyticsView.test.tsx
    ├── engine.test.ts
    └── types.test.ts
```

## Component Structure

### Main Component: AnalyticsView

```typescript
interface AnalyticsViewProps {
  // No props - uses Redux store for data
}

const AnalyticsView: React.FC<AnalyticsViewProps> = () => {
  // State management
  // Data processing
  // UI rendering
}
```

### Key State Variables

```typescript
// Priority 1: Core states
const [isLoading, setIsLoading] = useState(true)
const [error, setError] = useState<string | null>(null)
const [analytics, setAnalytics] = useState<any>(null)

// Priority 2: Filter states
const [dateRange, setDateRange] = useState('30d')
const [customStartDate, setCustomStartDate] = useState('')
const [customEndDate, setCustomEndDate] = useState('')
const [selectedSegments, setSelectedSegments] = useState<string[]>([])
const [batteryFilter, setBatteryFilter] = useState<'all' | 'battery' | 'non-battery'>('all')

// Priority 3: Advanced states
const [showCharts, setShowCharts] = useState(false)
const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
const [accessibilityMode, setAccessibilityMode] = useState(false)
const [highContrastMode, setHighContrastMode] = useState(false)
```

## State Management

### Local State Strategy

The component uses React's `useState` for local UI state and `useMemo` for computed values:

```typescript
// Computed state with memoization
const filteredEvents = useMemo(() => {
  // Filter logic based on dateRange, customStartDate, customEndDate
}, [events, dateRange, customStartDate, customEndDate])

const filteredAnalytics = useMemo(() => {
  if (!filteredEvents || filteredEvents.length === 0) return null
  return computeSegmentAverages(filteredEvents)
}, [filteredEvents])

const chartData = useMemo(() => {
  // Chart data generation logic
}, [currentAnalytics])
```

### Redux Integration

```typescript
// Redux selectors
const events = useSelector(selectDataset('events')) as any as Event[]

// Redux actions (if needed)
const dispatch = useDispatch()
```

## Data Flow

### 1. Data Loading

```typescript
useEffect(() => {
  document.title = 'Analytics - Supply Chain & Profit 1.0'
  
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
```

### 2. Data Filtering

```typescript
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
```

### 3. Analytics Computation

```typescript
// Uses the engine.ts module
const filteredAnalytics = useMemo(() => {
  if (!filteredEvents || filteredEvents.length === 0) return null
  return computeSegmentAverages(filteredEvents)
}, [filteredEvents])
```

## Performance Optimizations

### 1. Memoization Strategy

```typescript
// Heavy computations are memoized
const trendData = useMemo(() => {
  if (!events || events.length === 0) return []
  
  // Complex trend calculation logic
  // Only recalculates when events or trendPeriod changes
}, [events, trendPeriod])
```

### 2. Event Listener Management

```typescript
useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    // Keyboard shortcut logic
  }
  
  document.addEventListener('keydown', handleKeyDown)
  return () => document.removeEventListener('keydown', handleKeyDown)
}, [showKeyboardShortcuts, showTrends, showCharts])
```

### 3. Media Query Optimization

```typescript
useEffect(() => {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  setReducedMotion(mediaQuery.matches)
  
  const handleMotionChange = (e: MediaQueryListEvent) => {
    setReducedMotion(e.matches)
  }
  
  mediaQuery.addEventListener('change', handleMotionChange)
  return () => mediaQuery.removeEventListener('change', handleMotionChange)
}, [])
```

## Accessibility Implementation

### 1. ARIA Labels

```typescript
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
```

### 2. Keyboard Navigation

```typescript
useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    // Ctrl/Cmd + K: Show keyboard shortcuts
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault()
      setShowKeyboardShortcuts(!showKeyboardShortcuts)
    }
    
    // Escape: Close modals
    if (event.key === 'Escape') {
      setShowKeyboardShortcuts(false)
      setShowFilters(false)
      setShowTrends(false)
      setShowCharts(false)
    }
  }
  
  document.addEventListener('keydown', handleKeyDown)
  return () => document.removeEventListener('keydown', handleKeyDown)
}, [showKeyboardShortcuts, showTrends, showCharts])
```

### 3. Screen Reader Support

```typescript
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
```

## Chart Implementation

### Custom SVG Charts

```typescript
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
        
        {/* Chart rendering logic */}
      </svg>
    )
  }
  
  return null
}
```

## Export Functionality

### CSV Export Implementation

```typescript
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
    }
  } catch (err) {
    console.error('Export failed:', err)
  } finally {
    setIsExporting(false)
  }
}
```

## Testing Strategy

### Unit Tests

```typescript
// AnalyticsView.test.tsx
describe('AnalyticsView', () => {
  it('should render loading state initially', () => {
    // Test loading state
  })
  
  it('should render analytics data when loaded', () => {
    // Test data rendering
  })
  
  it('should handle filter changes', () => {
    // Test filtering functionality
  })
  
  it('should export data correctly', () => {
    // Test export functionality
  })
})
```

### Integration Tests

```typescript
// engine.test.ts
describe('computeSegmentAverages', () => {
  it('should calculate averages correctly', () => {
    // Test calculation logic
  })
  
  it('should handle empty data', () => {
    // Test edge cases
  })
  
  it('should handle battery products', () => {
    // Test battery product logic
  })
})
```

## Future Enhancements

### Planned Technical Improvements

1. **Chart Library Integration**
   ```typescript
   // Future: Replace custom SVG with Chart.js or D3.js
   import { Chart } from 'chart.js'
   ```

2. **Real-time Updates**
   ```typescript
   // Future: WebSocket integration
   const socket = new WebSocket('ws://localhost:3001/analytics')
   socket.onmessage = (event) => {
     const newData = JSON.parse(event.data)
     setAnalytics(newData)
   }
   ```

3. **Advanced Filtering**
   ```typescript
   // Future: More sophisticated filters
   const advancedFilters = {
     dateRange: 'custom',
     segments: ['in_to_uspo', 'usship_to_stackry'],
     productTypes: ['battery'],
     performanceThresholds: {
       minDays: 1,
       maxDays: 10
     }
   }
   ```

4. **Performance Monitoring**
   ```typescript
   // Future: Performance tracking
   const performanceMetrics = {
     renderTime: 0,
     calculationTime: 0,
     memoryUsage: 0
   }
   ```

### Code Quality Improvements

1. **Type Safety**
   ```typescript
   // Future: Stricter typing
   interface AnalyticsData {
     segments: {
       in_to_uspo: number
       usship_to_stackry: number
       export_to_customs: number
       delivered_to_payment: number
     }
     batteryExtraDays: number
   }
   ```

2. **Error Boundaries**
   ```typescript
   // Future: Component-level error boundaries
   class AnalyticsErrorBoundary extends React.Component {
     // Error boundary implementation
   }
   ```

3. **Testing Coverage**
   ```typescript
   // Future: Comprehensive test coverage
   // - Unit tests for all functions
   // - Integration tests for data flow
   // - E2E tests for user interactions
   ```

## Best Practices

### Code Organization

1. **Separation of Concerns**: Keep UI logic separate from business logic
2. **Memoization**: Use `useMemo` for expensive calculations
3. **Error Handling**: Implement comprehensive error boundaries
4. **Accessibility**: Always include ARIA labels and keyboard support

### Performance Guidelines

1. **Avoid Re-renders**: Use `useMemo` and `useCallback` appropriately
2. **Cleanup**: Always cleanup event listeners and timers
3. **Lazy Loading**: Consider lazy loading for heavy components
4. **Bundle Size**: Keep dependencies minimal

### Accessibility Standards

1. **WCAG Compliance**: Follow WCAG 2.1 guidelines
2. **Keyboard Navigation**: Ensure full keyboard accessibility
3. **Screen Reader Support**: Provide meaningful descriptions
4. **Color Contrast**: Maintain proper contrast ratios

---

*This technical guide provides implementation details for developers. For user documentation, see `analytics-features.md` and `analytics-quick-reference.md`.*
