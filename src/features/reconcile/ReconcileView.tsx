import React from 'react'
import { useSelector } from 'react-redux'
import { selectReconcileRows, selectReconcileSummary } from './selectors'

const ReconcileView: React.FC = () => {
  const rows = useSelector(selectReconcileRows)
  const summary = useSelector(selectReconcileSummary)
  
  const formatINR = (amount: number) => {
    return `₹${Math.round(amount).toLocaleString('en-IN')}`
  }
  
  const formatPercent = (pct: number) => {
    return `${Math.round(pct * 100) / 100}%`
  }
  
  return (
    <div data-testid="reconcile-view" className="p-6">
              <h2>Reconcile</h2>
      
      {/* Settlement Variance KPI */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <h3 className="mb-4">Settlement Variance</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Settlement Variance %</p>
            <p className="text-red-600 text-2xl font-bold">
              {formatPercent(summary.variancePct)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Net Sales</p>
            <p className="text-blue-600 text-2xl font-bold">
              {formatINR(summary.totalNetSales)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Expected Fees</p>
            <p className="text-green-600 text-2xl font-bold">
              {formatINR(summary.totalExpectedFees)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Settlement Fees</p>
            <p className="text-purple-600 text-2xl font-bold">
              {formatINR(summary.totalSettlementFees)}
            </p>
          </div>
        </div>
      </div>
      
      {/* Reconciliation Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3>Reconciliation Details</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ASIN
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Sales (₹)
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expected (₹)
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Settlement (₹)
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Diff (₹)
                </th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Threshold (₹)
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rows.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-sm text-gray-900">
                    {row.asin}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900">
                    {row.sku || '-'}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900 text-right">
                    {formatINR(row.netSalesNetGST)}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900 text-right">
                    {formatINR(row.expectedFees)}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900 text-right">
                    {formatINR(row.settlementFees)}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900 text-right">
                    {formatINR(row.diff)}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900 text-right">
                    {formatINR(row.threshold)}
                  </td>
                  <td className="px-3 py-2 text-sm text-center">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        row.status === 'OK'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && (
          <div className="rounded-xl border border-black/10 bg-white p-6 text-center">
            <div className="text-lg font-semibold mb-1">No reconciliation data</div>
            <p className="text-black/60 mb-4">Import orders and settlements to see results.</p>
            <a href="/imports" className="btn-primary inline-flex items-center px-3 h-9 rounded-md">Go to Imports</a>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReconcileView
