// KPI Threshold Management System
export interface KPIThreshold {
  min: number
  max: number
  criticalMin?: number
  criticalMax?: number
  alertMessage: string
}

export interface ThresholdAlert {
  kpiId: string
  kpiTitle: string
  currentValue: number
  threshold: KPIThreshold
  severity: 'warning' | 'critical'
  message: string
  timestamp: Date
}

// KPI Threshold Configuration
export const KPI_THRESHOLDS: Record<string, KPIThreshold> = {
  revenue: {
    min: 1000000,
    max: 2000000,
    criticalMin: 500000,
    alertMessage: 'Revenue is below target threshold'
  },
  profit: {
    min: 150000,
    max: 300000,
    criticalMin: 75000,
    alertMessage: 'Profit margins are below expected levels'
  },
  orders: {
    min: 2000,
    max: 5000,
    criticalMin: 1000,
    alertMessage: 'Order volume is below target'
  },
  avgMargin: {
    min: 15,
    max: 25,
    criticalMin: 10,
    alertMessage: 'Average margin is below target percentage'
  },
  cashFlow: {
    min: 0,
    max: 1000000,
    criticalMin: -100000,
    alertMessage: 'Cash flow is negative'
  },
  slaCompliance: {
    min: 90,
    max: 100,
    criticalMin: 75,
    alertMessage: 'SLA compliance rate is below target'
  },
  settlementVariance: {
    min: 0,
    max: 1000,
    criticalMax: 5000,
    alertMessage: 'Settlement variance is above acceptable threshold'
  }
}

// Threshold Alert Manager
export class ThresholdAlertManager {
  private alerts: ThresholdAlert[] = []
  private subscribers: ((alerts: ThresholdAlert[]) => void)[] = []

  // Check if a KPI value violates thresholds
  checkThreshold(kpiId: string, kpiTitle: string, value: number): ThresholdAlert | null {
    const threshold = KPI_THRESHOLDS[kpiId]
    if (!threshold) return null

    let severity: 'warning' | 'critical' | null = null
    let message = ''

    // Check critical thresholds first
    if (threshold.criticalMin !== undefined && value < threshold.criticalMin) {
      severity = 'critical'
      message = `CRITICAL: ${threshold.alertMessage} (${value} < ${threshold.criticalMin})`
    } else if (threshold.criticalMax !== undefined && value > threshold.criticalMax) {
      severity = 'critical'
      message = `CRITICAL: ${threshold.alertMessage} (${value} > ${threshold.criticalMax})`
    }
    // Check warning thresholds
    else if (value < threshold.min) {
      severity = 'warning'
      message = `WARNING: ${threshold.alertMessage} (${value} < ${threshold.min})`
    } else if (value > threshold.max) {
      severity = 'warning'
      message = `WARNING: ${threshold.alertMessage} (${value} > ${threshold.max})`
    }

    if (severity) {
      const alert: ThresholdAlert = {
        kpiId,
        kpiTitle,
        currentValue: value,
        threshold,
        severity,
        message,
        timestamp: new Date()
      }

      this.addAlert(alert)
      return alert
    }

    // Remove any existing alerts for this KPI if it's now within thresholds
    this.removeAlert(kpiId)
    return null
  }

  // Add a new alert
  private addAlert(alert: ThresholdAlert) {
    // Remove existing alert for this KPI if it exists
    this.removeAlert(alert.kpiId)
    
    // Add new alert
    this.alerts.push(alert)
    
    // Keep only the last 50 alerts
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(-50)
    }

    this.notifySubscribers()
  }

  // Remove alert for a specific KPI
  private removeAlert(kpiId: string) {
    this.alerts = this.alerts.filter(alert => alert.kpiId !== kpiId)
    this.notifySubscribers()
  }

  // Get all active alerts
  getAlerts(): ThresholdAlert[] {
    return [...this.alerts]
  }

  // Get alerts by severity
  getAlertsBySeverity(severity: 'warning' | 'critical'): ThresholdAlert[] {
    return this.alerts.filter(alert => alert.severity === severity)
  }

  // Get critical alerts count
  getCriticalAlertsCount(): number {
    return this.alerts.filter(alert => alert.severity === 'critical').length
  }

  // Get warning alerts count
  getWarningAlertsCount(): number {
    return this.alerts.filter(alert => alert.severity === 'warning').length
  }

  // Subscribe to alert changes
  subscribe(callback: (alerts: ThresholdAlert[]) => void): () => void {
    this.subscribers.push(callback)
    
    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback)
    }
  }

  // Notify all subscribers
  private notifySubscribers() {
    this.subscribers.forEach(callback => callback([...this.alerts]))
  }

  // Clear all alerts
  clearAlerts() {
    this.alerts = []
    this.notifySubscribers()
  }

  // Clear alerts for a specific KPI
  clearAlertsForKPI(kpiId: string) {
    this.removeAlert(kpiId)
  }

  // Get alert summary
  getAlertSummary() {
    const critical = this.getCriticalAlertsCount()
    const warning = this.getWarningAlertsCount()
    
    return {
      total: critical + warning,
      critical,
      warning,
      hasAlerts: critical + warning > 0
    }
  }
}

// Global threshold alert manager instance
export const thresholdAlertManager = new ThresholdAlertManager()

// Helper function to check all KPIs against thresholds
export function checkAllKPIThresholds(kpiData: Array<{ id: string; title: string; value: number }>) {
  const alerts: ThresholdAlert[] = []
  
  kpiData.forEach(kpi => {
    const alert = thresholdAlertManager.checkThreshold(kpi.id, kpi.title, kpi.value)
    if (alert) {
      alerts.push(alert)
    }
  })
  
  return alerts
}

// Helper function to get threshold status for a KPI
export function getThresholdStatus(kpiId: string, value: number): 'good' | 'warning' | 'critical' {
  const threshold = KPI_THRESHOLDS[kpiId]
  if (!threshold) return 'good'

  // Check critical thresholds first
  if (threshold.criticalMin !== undefined && value < threshold.criticalMin) {
    return 'critical'
  }
  if (threshold.criticalMax !== undefined && value > threshold.criticalMax) {
    return 'critical'
  }

  // Check warning thresholds
  if (value < threshold.min || value > threshold.max) {
    return 'warning'
  }

  return 'good'
}
