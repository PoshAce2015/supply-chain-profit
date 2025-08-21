import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ingestFiles, IngestResult } from '../../lib/imports/ingest'

const BulkImportView: React.FC = () => {
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<IngestResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || !files.length) return

    setIsProcessing(true)
    setError(null)
    setResult(null)

    try {
      // Convert FileList to InFile format
      const inputs = await Promise.all(
        Array.from(files).map(async (f) => ({
          name: f.name,
          arrayBuffer: await f.arrayBuffer(),
        }))
      )

      const out = await ingestFiles(inputs, { returnWindowDays: 30 })
      setResult(out)

      // TODO: Dispatch to your store here
      // dispatch(importSlice.actions.setTables(out.tables))
      // dispatch(importSlice.actions.setTimeline(out.timeline))
      // dispatch(importSlice.actions.setSummaries(out.summaries))

      // Set test hook for Playwright tests
      if (typeof window !== 'undefined') {
        (window as any).__test_lastBulkImport = {
          filesCount: files.length,
          ordersCount: out.tables.orders.rows.length,
          summariesCount: out.summaries.length,
          timelineCount: Object.keys(out.timeline).length
        }
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }, [handleFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const getBranchColor = (branch: string) => {
    const colors: Record<string, string> = {
      paid: 'bg-green-100 text-green-800',
      awaiting_payment: 'bg-yellow-100 text-yellow-800',
      delivered_then_refunded: 'bg-red-100 text-red-800',
      cancelled_predelivery_refunded: 'bg-orange-100 text-orange-800',
      cancelled_predelivery_pending_refund: 'bg-orange-100 text-orange-800',
      cancelled_after_delivery_refunded: 'bg-red-100 text-red-800',
      cancelled_after_delivery_pending_refund: 'bg-red-100 text-red-800',
      send_to_fba: 'bg-blue-100 text-blue-800'
    }
    return colors[branch] || 'bg-gray-100 text-gray-800'
  }

  const getBranchLabel = (branch: string) => {
    const labels: Record<string, string> = {
      paid: 'Paid',
      awaiting_payment: 'Awaiting Payment',
      delivered_then_refunded: 'Delivered & Refunded',
      cancelled_predelivery_refunded: 'Cancelled Pre-delivery (Refunded)',
      cancelled_predelivery_pending_refund: 'Cancelled Pre-delivery (Pending Refund)',
      cancelled_after_delivery_refunded: 'Cancelled Post-delivery (Refunded)',
      cancelled_after_delivery_pending_refund: 'Cancelled Post-delivery (Pending Refund)',
      send_to_fba: 'Send to FBA'
    }
    return labels[branch] || branch
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate('/imports')}
            className="btn-neutral px-3 py-2 rounded-lg"
          >
            ← Back to Imports
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            📦 Bulk Import
          </h1>
        </div>
        <p className="text-gray-600 text-lg">
          Upload multiple files to build comprehensive customer order timelines
        </p>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Upload Files</h2>
        
        <div
          data-testid="bulk-import-dropzone"
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
            isProcessing
              ? 'border-gray-300 bg-gray-50 opacity-50 pointer-events-none'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-gray-600">Processing files...</p>
            </div>
          ) : (
            <div>
              <div className="text-4xl mb-4">📁</div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drop your files here
              </p>
              <p className="text-gray-600 mb-4">
                or click to browse
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Supported: Amazon Orders (TSV), Transactions (CSV), Shipment files, Cancellations
              </p>
              <input
                type="file"
                multiple
                accept=".csv,.tsv,.txt"
                onChange={handleFileSelect}
                className="hidden"
                id="bulk-file-upload"
              />
              <label
                htmlFor="bulk-file-upload"
                className="btn-primary px-6 py-2 rounded-lg cursor-pointer inline-block"
              >
                Choose Files
              </label>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">Error:</p>
            <p className="text-red-600">{error}</p>
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-500">Orders</h3>
              <p className="text-2xl font-bold text-gray-900">{result.tables.orders.rows.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-500">Transactions</h3>
              <p className="text-2xl font-bold text-gray-900">{result.tables.transactions.rows.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-500">Order Timelines</h3>
              <p className="text-2xl font-bold text-gray-900">{Object.keys(result.timeline).length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-500">Total Events</h3>
              <p className="text-2xl font-bold text-gray-900">{result.events.length}</p>
            </div>
          </div>

          {/* Branch Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Order Status Distribution</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(
                result.summaries.reduce((acc, summary) => {
                  acc[summary.branch] = (acc[summary.branch] || 0) + 1
                  return acc
                }, {} as Record<string, number>)
              ).map(([branch, count]) => (
                <div key={branch} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBranchColor(branch)}`}>
                    {getBranchLabel(branch)}
                  </span>
                  <span className="text-lg font-semibold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sample Orders */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Sample Orders</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-medium text-gray-900">Order ID</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-900">Status</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-900">Paid</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-900">Refunded</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-900">Delta</th>
                  </tr>
                </thead>
                <tbody>
                  {result.summaries.slice(0, 10).map((summary) => (
                    <tr key={summary.orderId} className="border-b border-gray-100">
                      <td className="py-2 px-3 text-gray-900 font-mono text-sm">{summary.orderId}</td>
                      <td className="py-2 px-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getBranchColor(summary.branch)}`}>
                          {getBranchLabel(summary.branch)}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-gray-900">${summary.paidToDate.toFixed(2)}</td>
                      <td className="py-2 px-3 text-gray-900">${summary.refundedToDate.toFixed(2)}</td>
                      <td className={`py-2 px-3 font-medium ${summary.delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${summary.delta.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {result.summaries.length > 10 && (
              <p className="text-sm text-gray-500 mt-2">
                Showing first 10 of {result.summaries.length} orders
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/orders')}
              className="btn-primary px-6 py-2 rounded-lg"
            >
              View All Orders
            </button>
            <button
              onClick={() => navigate('/analytics')}
              className="btn-secondary px-6 py-2 rounded-lg"
            >
              View Analytics
            </button>
            <button
              onClick={() => setResult(null)}
              className="btn-neutral px-6 py-2 rounded-lg"
            >
              Import More Files
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default BulkImportView
