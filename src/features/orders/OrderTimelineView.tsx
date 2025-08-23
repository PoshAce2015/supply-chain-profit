import React, { useState, useEffect, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { OrderSummary, TimelineEvent, OrderBranch } from '../../lib/imports/ingest'
import { CHANNEL_LABELS, CLASS_LABELS } from '../../lib/types'
import dayjs from 'dayjs'
import { processCSVDataForTimeline } from '../timeline/timelineProcessor'
import { setTimeline } from '../timeline/timelineSlice'
import { sampleSalesData, samplePurchaseData } from '../timeline/sampleData'

interface OrderTimelineViewProps {}

const OrderTimelineView: React.FC<OrderTimelineViewProps> = () => {
  const dispatch = useDispatch()
  
  // State for filtering and display
  const [searchTerm, setSearchTerm] = useState('')
  const [branchFilter, setBranchFilter] = useState<OrderBranch | 'all'>('all')
  const [dateRange, setDateRange] = useState('30d')
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'timeline' | 'summary' | 'analytics'>('summary')
  
  // Function to load sample data
  const handleLoadSampleData = async () => {
    try {
      console.log('📁 Loading sample data for Customer Order Timeline...')
      
      // Process data directly for timeline
      const timelineData = processCSVDataForTimeline(sampleSalesData, samplePurchaseData)
      console.log('📋 Timeline result:', timelineData)
      dispatch(setTimeline(timelineData))
      
      console.log('✅ Sample data loaded successfully for Customer Order Timeline')
      alert(`Timeline created! ${Object.keys(timelineData.byOrder).length} orders with ${timelineData.orphan.length} orphan events.`)
    } catch (error) {
      console.error('❌ Failed to load sample data:', error)
      alert(`Failed to load sample data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Get data from store (this will be populated by the ingest system)
  const timeline = useSelector((state: any) => state.orders?.timeline || {})
  const summaries = useSelector((state: any) => state.orders?.summaries || [])
  
  // Also get data from our timeline slice and convert it to the expected format
  const timelineData = useSelector((state: any) => state.timeline || {})
  
  // Convert timeline data to OrderSummary format for Customer Order Timeline
  const convertedSummaries = useMemo(() => {
    console.log('🔄 Converting timeline data to OrderSummary format...');
    console.log('📊 timelineData.byOrder:', timelineData.byOrder);
    console.log('📊 Object.keys(timelineData.byOrder):', Object.keys(timelineData.byOrder || {}));
    
    if (!timelineData.byOrder || Object.keys(timelineData.byOrder).length === 0) {
      console.log('⚠️ No timeline data found, using original summaries');
      return summaries
    }
    
    const converted = Object.entries(timelineData.byOrder).map(([orderKey, orderData]: [string, any]) => {
      console.log(`🔍 Processing order: ${orderKey}`, orderData);
      
      const salesEvents = orderData.events.filter((e: any) => e.category === 'sales')
      const purchaseEvents = orderData.events.filter((e: any) => e.category === 'purchase')
      
      console.log(`📊 Order ${orderKey}: ${salesEvents.length} sales, ${purchaseEvents.length} purchases`);
      
      // Determine order status based on events
      let branch: any = 'paid' // default to paid
      if (salesEvents.length > 0 && purchaseEvents.length > 0) {
        branch = 'paid' // has both sales and purchase events
      } else if (salesEvents.length > 0) {
        branch = 'awaiting_payment' // only sales event
      } else if (purchaseEvents.length > 0) {
        branch = 'send_to_fba' // only purchase event
      }
      
      // Calculate dates
      const firstEvent = orderData.events[0]
      const lastEvent = orderData.events[orderData.events.length - 1]
      
      const summary = {
        orderId: orderKey,
        branch: branch,
        firstSeen: firstEvent?.when || new Date().toISOString(),
        lastSeen: lastEvent?.when || new Date().toISOString(),
        paid: salesEvents.length > 0 ? 100 : 0, // placeholder amount
        refunded: 0, // no refunds in our sample data
        delta: salesEvents.length > 0 ? 100 : 0, // placeholder amount
        events: orderData.events
      }
      
      console.log(`✅ Converted order ${orderKey}:`, summary);
      return summary;
    })
    
    console.log('🎉 Conversion complete. Converted summaries:', converted);
    return converted;
  }, [timelineData, summaries])
  
  // Use converted summaries if available, otherwise use original summaries
  const finalSummaries = convertedSummaries.length > 0 ? convertedSummaries : summaries
  
  // Debug logging
  console.log('OrderTimelineView - Timeline data:', timeline)
  console.log('OrderTimelineView - Original summaries data:', summaries)
  console.log('OrderTimelineView - Timeline keys:', Object.keys(timeline))
  console.log('OrderTimelineView - Original summaries count:', summaries.length)
  console.log('OrderTimelineView - TimelineData:', timelineData)
  console.log('OrderTimelineView - Converted summaries:', convertedSummaries)
  console.log('OrderTimelineView - Final summaries count:', finalSummaries.length)
  


  // Filtered and sorted data
  const filteredSummaries = useMemo(() => {
    let filtered = finalSummaries.filter((summary: OrderSummary) => {
      const matchesSearch = summary.orderId.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesBranch = branchFilter === 'all' || summary.branch === branchFilter
      return matchesSearch && matchesBranch
    })

    // Sort
    filtered.sort((a: OrderSummary, b: OrderSummary) => {
      let aVal: any, bVal: any
      
      switch (sortBy) {
        case 'date':
          aVal = new Date(a.lastSeen).getTime()
          bVal = new Date(b.lastSeen).getTime()
          break
        case 'amount':
          aVal = Math.abs(a.delta)
          bVal = Math.abs(b.delta)
          break
        case 'status':
          aVal = a.branch
          bVal = b.branch
          break
        default:
          return 0
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    return filtered
  }, [finalSummaries, searchTerm, branchFilter, sortBy, sortOrder])

  // Branch statistics
  const branchStats = useMemo(() => {
    const stats: Record<OrderBranch, number> = {
      paid: 0,
      awaiting_payment: 0,
      delivered_then_refunded: 0,
      cancelled_predelivery_refunded: 0,
      cancelled_predelivery_pending_refund: 0,
      cancelled_after_delivery_refunded: 0,
      cancelled_after_delivery_pending_refund: 0,
      send_to_fba: 0
    }

    finalSummaries.forEach((summary: OrderSummary) => {
      stats[summary.branch]++
    })

    return stats
  }, [finalSummaries])

  // Get branch color and label
  const getBranchInfo = (branch: OrderBranch) => {
    const config = {
      paid: { color: 'bg-green-100 text-green-800', label: 'Paid & Delivered', icon: '✅' },
      awaiting_payment: { color: 'bg-yellow-100 text-yellow-800', label: 'Awaiting Payment', icon: '⏳' },
      delivered_then_refunded: { color: 'bg-red-100 text-red-800', label: 'Delivered & Refunded', icon: '↩️' },
      cancelled_predelivery_refunded: { color: 'bg-orange-100 text-orange-800', label: 'Cancelled & Refunded', icon: '❌' },
      cancelled_predelivery_pending_refund: { color: 'bg-red-100 text-red-800', label: 'Cancelled - Refund Pending', icon: '⏸️' },
      cancelled_after_delivery_refunded: { color: 'bg-purple-100 text-purple-800', label: 'Delivered & Cancelled', icon: '🔄' },
      cancelled_after_delivery_pending_refund: { color: 'bg-pink-100 text-pink-800', label: 'Delivered & Cancelled - Refund Pending', icon: '⏸️' },
      send_to_fba: { color: 'bg-blue-100 text-blue-800', label: 'Send to FBA', icon: '📦' }
    }
    return config[branch]
  }

  // Get event icon and color
  const getEventInfo = (event: TimelineEvent) => {
    const config = {
      ORDERED: { icon: '📋', color: 'text-blue-600' },
      SHIPMENT_CREATED: { icon: '📦', color: 'text-green-600' },
      IN_TRANSIT: { icon: '🚚', color: 'text-yellow-600' },
      DELIVERED: { icon: '✅', color: 'text-green-600' },
      CANCELLED_VENDOR: { icon: '❌', color: 'text-red-600' },
      CANCELLED_CUSTOMER: { icon: '❌', color: 'text-red-600' },
      REFUND_ISSUED: { icon: '↩️', color: 'text-orange-600' },
      PAYMENT_RELEASED: { icon: '💰', color: 'text-green-600' },
      RETURN_WINDOW_LAPSED: { icon: '⏰', color: 'text-gray-600' }
    }
    return config[event.type] || { icon: '📝', color: 'text-gray-600' }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Customer Order Timeline</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Track order status, payments, and fulfillment events
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  📋 Customer order tracking • 
                  🔗 For supply chain events (sales + purchases), see <a href="/timeline" className="text-blue-600 hover:underline">Supply Chain Timeline</a>
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setViewMode('timeline')}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    viewMode === 'timeline'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Timeline
                </button>
                <button
                  onClick={() => setViewMode('summary')}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    viewMode === 'summary'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Summary
                </button>
                <button
                  onClick={() => setViewMode('analytics')}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    viewMode === 'analytics'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Load Sample Data Button */}
          <div className="mb-4">
            <button
              onClick={handleLoadSampleData}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Load Sample Data
            </button>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Search by Order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Branch Filter */}
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value as OrderBranch | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid & Delivered</option>
              <option value="awaiting_payment">Awaiting Payment</option>
              <option value="delivered_then_refunded">Delivered & Refunded</option>
              <option value="cancelled_predelivery_refunded">Cancelled & Refunded</option>
              <option value="cancelled_predelivery_pending_refund">Cancelled - Refund Pending</option>
              <option value="cancelled_after_delivery_refunded">Delivered & Cancelled</option>
              <option value="cancelled_after_delivery_pending_refund">Delivered & Cancelled - Refund Pending</option>
              <option value="send_to_fba">Send to FBA</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'status')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
              <option value="status">Sort by Status</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {viewMode === 'timeline' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order List */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Orders ({filteredSummaries.length})</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {filteredSummaries.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No orders found
                    </div>
                  ) : (
                    filteredSummaries.map((summary: OrderSummary) => {
                      const branchInfo = getBranchInfo(summary.branch)
                      return (
                        <div
                          key={summary.orderId}
                          onClick={() => setSelectedOrder(summary.orderId)}
                          className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                            selectedOrder === summary.orderId ? 'bg-blue-50 border-blue-200' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 truncate">
                                {summary.orderId}
                              </div>
                              <div className="text-sm text-gray-500">
                                {dayjs(summary.lastSeen).format('MMM D, YYYY')}
                              </div>
                              {/* Source information */}
                              <div className="flex items-center gap-1 mt-1">
                                {summary.source?.channel && (
                                  <span data-testid="order-source-channel" className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700">
                                    {CHANNEL_LABELS[summary.source.channel]}
                                  </span>
                                )}
                                {summary.source?.orderClass && (
                                  <span data-testid="order-source-class" className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700">
                                    {CLASS_LABELS[summary.source.orderClass]}
                                  </span>
                                )}
                                {!summary.source && <span data-testid="order-source-empty" className="text-slate-400 text-xs">—</span>}
                              </div>
                            </div>
                            <div className={`px-2 py-1 text-xs font-medium rounded-full ${branchInfo.color}`}>
                              {branchInfo.icon} {branchInfo.label}
                            </div>
                          </div>
                          <div className="mt-2 text-sm">
                            <span className={`font-medium ${summary.delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ₹{Math.abs(summary.delta).toFixed(2)}
                            </span>
                            {summary.delta >= 0 ? ' (Profit)' : ' (Loss)'}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Timeline View */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    {selectedOrder ? `Timeline: ${selectedOrder}` : 'Select an order to view timeline'}
                  </h3>
                </div>
                <div className="p-4">
                  {selectedOrder && timeline[selectedOrder] ? (
                    <div className="space-y-4">
                      {timeline[selectedOrder]
                        .sort((a: TimelineEvent, b: TimelineEvent) => new Date(a.at).getTime() - new Date(b.at).getTime())
                        .map((event: TimelineEvent, index: number) => {
                          const eventInfo = getEventInfo(event)
                          return (
                            <div key={index} className="flex items-start space-x-3">
                              <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center ${eventInfo.color}`}>
                                <span className="text-sm">{eventInfo.icon}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900">
                                  {event.type.replace(/_/g, ' ')}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {dayjs(event.at).format('MMM D, YYYY h:mm A')}
                                </div>
                                {event.amount && (
                                  <div className="text-sm text-gray-600">
                                    Amount: ₹{event.amount.toFixed(2)} {event.currency}
                                  </div>
                                )}
                                {event.details && Object.keys(event.details).length > 0 && (
                                  <div className="mt-1 text-xs text-gray-400">
                                    {Object.entries(event.details).map(([key, value]) => (
                                      <span key={key} className="mr-2">
                                        {key}: {String(value)}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      {selectedOrder ? 'No timeline events found for this order' : 'Select an order from the list to view its timeline'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'summary' && (
          <div className="space-y-6">
            {/* Branch Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {Object.entries(branchStats).map(([branch, count]) => {
                const branchInfo = getBranchInfo(branch as OrderBranch)
                return (
                  <div key={branch} className="bg-white rounded-lg shadow p-4">
                    <div className="text-center">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${branchInfo.color}`}>
                        {branchInfo.icon} {branchInfo.label}
                      </div>
                      <div className="mt-2 text-2xl font-bold text-gray-900">{count}</div>
                      <div className="text-sm text-gray-500">orders</div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Summary Table */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Order Summary</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        First Seen
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Seen
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Paid
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Refunded
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Net
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSummaries.map((summary: OrderSummary) => {
                      const branchInfo = getBranchInfo(summary.branch)
                      return (
                        <tr key={summary.orderId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {summary.orderId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${branchInfo.color}`}>
                              {branchInfo.icon} {branchInfo.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {dayjs(summary.firstSeen).format('MMM D, YYYY')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {dayjs(summary.lastSeen).format('MMM D, YYYY')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                            ₹{(summary.paid || 0).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                            ₹{(summary.refunded || 0).toFixed(2)}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${summary.delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ₹{summary.delta.toFixed(2)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Analytics Dashboard</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{summaries.length}</div>
                  <div className="text-sm text-gray-500">Total Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    ₹{summaries.reduce((sum: number, s: OrderSummary) => sum + Math.max(0, s.delta), 0).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">Total Profit</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">
                    ₹{summaries.reduce((sum: number, s: OrderSummary) => sum + Math.abs(Math.min(0, s.delta)), 0).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">Total Loss</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderTimelineView
