// KPI Data Caching System
export interface KPICacheEntry<T = any> {
  data: T
  timestamp: number
  ttl: number
  key: string
}

export interface CacheConfig {
  ttl: number // Time to live in milliseconds
  maxSize: number // Maximum number of cache entries
  enableCompression?: boolean
}

export class KPICache {
  private cache = new Map<string, KPICacheEntry>()
  private config: CacheConfig

  constructor(config: CacheConfig = { ttl: 300000, maxSize: 100 }) {
    this.config = config
  }

  // Set cache entry
  set<T>(key: string, data: T, ttl?: number): void {
    const entry: KPICacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.ttl,
      key
    }

    // Remove oldest entries if cache is full
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest()
    }

    this.cache.set(key, entry)
  }

  // Get cache entry
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as KPICacheEntry<T> | undefined
    
    if (!entry) {
      return null
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  // Check if key exists and is valid
  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  // Delete cache entry
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  // Clear all cache
  clear(): void {
    this.cache.clear()
  }

  // Get cache size
  size(): number {
    return this.cache.size
  }

  // Get cache keys
  keys(): string[] {
    return Array.from(this.cache.keys())
  }

  // Get cache statistics
  getStats() {
    const now = Date.now()
    let expiredCount = 0
    let validCount = 0

    this.cache.forEach(entry => {
      if (now - entry.timestamp > entry.ttl) {
        expiredCount++
      } else {
        validCount++
      }
    })

    return {
      total: this.cache.size,
      valid: validCount,
      expired: expiredCount,
      maxSize: this.config.maxSize
    }
  }

  // Clean up expired entries
  cleanup(): number {
    const now = Date.now()
    let cleanedCount = 0

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
        cleanedCount++
      }
    }

    return cleanedCount
  }

  // Evict oldest entries
  private evictOldest(): void {
    const entries = Array.from(this.cache.entries())
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
    
    // Remove 10% of oldest entries
    const toRemove = Math.ceil(this.config.maxSize * 0.1)
    for (let i = 0; i < toRemove && i < entries.length; i++) {
      this.cache.delete(entries[i][0])
    }
  }
}

// Global KPI cache instance
export const kpiCache = new KPICache({
  ttl: 300000, // 5 minutes
  maxSize: 50
})

// KPI-specific cache keys
export const KPI_CACHE_KEYS = {
  revenue: 'kpi_revenue',
  profit: 'kpi_profit',
  orders: 'kpi_orders',
  avgMargin: 'kpi_avg_margin',
  cashFlow: 'kpi_cash_flow',
  slaCompliance: 'kpi_sla_compliance',
  settlementVariance: 'kpi_settlement_variance',
  drillDown: (kpiId: string) => `drilldown_${kpiId}`,
  thresholdAlerts: 'threshold_alerts',
  comparisonData: (kpiId: string, period: string) => `comparison_${kpiId}_${period}`
}

// Cached KPI calculation wrapper
export function cachedKPICalculation<T>(
  key: string,
  calculation: () => T,
  ttl?: number
): T {
  // Check cache first
  const cached = kpiCache.get<T>(key)
  if (cached !== null) {
    return cached
  }

  // Perform calculation
  const result = calculation()
  
  // Cache the result
  kpiCache.set(key, result, ttl)
  
  return result
}

// Cached validation functions
export const cachedValidators = {
  email: cachedKPICalculation(
    'validator_email',
    () => (email: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email) && email.length <= 254
    },
    600000 // 10 minutes
  ),

  passwordStrength: cachedKPICalculation(
    'validator_password_strength',
    () => (password: string) => {
      const minLength = 8
      const hasUpperCase = /[A-Z]/.test(password)
      const hasLowerCase = /[a-z]/.test(password)
      const hasNumbers = /\d/.test(password)
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
      
      let score = 0
      if (password.length >= minLength) score++
      if (hasUpperCase) score++
      if (hasLowerCase) score++
      if (hasNumbers) score++
      if (hasSpecialChar) score++
      
      return {
        score,
        isValid: score >= 4,
        feedback: []
      }
    },
    600000 // 10 minutes
  ),

  formValidation: cachedKPICalculation(
    'validator_form',
    () => (formData: Record<string, any>) => {
      const errors: Record<string, string> = {}
      
      Object.entries(formData).forEach(([field, value]) => {
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          errors[field] = `${field} is required`
        }
      })
      
      return {
        isValid: Object.keys(errors).length === 0,
        errors
      }
    },
    300000 // 5 minutes
  )
}

// Performance monitoring for cache
export class CachePerformanceMonitor {
  private hits = 0
  private misses = 0
  private startTime = Date.now()

  recordHit(): void {
    this.hits++
  }

  recordMiss(): void {
    this.misses++
  }

  getStats() {
    const total = this.hits + this.misses
    const hitRate = total > 0 ? (this.hits / total) * 100 : 0
    const uptime = Date.now() - this.startTime

    return {
      hits: this.hits,
      misses: this.misses,
      total,
      hitRate: hitRate.toFixed(2) + '%',
      uptime: Math.floor(uptime / 1000) + 's'
    }
  }

  reset(): void {
    this.hits = 0
    this.misses = 0
    this.startTime = Date.now()
  }
}

// Global cache performance monitor
export const cachePerformanceMonitor = new CachePerformanceMonitor()

// Enhanced cache with performance monitoring
export class MonitoredKPICache extends KPICache {
  constructor(config: CacheConfig) {
    super(config)
  }

  get<T>(key: string): T | null {
    const result = super.get<T>(key)
    
    if (result !== null) {
      cachePerformanceMonitor.recordHit()
    } else {
      cachePerformanceMonitor.recordMiss()
    }
    
    return result
  }
}

// Cache utilities for KPI data
export const kpiCacheUtils = {
  // Cache KPI calculation result
  cacheKPIResult: <T>(kpiId: string, data: T, ttl?: number) => {
    const key = KPI_CACHE_KEYS[kpiId as keyof typeof KPI_CACHE_KEYS] || `kpi_${kpiId}`
    kpiCache.set(key, data, ttl)
  },

  // Get cached KPI result
  getCachedKPIResult: <T>(kpiId: string): T | null => {
    const key = KPI_CACHE_KEYS[kpiId as keyof typeof KPI_CACHE_KEYS] || `kpi_${kpiId}`
    return kpiCache.get<T>(key)
  },

  // Cache drill-down data
  cacheDrillDownData: <T>(kpiId: string, data: T, ttl?: number) => {
    const key = KPI_CACHE_KEYS.drillDown(kpiId)
    kpiCache.set(key, data, ttl || 600000) // 10 minutes for drill-down data
  },

  // Get cached drill-down data
  getCachedDrillDownData: <T>(kpiId: string): T | null => {
    const key = KPI_CACHE_KEYS.drillDown(kpiId)
    return kpiCache.get<T>(key)
  },

  // Clear all KPI-related cache
  clearKPICache: () => {
    Object.values(KPI_CACHE_KEYS).forEach(key => {
      if (typeof key === 'string') {
        kpiCache.delete(key)
      }
    })
  },

  // Get cache performance stats
  getPerformanceStats: () => {
    return {
      cache: kpiCache.getStats(),
      performance: cachePerformanceMonitor.getStats()
    }
  }
}
