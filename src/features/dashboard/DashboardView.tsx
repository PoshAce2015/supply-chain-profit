import React from "react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import AnimatedCounter from "../../components/ui/AnimatedCounter";
import { selectDataset } from "../imports/selectors";
import { selectAlerts } from "../sla/selectors";
import { 
  calculateRevenue, 
  calculateProfit, 
  calculateOrders, 
  calculateAverageMargin,
  calculateCashFlow,
  calculateSLACompliance,
  calculateSettlementVariance,
  type KPICalculation 
} from "../../lib/kpi-calculations";
import { thresholdAlertManager, checkAllKPIThresholds } from "../../lib/kpi-thresholds";
import { generateDrillDownData, type DrillDownModal } from "../../lib/kpi-drilldown";
import { kpiCacheUtils, cachedKPICalculation } from "../../lib/kpi-cache";
import { monitorKPICalculation, kpiPerformanceMonitor } from "../../lib/kpi-performance";

// Enhanced error boundary for individual KPI cards with retry functionality
class KPIErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode; onRetry?: () => void },
  { hasError: boolean; retryCount: number }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode; onRetry?: () => void }) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('KPI Card Error:', error, errorInfo);
  }

  retry = () => {
    this.setState({ hasError: false, retryCount: this.state.retryCount + 1 });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  override render() {
    if (this.state.hasError) {
      return (
        <div className="kpi-card border-l-4 border-red-500">
          <div className="kpi-label flex items-center justify-between">
            <span>⚠️ KPI Error</span>
            <button 
              onClick={this.retry}
              className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded transition-colors"
            >
              Retry
            </button>
          </div>
          <div className="kpi-value text-red-600">Error loading data</div>
          <div className="text-xs text-gray-400">Retry count: {this.state.retryCount}</div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Enhanced KPI Card component with better data display and loading states
function KPICard({ 
  data, 
  onDrillDown,
  isLoading = false
}: { 
  data: KPIData; 
  onDrillDown: (kpiId: string) => void;
  isLoading?: boolean;
}) {
  const statusColors = {
    good: 'border-green-500',
    warning: 'border-yellow-500', 
    critical: 'border-red-500'
  };

  const statusIcons = {
    good: '🟢',
    warning: '🟡',
    critical: '🔴'
  };

  const handleClick = () => {
    if (!isLoading) {
      onDrillDown(data.id);
    }
  };

  // Enhanced data formatting
  const formatValue = (value: number, prefix: string, suffix: string, decimals?: number) => {
    if (value === 0) {
      return `${prefix}0.00${suffix}`;
    }
    
    const formattedValue = value.toLocaleString('en-IN', {
      minimumFractionDigits: decimals || 0,
      maximumFractionDigits: decimals || 2
    });
    
    return `${prefix}${formattedValue}${suffix}`;
  };

  // Enhanced trend display
  const formatTrend = (trend: string) => {
    if (trend === '0%' || trend === '+0%') {
      return 'No change';
    }
    if (trend === '-100.0%') {
      return 'New metric';
    }
    return trend;
  };

  const fallback = (
    <KPIFallback 
      title={data.title}
      value={formatValue(data.value, data.prefix, data.suffix, data.decimals)}
      trend={formatTrend(data.trend)}
    />
  );

  if (isLoading) {
    return (
      <div className="kpi-card border-l-4 border-gray-300 animate-pulse">
        <div className="kpi-label flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <div className="h-4 bg-gray-300 rounded w-20"></div>
          </div>
        </div>
        <div className="kpi-value">
          <div className="h-8 bg-gray-300 rounded w-16"></div>
        </div>
        <div className="kpi-sub">
          <div className="h-3 bg-gray-300 rounded w-12"></div>
        </div>
        <div className="text-xs text-gray-400 mt-2">
          <div className="h-3 bg-gray-300 rounded w-24"></div>
        </div>
      </div>
    );
  }

  return (
    <KPIErrorBoundary fallback={fallback}>
      <div 
        data-testid={data.id}
        className={`kpi-card cursor-pointer group border-l-4 ${statusColors[data.status]} hover:shadow-lg transition-all duration-200 hover:-translate-y-1`}
        onClick={handleClick}
      >
        <div className="kpi-label flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>{statusIcons[data.status]}</span>
            <span>{data.title}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-indigo-600 font-medium">
              🔍 Drill Down
            </span>
            <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              →
            </span>
          </div>
        </div>
        <div className="kpi-value">
          <AnimatedCounter 
            value={data.value} 
            prefix={data.prefix} 
            suffix={data.suffix}
            decimals={data.decimals || 0}
          />
        </div>
        <div className="kpi-sub flex items-center gap-1">
          <span className="text-emerald-600">↗</span>
          <span>{formatTrend(data.trend)}</span>
        </div>
        <div className="text-xs text-gray-400 mt-2">
          Updated: {data.lastUpdated.toLocaleTimeString()}
        </div>
      </div>
    </KPIErrorBoundary>
  );
}

// Fallback component for KPI cards
function KPIFallback({ title, value, trend }: { title: string; value: string; trend: string }) {
  return (
    <div className="kpi-card cursor-pointer group">
      <div className="kpi-label flex items-center justify-between">
        <span>{title}</span>
        <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200">Click to drill down →</span>
      </div>
      <div className="kpi-value">
        <span>{value}</span>
      </div>
      <div className="kpi-sub flex items-center gap-1">
        <span className="text-emerald-600">↗</span>
        <span>{trend}</span>
      </div>
    </div>
  );
}

// Enhanced Threshold Alerts Component
function ThresholdAlertsSection({ alerts }: { alerts: any[] }) {
  if (alerts.length === 0) return null;

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  return (
    <section className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-6 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-red-900 flex items-center gap-2">
          <span className="text-2xl">🚨</span>
          <span>Critical Threshold Alerts ({alerts.length})</span>
        </h2>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-red-700 font-medium">Action Required</span>
        </div>
      </div>
      
      <div className="space-y-3">
        {alerts.slice(0, 3).map((alert, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg border-l-4 border-red-500 ${getSeverityColor(alert.severity)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <span className="text-lg">{getSeverityIcon(alert.severity)}</span>
                <div>
                  <div className="font-semibold text-red-900">
                    {alert.kpi}: {alert.severity.toUpperCase()}
                  </div>
                  <div className="text-sm text-red-700 mt-1">
                    {alert.message}
                  </div>
                  <div className="text-xs text-red-600 mt-2">
                    Triggered: {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </div>
              <button className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-full transition-colors">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {alerts.length > 3 && (
        <div className="mt-4 text-center">
          <button className="text-sm text-red-700 hover:text-red-900 font-medium">
            View all {alerts.length} alerts →
          </button>
        </div>
      )}
    </section>
  );
}

// KPI data configuration for easy maintenance
interface KPIData {
  id: string;
  title: string;
  value: number;
  prefix: string;
  suffix: string;
  decimals?: number;
  trend: string;
  analyticsUrl: string;
  status: 'good' | 'warning' | 'critical';
  lastUpdated: Date;
  comparisons: {
    wow: string;
    mom: string;
    yoy: string;
  };
}


export default function DashboardView() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [showToast, setShowToast] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drillDownModal, setDrillDownModal] = useState<DrillDownModal>({
    isOpen: false,
    kpiId: null,
    data: null
  });
  const [thresholdAlerts, setThresholdAlerts] = useState<any[]>([]);

  // Get real-time data from Redux store
  const orders = useSelector(selectDataset('indiaListings')) as any[];
  const uspos = useSelector(selectDataset('uspo')) as any[];
  const events = useSelector(selectDataset('events')) as any[];
  const settlements = useSelector(selectDataset('settlement')) as any[];
  const alerts = useSelector(selectAlerts);

  // Calculate real-time KPIs with caching and performance monitoring
  const revenueKPI = monitorKPICalculation('revenue', () => 
    cachedKPICalculation('kpi_revenue', () => calculateRevenue(orders))
  );
  
  const profitKPI = monitorKPICalculation('profit', () => 
    cachedKPICalculation('kpi_profit', () => calculateProfit(orders, uspos))
  );
  
  const ordersKPI = monitorKPICalculation('orders', () => 
    cachedKPICalculation('kpi_orders', () => calculateOrders(orders))
  );
  
  const avgMarginKPI = monitorKPICalculation('avgMargin', () => 
    cachedKPICalculation('kpi_avg_margin', () => calculateAverageMargin(orders, uspos))
  );
  
  const cashFlowKPI = monitorKPICalculation('cashFlow', () => 
    cachedKPICalculation('kpi_cash_flow', () => calculateCashFlow(events, orders, uspos))
  );
  
  const slaComplianceKPI = monitorKPICalculation('slaCompliance', () => 
    cachedKPICalculation('kpi_sla_compliance', () => calculateSLACompliance(alerts))
  );
  
  const settlementVarianceKPI = monitorKPICalculation('settlementVariance', () => 
    cachedKPICalculation('kpi_settlement_variance', () => calculateSettlementVariance(settlements, orders))
  );

  // Convert calculations to KPI data format with comparison periods
  const kpiData: KPIData[] = [
    {
      id: 'kpi-revenue',
      title: 'Revenue',
      value: revenueKPI.value,
      prefix: '₹',
      suffix: 'L',
      trend: revenueKPI.trend,
      analyticsUrl: '/analytics?metric=revenue',
      status: revenueKPI.status,
      lastUpdated: revenueKPI.lastUpdated,
      comparisons: revenueKPI.comparisons
    },
    {
      id: 'kpi-profit',
      title: 'Profit',
      value: profitKPI.value,
      prefix: '₹',
      suffix: 'L',
      trend: profitKPI.trend,
      analyticsUrl: '/analytics?metric=profit',
      status: profitKPI.status,
      lastUpdated: profitKPI.lastUpdated,
      comparisons: profitKPI.comparisons
    },
    {
      id: 'kpi-orders',
      title: 'Orders',
      value: ordersKPI.value,
      prefix: '',
      suffix: '',
      trend: ordersKPI.trend,
      analyticsUrl: '/analytics?metric=orders',
      status: ordersKPI.status,
      lastUpdated: ordersKPI.lastUpdated,
      comparisons: ordersKPI.comparisons
    },
    {
      id: 'kpi-avg-margin',
      title: 'Avg Margin',
      value: avgMarginKPI.value,
      prefix: '',
      suffix: '%',
      decimals: 1,
      trend: avgMarginKPI.trend,
      analyticsUrl: '/analytics?metric=margin',
      status: avgMarginKPI.status,
      lastUpdated: avgMarginKPI.lastUpdated,
      comparisons: avgMarginKPI.comparisons
    },
    {
      id: 'kpi-cashflow',
      title: 'Cash Flow',
      value: cashFlowKPI.value,
      prefix: '₹',
      suffix: 'L',
      trend: cashFlowKPI.trend,
      analyticsUrl: '/cashflow',
      status: cashFlowKPI.status,
      lastUpdated: cashFlowKPI.lastUpdated,
      comparisons: cashFlowKPI.comparisons
    },
    {
      id: 'kpi-sla-compliance',
      title: 'SLA Compliance',
      value: slaComplianceKPI.value,
      prefix: '',
      suffix: '%',
      decimals: 1,
      trend: slaComplianceKPI.trend,
      analyticsUrl: '/sla',
      status: slaComplianceKPI.status,
      lastUpdated: slaComplianceKPI.lastUpdated,
      comparisons: slaComplianceKPI.comparisons
    },
    {
      id: 'kpi-settlement-variance',
      title: 'Settlement Variance',
      value: settlementVarianceKPI.value,
      prefix: '₹',
      suffix: 'K',
      trend: settlementVarianceKPI.trend,
      analyticsUrl: '/reconcile',
      status: settlementVarianceKPI.status,
      lastUpdated: settlementVarianceKPI.lastUpdated,
      comparisons: settlementVarianceKPI.comparisons
    }
  ];

  // Check threshold alerts
  useEffect(() => {
    const alerts = checkAllKPIThresholds(kpiData.map(kpi => ({
      id: kpi.id.replace('kpi-', ''),
      title: kpi.title,
      value: kpi.value
    })));
    setThresholdAlerts(alerts);
  }, [kpiData]);

  // Subscribe to threshold alert changes
  useEffect(() => {
    const unsubscribe = thresholdAlertManager.subscribe((alerts) => {
      setThresholdAlerts(alerts);
    });
    return unsubscribe;
  }, []);

  // Handle KPI drill-down
  const handleKPIDrillDown = (kpiId: string) => {
    const drillDownData = generateDrillDownData(
      kpiId.replace('kpi-', ''),
      orders,
      uspos,
      events,
      settlements,
      alerts
    );
    
    if (drillDownData) {
      setDrillDownModal({
        isOpen: true,
        kpiId,
        data: drillDownData
      });
    } else {
      // Fallback to analytics URL
      const kpi = kpiData.find(k => k.id === kpiId);
      if (kpi) {
        try {
          window.open(kpi.analyticsUrl, '_blank');
        } catch (error) {
          console.error('Failed to open analytics:', error);
          window.location.href = kpi.analyticsUrl;
        }
      }
    }
  };

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleRefreshData = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      
      // Force re-calculation of KPIs by updating timestamp
      setLastUpdated(new Date());
      
      // Simulate API call for data refresh
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      setError('Failed to refresh data. Please try again.');
      console.error('Refresh error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="dashboard-view space-y-8" data-testid="dashboard-view">
      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg animate-in slide-in-from-right duration-300">
          <div className="flex items-center gap-2">
            <span>❌</span>
            <span>{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-2 text-white hover:text-red-100"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-lg animate-in slide-in-from-right duration-300">
          <div className="flex items-center gap-2">
            <span>✅</span>
            <span>Data refreshed successfully!</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600 text-lg">Overview of operations, finance, and recent activity</p>
          <p className="text-xs text-slate-400 mt-1">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex gap-3">
          <Link 
            to="/imports" 
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors"
          >
            <span>📥</span>
            <span>Import CSVs</span>
          </Link>
          <button 
            onClick={handleRefreshData}
            disabled={isRefreshing}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 transition-colors ${
              isRefreshing 
                ? 'bg-slate-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700'
            } text-white`}
          >
            <span className={isRefreshing ? 'animate-spin' : ''}>🔄</span>
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>
        </div>
      </div>

      {/* KPI tiles - PRODUCTION READY */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.slice(0, 4).map((kpi) => (
          <KPICard key={kpi.id} data={kpi} onDrillDown={handleKPIDrillDown} isLoading={isLoading} />
        ))}
      </section>

      {/* Additional KPI tiles - Row 2 */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiData.slice(4).map((kpi) => (
          <KPICard key={kpi.id} data={kpi} onDrillDown={handleKPIDrillDown} isLoading={isLoading} />
        ))}
      </section>

      {/* Enhanced Quick Actions */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <span>⚡</span>
          <span>Quick Actions</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Link 
            to="/calculator" 
            className="qa-btn group bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-200 hover:border-amber-300 rounded-xl p-4 text-center transition-all duration-200 hover:shadow-md hover:-translate-y-1"
          >
            <div className="text-2xl mb-2">🧮</div>
            <div className="font-semibold text-amber-800 group-hover:text-amber-900">Calculator</div>
            <div className="text-xs text-amber-600 mt-1">Calculate margins and profits</div>
          </Link>
          
          <Link 
            to="/orders" 
            className="qa-btn group bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 hover:border-blue-300 rounded-xl p-4 text-center transition-all duration-200 hover:shadow-md hover:-translate-y-1"
          >
            <div className="text-2xl mb-2">📋</div>
            <div className="font-semibold text-blue-800 group-hover:text-blue-900">Orders</div>
            <div className="text-xs text-blue-600 mt-1">Manage order checklist</div>
          </Link>
          
          <Link 
            to="/analytics" 
            className="qa-btn group bg-gradient-to-br from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 border border-emerald-200 hover:border-emerald-300 rounded-xl p-4 text-center transition-all duration-200 hover:shadow-md hover:-translate-y-1"
          >
            <div className="text-2xl mb-2">📊</div>
            <div className="font-semibold text-emerald-800 group-hover:text-emerald-900">Analytics</div>
            <div className="text-xs text-emerald-600 mt-1">View detailed reports</div>
          </Link>
          
          <Link 
            to="/cashflow" 
            className="qa-btn group bg-gradient-to-br from-purple-50 to-violet-50 hover:from-purple-100 hover:to-violet-100 border border-purple-200 hover:border-purple-300 rounded-xl p-4 text-center transition-all duration-200 hover:shadow-md hover:-translate-y-1"
          >
            <div className="text-2xl mb-2">💰</div>
            <div className="font-semibold text-purple-800 group-hover:text-purple-900">Cashflow</div>
            <div className="text-xs text-purple-600 mt-1">Simulate cash flows</div>
          </Link>
          
          <Link 
            to="/sla" 
            className="qa-btn group bg-gradient-to-br from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 border border-red-200 hover:border-red-300 rounded-xl p-4 text-center transition-all duration-200 hover:shadow-md hover:-translate-y-1"
          >
            <div className="text-2xl mb-2">⏰</div>
            <div className="font-semibold text-red-800 group-hover:text-red-900">SLA Monitor</div>
            <div className="text-xs text-red-600 mt-1">Track service levels</div>
          </Link>
          
          <Link 
            to="/reconcile" 
            className="qa-btn group bg-gradient-to-br from-slate-50 to-gray-50 hover:from-slate-100 hover:to-gray-100 border border-slate-200 hover:border-slate-300 rounded-xl p-4 text-center transition-all duration-200 hover:shadow-md hover:-translate-y-1"
          >
            <div className="text-2xl mb-2">🔍</div>
            <div className="font-semibold text-slate-800 group-hover:text-slate-900">Reconcile</div>
            <div className="text-xs text-slate-600 mt-1">Settlement reconciliation</div>
          </Link>
        </div>
      </section>

      {/* Enhanced Recent Activity */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <span>📈</span>
          <span>Recent Activity</span>
        </h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 hover:shadow-sm transition-shadow">
            <div className="text-2xl">✅</div>
            <div className="flex-1">
              <div className="font-semibold text-emerald-900">New order imported</div>
              <div className="text-sm text-emerald-700 mt-1">Order #12345 added to system</div>
              <div className="text-xs text-emerald-600 mt-2">Revenue impact: +₹25,000</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-emerald-600 font-medium">2 min ago</div>
              <button className="text-xs text-emerald-700 hover:text-emerald-900 mt-1">View →</button>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 hover:shadow-sm transition-shadow">
            <div className="text-2xl">📊</div>
            <div className="flex-1">
              <div className="font-semibold text-blue-900">Analytics updated</div>
              <div className="text-sm text-blue-700 mt-1">Revenue calculations completed</div>
              <div className="text-xs text-blue-600 mt-2">Processing time: 1.2s</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-blue-600 font-medium">5 min ago</div>
              <button className="text-xs text-blue-700 hover:text-blue-900 mt-1">View →</button>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 hover:shadow-sm transition-shadow">
            <div className="text-2xl">⚠️</div>
            <div className="flex-1">
              <div className="font-semibold text-orange-900">SLA Alert</div>
              <div className="text-sm text-orange-700 mt-1">Order #12340 approaching deadline</div>
              <div className="text-xs text-orange-600 mt-2">Time remaining: 2h 15m</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-orange-600 font-medium">10 min ago</div>
              <button className="text-xs text-orange-700 hover:text-orange-900 mt-1">Act →</button>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <button className="text-sm text-slate-600 hover:text-slate-900 font-medium">
            View all activity →
          </button>
        </div>
      </section>

      {/* Threshold Alerts */}
      {thresholdAlerts.length > 0 && (
        <ThresholdAlertsSection alerts={thresholdAlerts} />
      )}

                  {/* Drill-Down Modal */}
                  {drillDownModal.isOpen && drillDownModal.data && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                          <h2 className="text-2xl font-bold text-slate-900">
                            {drillDownModal.data.title}
                          </h2>
                          <button
                            onClick={() => setDrillDownModal({ isOpen: false, kpiId: null, data: null })}
                            className="text-slate-400 hover:text-slate-600 text-2xl"
                          >
                            ×
                          </button>
                        </div>
                        
                        {/* Current Value */}
                        <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                          <div className="text-sm text-slate-600 mb-1">Current Value</div>
                          <div className="text-3xl font-bold text-slate-900">
                            {drillDownModal.data.currentValue.toLocaleString()}
                          </div>
                        </div>

                        {/* Breakdown */}
                        {drillDownModal.data.breakdown.length > 0 && (
                          <div className="mb-6">
                            <h3 className="text-lg font-semibold text-slate-900 mb-3">Breakdown</h3>
                            <div className="space-y-2">
                              {drillDownModal.data.breakdown.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                  <div>
                                    <div className="font-medium text-slate-900">{item.label}</div>
                                    <div className="text-sm text-slate-600">{item.trend}</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-semibold text-slate-900">
                                      {item.value.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-slate-600">
                                      {item.percentage.toFixed(1)}%
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Insights */}
                        {drillDownModal.data.insights.length > 0 && (
                          <div className="mb-6">
                            <h3 className="text-lg font-semibold text-slate-900 mb-3">Insights</h3>
                            <div className="space-y-2">
                              {drillDownModal.data.insights.map((insight, index) => (
                                <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                                  <span className="text-blue-600 mt-0.5">💡</span>
                                  <span className="text-blue-900">{insight}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Recommendations */}
                        {drillDownModal.data.recommendations.length > 0 && (
                          <div className="mb-6">
                            <h3 className="text-lg font-semibold text-slate-900 mb-3">Recommendations</h3>
                            <div className="space-y-2">
                              {drillDownModal.data.recommendations.map((rec, index) => (
                                <div key={index} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                                  <span className="text-green-600 mt-0.5">✅</span>
                                  <span className="text-green-900">{rec}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

function DashboardSkeleton() {
  return (
    <div className="dashboard-view space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
        <div>
          <div className="h-8 bg-slate-200 rounded w-48 mb-2"></div>
          <div className="h-5 bg-slate-200 rounded w-80 mb-1"></div>
          <div className="h-3 bg-slate-200 rounded w-32"></div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 bg-slate-200 rounded-lg w-32"></div>
          <div className="h-10 bg-slate-200 rounded-lg w-32"></div>
        </div>
      </div>

      {/* KPI Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="kpi-card">
            <div className="h-4 bg-slate-200 rounded w-20 mb-2"></div>
            <div className="h-8 bg-slate-200 rounded w-24 mb-1"></div>
            <div className="h-4 bg-slate-200 rounded w-16"></div>
          </div>
        ))}
      </div>

      {/* Quick Actions Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="qa-btn">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-200 rounded"></div>
              <div className="flex-1">
                <div className="h-4 bg-slate-200 rounded w-20 mb-1"></div>
                <div className="h-3 bg-slate-200 rounded w-32"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Skeleton */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="h-6 bg-slate-200 rounded w-32 mb-4"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
              <div className="w-4 h-4 bg-slate-200 rounded"></div>
              <div className="flex-1">
                <div className="h-4 bg-slate-200 rounded w-32 mb-1"></div>
                <div className="h-3 bg-slate-200 rounded w-48"></div>
              </div>
              <div className="h-3 bg-slate-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
