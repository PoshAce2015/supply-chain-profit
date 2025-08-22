import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../app/store';
import { clearTimelineData } from '../imports/importsSlice';
import { setTimeline } from './timelineSlice';

export default function TimelineView() {
  const dispatch = useDispatch();
  const byOrder = useSelector((state: RootState) => state.timeline?.byOrder ?? {});
  const orphan = useSelector((state: RootState) => state.timeline?.orphan ?? []);
  const timelineData = useSelector((state: RootState) => state.imports?.timelineData);
  const keys = Object.keys(byOrder);
  
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'orders' | 'orphans'>('timeline');

  // Debug information
  const debugInfo = {
    timelineDataCounts: timelineData ? Object.fromEntries(
      Object.entries(timelineData).map(([k, v]) => [k, Array.isArray(v) ? v.length : 0])
    ) : {},
    byOrderCount: Object.keys(byOrder).length,
    orphanCount: orphan.length,
    lastBuildAt: useSelector((state: RootState) => state.timeline?.lastBuildAt)
  };

  const handleDeleteOrder = (orderKey: string) => {
    if (confirm(`Are you sure you want to delete order ${orderKey}? This will remove all associated events.`)) {
      // Remove from timeline state
      const updatedByOrder = { ...byOrder };
      delete updatedByOrder[orderKey];
      dispatch(setTimeline({ ...byOrder, byOrder: updatedByOrder, orphan }));
      
      // Clear related data from imports
      dispatch(clearTimelineData('sales'));
      dispatch(clearTimelineData('purchase'));
      
      if (selectedOrder === orderKey) {
        setSelectedOrder(null);
      }
    }
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all timeline data? This action cannot be undone.')) {
      dispatch(setTimeline({ byOrder: {}, orphan: [], lastBuildAt: undefined }));
      dispatch(clearTimelineData('sales'));
      dispatch(clearTimelineData('purchase'));
      setSelectedOrder(null);
    }
  };

  const getOrderSummary = (orderKey: string) => {
    const order = byOrder[orderKey];
    if (!order) return null;
    
    const salesEvents = order.events.filter(e => e.category === 'sales');
    const purchaseEvents = order.events.filter(e => e.category === 'purchase');
    
    return {
      orderKey,
      totalEvents: order.events.length,
      salesCount: salesEvents.length,
      purchaseCount: purchaseEvents.length,
      firstDate: order.events[0]?.when || 'Unknown',
      lastDate: order.events[order.events.length - 1]?.when || 'Unknown'
    };
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Timeline</h1>
            <p className="text-gray-600">Unified view of sales, purchases, and related events by order</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleClearAll}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Clear All Data
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'timeline'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Timeline View ({keys.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'orders'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Orders List ({keys.length})
          </button>
          <button
            onClick={() => setActiveTab('orphans')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'orphans'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Orphan Events ({orphan.length})
          </button>
        </nav>
      </div>

      {/* Debug information */}
      <details className="mb-6 rounded-lg border border-slate-200 bg-white p-4">
        <summary className="text-sm font-medium text-slate-700 cursor-pointer">
          Debug Info
        </summary>
        <div className="mt-3">
          <pre className="text-xs text-slate-600 bg-slate-50 p-3 rounded">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      </details>

      {/* Timeline View */}
      {activeTab === 'timeline' && (
        <div data-testid="orders-timeline" className="space-y-6">
          {keys.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📊</div>
              <p className="text-lg text-gray-900 mb-2">No stitched orders yet</p>
              <p className="text-sm text-gray-500">Import sales and purchase data to see combined timelines</p>
            </div>
          )}

          {keys.map(k => {
            const t = byOrder[k];
            const summary = getOrderSummary(k);
            return (
              <article key={k} data-testid="timeline-order-card" className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <header className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">Order {k}</h3>
                    <div className="flex gap-2">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        {t.events.length} events
                      </span>
                      {summary && (
                        <>
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            {summary.salesCount} sales
                          </span>
                          <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                            {summary.purchaseCount} purchases
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-slate-500">
                      {summary?.firstDate} → {summary?.lastDate}
                    </div>
                    <button
                      onClick={() => handleDeleteOrder(k)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Delete order"
                    >
                      🗑️
                    </button>
                  </div>
                </header>
                
                <ol className="space-y-3">
                  {t.events.map(ev => (
                    <li key={ev.id} data-testid={`timeline-row-${ev.category}`} className="flex items-center gap-4 p-3 rounded-md bg-slate-50">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium uppercase ${
                          ev.category === 'sales' ? 'bg-green-100 text-green-700' :
                          ev.category === 'purchase' ? 'bg-purple-100 text-purple-700' :
                          'bg-slate-200 text-slate-700'
                        }`}>
                          {ev.category}
                        </span>
                        <span className="text-sm text-slate-600">{ev.when ?? '—'}</span>
                        
                        {/* Optional source chips */}
                        {ev.category === 'sales' && ev.raw?.source?.channel && (
                          <span data-testid="sales-source-chip" className="ml-2 text-xs text-slate-500">
                            {ev.raw.source.channel}
                            {ev.raw.source.orderClass && ` · ${ev.raw.source.orderClass}`}
                          </span>
                        )}
                        {ev.category === 'purchase' && ev.raw?.purchaseSource?.vendor && (
                          <span data-testid="purchase-source-chip" className="ml-2 text-xs text-slate-500">
                            {ev.raw.purchaseSource.vendor}
                            {ev.raw.purchaseSource.domain && ` · ${ev.raw.purchaseSource.domain}`}
                          </span>
                        )}
                      </div>
                      
                      {/* Show key details from raw data */}
                      <div className="text-xs text-slate-500 min-w-0">
                        {ev.raw?.sku && <span className="block">SKU: {ev.raw.sku}</span>}
                        {ev.raw?.qty && <span className="block">Qty: {ev.raw.qty}</span>}
                        {ev.raw?.unit_cost && <span className="block">Cost: ${ev.raw.unit_cost}</span>}
                      </div>
                    </li>
                  ))}
                </ol>
              </article>
            );
          })}
        </div>
      )}

      {/* Orders List View */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-medium text-gray-900">Orders Summary</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Events</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchases</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Range</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {keys.map(orderKey => {
                  const summary = getOrderSummary(orderKey);
                  return (
                    <tr key={orderKey} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{orderKey}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{summary?.totalEvents}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{summary?.salesCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{summary?.purchaseCount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {summary?.firstDate} → {summary?.lastDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleDeleteOrder(orderKey)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Orphan Events View */}
      {activeTab === 'orphans' && (
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-medium text-gray-900">Orphan Events ({orphan.length})</h3>
            <p className="text-sm text-gray-500 mt-1">Events that couldn't be linked to orders</p>
          </div>
          <div className="p-6">
            {orphan.length === 0 ? (
              <p className="text-gray-500">No orphan events found.</p>
            ) : (
              <div className="space-y-3">
                {orphan.slice(0, 20).map((ev, index) => (
                  <div key={ev.id} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium uppercase ${
                        ev.category === 'sales' ? 'bg-green-100 text-green-700' :
                        ev.category === 'purchase' ? 'bg-purple-100 text-purple-700' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {ev.category}
                      </span>
                      <span className="text-sm text-gray-600">{ev.when || 'No date'}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      <pre className="whitespace-pre-wrap">{JSON.stringify(ev.raw, null, 2)}</pre>
                    </div>
                  </div>
                ))}
                {orphan.length > 20 && (
                  <p className="text-sm text-gray-500">... and {orphan.length - 20} more orphan events</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
