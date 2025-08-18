// KPI Performance Monitoring System
export interface PerformanceMetric {
  name: string
  startTime: number
  endTime: number
  duration: number
  metadata?: Record<string, any>
}

export interface PerformanceReport {
  totalCalculations: number
  averageCalculationTime: number
  slowestCalculation: PerformanceMetric | null
  fastestCalculation: PerformanceMetric | null
  totalRenderingTime: number
  averageRenderingTime: number
  memoryUsage: number
  timestamp: Date
}

export interface KPIPerformanceData {
  kpiId: string
  calculationTime: number
  renderingTime: number
  cacheHit: boolean
  dataSize: number
  timestamp: number
}

// Performance Monitor Class
export class KPIPerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private kpiPerformance: KPIPerformanceData[] = []
  private maxMetrics = 1000
  private maxKPIHistory = 500

  // Start timing a performance metric
  startTiming(name: string, metadata?: Record<string, any>): string {
    const id = `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const metric: PerformanceMetric = {
      name,
      startTime: performance.now(),
      endTime: 0,
      duration: 0,
      metadata
    }
    
    this.metrics.push(metric)
    
    // Clean up old metrics if we exceed max
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }
    
    return id
  }

  // End timing a performance metric
  endTiming(id: string): PerformanceMetric | null {
    const metric = this.metrics.find(m => m.name === id.split('_')[0])
    if (!metric) return null

    metric.endTime = performance.now()
    metric.duration = metric.endTime - metric.startTime
    
    return metric
  }

  // Record KPI performance data
  recordKPIPerformance(data: Omit<KPIPerformanceData, 'timestamp'>): void {
    const kpiData: KPIPerformanceData = {
      ...data,
      timestamp: Date.now()
    }
    
    this.kpiPerformance.push(kpiData)
    
    // Clean up old data if we exceed max
    if (this.kpiPerformance.length > this.maxKPIHistory) {
      this.kpiPerformance = this.kpiPerformance.slice(-this.maxKPIHistory)
    }
  }

  // Get performance metrics for a specific KPI
  getKPIPerformance(kpiId: string, timeWindow?: number): KPIPerformanceData[] {
    let data = this.kpiPerformance.filter(d => d.kpiId === kpiId)
    
    if (timeWindow) {
      const cutoff = Date.now() - timeWindow
      data = data.filter(d => d.timestamp > cutoff)
    }
    
    return data
  }

  // Get average calculation time for a KPI
  getAverageCalculationTime(kpiId: string, timeWindow?: number): number {
    const data = this.getKPIPerformance(kpiId, timeWindow)
    if (data.length === 0) return 0
    
    const total = data.reduce((sum, d) => sum + d.calculationTime, 0)
    return total / data.length
  }

  // Get average rendering time for a KPI
  getAverageRenderingTime(kpiId: string, timeWindow?: number): number {
    const data = this.getKPIPerformance(kpiId, timeWindow)
    if (data.length === 0) return 0
    
    const total = data.reduce((sum, d) => sum + d.renderingTime, 0)
    return total / data.length
  }

  // Get cache hit rate for a KPI
  getCacheHitRate(kpiId: string, timeWindow?: number): number {
    const data = this.getKPIPerformance(kpiId, timeWindow)
    if (data.length === 0) return 0
    
    const hits = data.filter(d => d.cacheHit).length
    return (hits / data.length) * 100
  }

  // Get slowest calculations
  getSlowestCalculations(limit: number = 10): PerformanceMetric[] {
    return this.metrics
      .filter(m => m.duration > 0)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit)
  }

  // Get fastest calculations
  getFastestCalculations(limit: number = 10): PerformanceMetric[] {
    return this.metrics
      .filter(m => m.duration > 0)
      .sort((a, b) => a.duration - b.duration)
      .slice(0, limit)
  }

  // Get performance report
  getPerformanceReport(): PerformanceReport {
    const calculations = this.metrics.filter(m => m.name.includes('calculation'))
    const renderings = this.metrics.filter(m => m.name.includes('rendering'))
    
    const totalCalculationTime = calculations.reduce((sum, m) => sum + m.duration, 0)
    const totalRenderingTime = renderings.reduce((sum, m) => sum + m.duration, 0)
    
    const slowestCalculation = calculations.length > 0 
      ? calculations.reduce((max, m) => m.duration > max.duration ? m : max)
      : null
    
    const fastestCalculation = calculations.length > 0
      ? calculations.reduce((min, m) => m.duration < min.duration ? m : min)
      : null

    return {
      totalCalculations: calculations.length,
      averageCalculationTime: calculations.length > 0 ? totalCalculationTime / calculations.length : 0,
      slowestCalculation,
      fastestCalculation,
      totalRenderingTime,
      averageRenderingTime: renderings.length > 0 ? totalRenderingTime / renderings.length : 0,
      memoryUsage: this.getMemoryUsage(),
      timestamp: new Date()
    }
  }

  // Get memory usage (if available)
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory
      return memory.usedJSHeapSize / 1024 / 1024 // Convert to MB
    }
    return 0
  }

  // Clear all performance data
  clear(): void {
    this.metrics = []
    this.kpiPerformance = []
  }

  // Export performance data
  exportData(): { metrics: PerformanceMetric[]; kpiPerformance: KPIPerformanceData[] } {
    return {
      metrics: [...this.metrics],
      kpiPerformance: [...this.kpiPerformance]
    }
  }
}

// Global performance monitor instance
export const kpiPerformanceMonitor = new KPIPerformanceMonitor()

// Performance monitoring decorators and utilities
export function monitorPerformance<T extends (...args: any[]) => any>(
  name: string,
  fn: T
): T {
  return ((...args: Parameters<T>): ReturnType<T> => {
    const id = kpiPerformanceMonitor.startTiming(name, { args })
    
    try {
      const result = fn(...args)
      kpiPerformanceMonitor.endTiming(id)
      return result
    } catch (error) {
      kpiPerformanceMonitor.endTiming(id)
      throw error
    }
  }) as T
}

// Performance monitoring hook for React components
export function usePerformanceMonitoring(componentName: string) {
  const startTime = React.useRef<number>(0)
  
  React.useEffect(() => {
    startTime.current = performance.now()
    
    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime.current
      
      kpiPerformanceMonitor.recordKPIPerformance({
        kpiId: componentName,
        calculationTime: 0,
        renderingTime: duration,
        cacheHit: false,
        dataSize: 0
      })
    }
  })
}

// Performance monitoring for KPI calculations
export function monitorKPICalculation<T>(
  kpiId: string,
  calculation: () => T,
  dataSize: number = 0
): T {
  const startTime = performance.now()
  
  try {
    const result = calculation()
    const endTime = performance.now()
    const calculationTime = endTime - startTime
    
    kpiPerformanceMonitor.recordKPIPerformance({
      kpiId,
      calculationTime,
      renderingTime: 0,
      cacheHit: false,
      dataSize
    })
    
    // Log slow calculations
    if (calculationTime > 100) {
      console.warn(`Slow KPI calculation: ${kpiId} took ${calculationTime.toFixed(2)}ms`)
    }
    
    return result
  } catch (error) {
    const endTime = performance.now()
    const calculationTime = endTime - startTime
    
    kpiPerformanceMonitor.recordKPIPerformance({
      kpiId,
      calculationTime,
      renderingTime: 0,
      cacheHit: false,
      dataSize
    })
    
    console.error(`KPI calculation failed: ${kpiId}`, error)
    throw error
  }
}

// Performance monitoring for cached calculations
export function monitorCachedKPICalculation<T>(
  kpiId: string,
  calculation: () => T,
  cacheKey: string,
  dataSize: number = 0
): T {
  const startTime = performance.now()
  
  // Check if we have cached data
  const cached = kpiCache.get<T>(cacheKey)
  const cacheHit = cached !== null
  
  let result: T
  let calculationTime: number
  
  if (cacheHit) {
    result = cached
    calculationTime = 0
  } else {
    try {
      result = calculation()
      const endTime = performance.now()
      calculationTime = endTime - startTime
      
      // Cache the result
      kpiCache.set(cacheKey, result)
    } catch (error) {
      const endTime = performance.now()
      calculationTime = endTime - startTime
      
      console.error(`Cached KPI calculation failed: ${kpiId}`, error)
      throw error
    }
  }
  
  const endTime = performance.now()
  const totalTime = endTime - startTime
  
  kpiPerformanceMonitor.recordKPIPerformance({
    kpiId,
    calculationTime,
    renderingTime: totalTime - calculationTime,
    cacheHit,
    dataSize
  })
  
  return result
}

// Performance alerting system
export class PerformanceAlertManager {
  private alerts: Array<{ message: string; timestamp: Date; severity: 'warning' | 'critical' }> = []
  private thresholds = {
    calculationTime: { warning: 50, critical: 100 },
    renderingTime: { warning: 16, critical: 33 }, // 60fps = 16ms, 30fps = 33ms
    memoryUsage: { warning: 100, critical: 200 } // MB
  }

  // Check performance and generate alerts
  checkPerformance(kpiId: string, calculationTime: number, renderingTime: number): void {
    const alerts: string[] = []
    
    if (calculationTime > this.thresholds.calculationTime.critical) {
      alerts.push(`CRITICAL: KPI calculation for ${kpiId} took ${calculationTime.toFixed(2)}ms`)
    } else if (calculationTime > this.thresholds.calculationTime.warning) {
      alerts.push(`WARNING: KPI calculation for ${kpiId} took ${calculationTime.toFixed(2)}ms`)
    }
    
    if (renderingTime > this.thresholds.renderingTime.critical) {
      alerts.push(`CRITICAL: KPI rendering for ${kpiId} took ${renderingTime.toFixed(2)}ms`)
    } else if (renderingTime > this.thresholds.renderingTime.warning) {
      alerts.push(`WARNING: KPI rendering for ${kpiId} took ${renderingTime.toFixed(2)}ms`)
    }
    
    alerts.forEach(message => {
      this.alerts.push({
        message,
        timestamp: new Date(),
        severity: message.includes('CRITICAL') ? 'critical' : 'warning'
      })
    })
  }

  // Get performance alerts
  getAlerts(): Array<{ message: string; timestamp: Date; severity: 'warning' | 'critical' }> {
    return [...this.alerts]
  }

  // Clear alerts
  clearAlerts(): void {
    this.alerts = []
  }
}

// Global performance alert manager
export const performanceAlertManager = new PerformanceAlertManager()

// Performance utilities
export const performanceUtils = {
  // Get performance summary
  getPerformanceSummary: () => {
    const report = kpiPerformanceMonitor.getPerformanceReport()
    const alerts = performanceAlertManager.getAlerts()
    
    return {
      report,
      alerts,
      recommendations: generatePerformanceRecommendations(report, alerts)
    }
  },

  // Generate performance recommendations
  generateRecommendations: () => {
    const report = kpiPerformanceMonitor.getPerformanceReport()
    return generatePerformanceRecommendations(report, [])
  },

  // Optimize KPI calculations
  optimizeCalculations: () => {
    const report = kpiPerformanceMonitor.getPerformanceReport()
    
    if (report.averageCalculationTime > 50) {
      console.warn('Consider implementing caching for slow KPI calculations')
    }
    
    if (report.averageRenderingTime > 16) {
      console.warn('Consider optimizing KPI component rendering')
    }
  }
}

// Helper function to generate performance recommendations
function generatePerformanceRecommendations(
  report: PerformanceReport,
  alerts: Array<{ message: string; severity: 'warning' | 'critical' }>
): string[] {
  const recommendations: string[] = []
  
  if (report.averageCalculationTime > 50) {
    recommendations.push('Implement caching for slow KPI calculations')
  }
  
  if (report.averageRenderingTime > 16) {
    recommendations.push('Optimize KPI component rendering with React.memo')
  }
  
  if (report.memoryUsage > 100) {
    recommendations.push('Monitor memory usage and implement cleanup')
  }
  
  if (alerts.some(a => a.severity === 'critical')) {
    recommendations.push('Address critical performance issues immediately')
  }
  
  return recommendations
}

// Import React for the hook
import React from 'react'
import { kpiCache } from './kpi-cache'
