import React, { useState, useEffect, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  selectSalesRecords,
  selectPurchaseRecords,
  selectUnifiedProducts,
  selectUnifiedOrders,
  selectSupplyChainMetrics,
  selectProcessingState,
  selectMatchingStats,
  selectErrors,
  selectProfitableProducts,
  selectLowMarginProducts,
  selectHighMarginProducts,
  selectUnmatchedSalesRecords,
  selectMatchedOrders,
  processUnifiedData,
  clearAllData,
  removeError
} from './unifiedDataSlice'

// ============================================================================
// COMPONENT
// ============================================================================

const UnifiedDataView: React.FC = () => {
  const dispatch = useDispatch()
  
  // Selectors
  const salesRecords = useSelector(selectSalesRecords)
  const purchaseRecords = useSelector(selectPurchaseRecords)
  const unifiedProducts = useSelector(selectUnifiedProducts)
  const unifiedOrders = useSelector(selectUnifiedOrders)
  const supplyChainMetrics = useSelector(selectSupplyChainMetrics)
  const processingState = useSelector(selectProcessingState)
  const matchingStats = useSelector(selectMatchingStats)
  const errors = useSelector(selectErrors)
  
  // Derived data
  const profitableProducts = useSelector(selectProfitableProducts)
  const lowMarginProducts = useSelector(selectLowMarginProducts)
  const highMarginProducts = useSelector(selectHighMarginProducts)
  const unmatchedSales = useSelector(selectUnmatchedSalesRecords)
  const matchedOrders = useSelector(selectMatchedOrders)
  
  // Local state
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'metrics' | 'matching'>('overview')
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })
  
  // Computed values
  const totalRevenue = useMemo(() => 
    unifiedOrders.reduce((sum, order) => sum + order.revenue, 0), 
    [unifiedOrders]
  )
  
  const totalCost = useMemo(() => 
    unifiedOrders.reduce((sum, order) => sum + (order.cost || 0), 0), 
    [unifiedOrders]
  )
  
  const totalProfit = useMemo(() => totalRevenue - totalCost, [totalRevenue, totalCost])
  const overallMargin = useMemo(() => 
    totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0, 
    [totalRevenue, totalProfit]
  )
  
  // Effects
  useEffect(() => {
    if (salesRecords.length > 0 || purchaseRecords.length > 0) {
      dispatch(processUnifiedData(dateRange.start, dateRange.end))
    }
  }, [salesRecords.length, purchaseRecords.length, dateRange, dispatch])
  
  // ============================================================================
  // HANDLERS
  // ============================================================================
  
  const handleProcessData = () => {
    dispatch(processUnifiedData(dateRange.start, dateRange.end))
  }
  
  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      dispatch(clearAllData())
    }
  }
  
  const handleRemoveError = (index: number) => {
    dispatch(removeError({ index }))
  }
  
  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================
  
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
          <p className="text-2xl font-bold text-green-600">₹{totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Cost</h3>
          <p className="text-2xl font-bold text-red-600">₹{totalCost.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Profit</h3>
          <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ₹{totalProfit.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Overall Margin</h3>
          <p className={`text-2xl font-bold ${overallMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {overallMargin.toFixed(2)}%
          </p>
        </div>
      </div>
      
      {/* Matching Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Data Matching Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Sales Records</p>
            <p className="text-xl font-semibold">{matchingStats.totalSalesRecords}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Purchase Records</p>
            <p className="text-xl font-semibold">{matchingStats.totalPurchaseRecords}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Matched Records</p>
            <p className="text-xl font-semibold text-green-600">{matchingStats.matchedRecords}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Match Rate</p>
            <p className="text-xl font-semibold">{matchingStats.matchRate.toFixed(1)}%</p>
          </div>
        </div>
      </div>
      
      {/* Product Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Profitable Products</h3>
          <p className="text-3xl font-bold text-green-600">{profitableProducts.length}</p>
          <p className="text-sm text-gray-500">Products with positive margin</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Low Margin Products</h3>
          <p className="text-3xl font-bold text-yellow-600">{lowMarginProducts.length}</p>
          <p className="text-sm text-gray-500">Products with &lt; 10% margin</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">High Margin Products</h3>
          <p className="text-3xl font-bold text-green-600">{highMarginProducts.length}</p>
          <p className="text-sm text-gray-500">Products with &gt; 20% margin</p>
        </div>
      </div>
    </div>
  )
  
  const renderProducts = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Unified Products</h3>
          <p className="text-sm text-gray-500">{unifiedProducts.length} products</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ASIN</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty Sold</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {unifiedProducts.map((product) => (
                <tr key={product.asin} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.asin}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.sku}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 truncate max-w-xs">{product.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{product.totalRevenue.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{product.totalCost.toLocaleString()}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${product.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{product.totalProfit.toLocaleString()}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${product.averageMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.averageMargin.toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.totalQuantitySold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
  
  const renderOrders = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Unified Orders</h3>
          <p className="text-sm text-gray-500">{unifiedOrders.length} orders</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ASIN</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sale Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matched</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {unifiedOrders.slice(0, 50).map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.salesOrderId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.asin}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(order.saleDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{order.revenue.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{(order.cost || 0).toLocaleString()}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${(order.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{(order.profit || 0).toLocaleString()}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${(order.margin || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {(order.margin || 0).toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.purchaseOrderId ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {order.purchaseOrderId ? 'Yes' : 'No'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
  
  const renderMetrics = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Supply Chain Metrics</h3>
          <p className="text-sm text-gray-500">{supplyChainMetrics.length} products</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ASIN</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Margin</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Lead Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">On-Time Delivery</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {supplyChainMetrics.map((metric) => (
                <tr key={metric.asin} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{metric.asin}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{metric.totalRevenue.toLocaleString()}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${metric.averageMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {metric.averageMargin.toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{metric.averageLeadTime.toFixed(1)} days</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{metric.onTimeDeliveryRate.toFixed(1)}%</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      metric.marginTrend === 'increasing' ? 'bg-green-100 text-green-800' :
                      metric.marginTrend === 'decreasing' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {metric.marginTrend}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
  
  const renderMatching = () => (
    <div className="space-y-6">
      {/* Matching Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Matching Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">Matched Orders</h4>
            <p className="text-2xl font-bold text-green-600">{matchedOrders.length}</p>
            <p className="text-sm text-gray-500">Orders with purchase data</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Unmatched Orders</h4>
            <p className="text-2xl font-bold text-red-600">{unmatchedSales.length}</p>
            <p className="text-sm text-gray-500">Orders without purchase data</p>
          </div>
        </div>
      </div>
      
      {/* Unmatched Sales */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Unmatched Sales Records</h3>
          <p className="text-sm text-gray-500">These sales records could not be matched to purchase data</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ASIN</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sale Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {unmatchedSales.slice(0, 20).map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.salesOrderId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.asin}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.sku}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 truncate max-w-xs">{order.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(order.saleDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{order.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
  
  // ============================================================================
  // MAIN RENDER
  // ============================================================================
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Unified Data Model</h1>
          <p className="mt-2 text-gray-600">
            Comprehensive view of linked sales and purchase data with supply chain insights
          </p>
        </div>
        
        {/* Controls */}
        <div className="mb-6 bg-white rounded-lg shadow p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleProcessData}
                disabled={processingState.isProcessing}
                className="btn-primary px-4 py-2 rounded-lg"
              >
                {processingState.isProcessing ? 'Processing...' : 'Process Data'}
              </button>
              <button
                onClick={handleClearData}
                className="btn-secondary px-4 py-2 rounded-lg"
              >
                Clear Data
              </button>
            </div>
          </div>
          
          {/* Processing Progress */}
          {processingState.isProcessing && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Processing data...</span>
                <span>{processingState.progress}%</span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${processingState.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Errors */}
        {errors.length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-red-800">Errors</h3>
            <div className="mt-2 space-y-1">
              {errors.map((error, index) => (
                <div key={index} className="flex items-center justify-between text-sm text-red-700">
                  <span>{error}</span>
                  <button
                    onClick={() => handleRemoveError(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'products', label: 'Products' },
              { id: 'orders', label: 'Orders' },
              { id: 'metrics', label: 'Metrics' },
              { id: 'matching', label: 'Matching' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'products' && renderProducts()}
          {activeTab === 'orders' && renderOrders()}
          {activeTab === 'metrics' && renderMetrics()}
          {activeTab === 'matching' && renderMatching()}
        </div>
      </div>
    </div>
  )
}

export default UnifiedDataView
