import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Order } from '../../lib/types'
import { ackStep1, ackStep2 } from './ordersSlice'
import { selectAgingTop10, selectStepLocks } from './selectors'
import { selectRedAlerts, selectYellowAlerts } from '../sla/selectors'
import { selectDataset } from '../imports/selectors'

const ChecklistView: React.FC = () => {
  const dispatch = useDispatch()
  const agingTop10 = useSelector(selectAgingTop10)
  const redAlerts = useSelector(selectRedAlerts)
  const yellowAlerts = useSelector(selectYellowAlerts)
  const orders = useSelector(selectDataset('indiaListings')) as Order[]
  
  // Get current user (fallback to system)
  const currentUser = 'system@local' // TODO: Get from users slice
  
  const handleAckStep1 = (asin: string) => {
    dispatch(ackStep1({ asin, user: currentUser }))
  }
  
  const handleAckStep2 = (asin: string) => {
    dispatch(ackStep2({ asin, user: currentUser }))
  }
  
  const getSlaStatus = (asin: string) => {
    const redAlert = redAlerts.find(alert => alert.asin === asin)
    const yellowAlert = yellowAlerts.find(alert => alert.asin === asin)
    
    if (redAlert) return { severity: 'red', message: redAlert.message }
    if (yellowAlert) return { severity: 'yellow', message: yellowAlert.message }
    return null
  }
  
  const getAgingSeverityClass = (severity?: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  
  return (
    <div data-testid="orders-view" className="p-6">
      <h2 className="text-xl font-semibold mb-4">Orders Checklist</h2>
      
      {/* Top 10 Aging Orders */}
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3">Top 10 Aging Orders</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  ASIN
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  SKU
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Last Event
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Days Aging
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  SLA Status
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Step 1
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Step 2
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {agingTop10.map((order, index) => {
                const slaStatus = getSlaStatus(order.asin)
                const stepLocks = useSelector(selectStepLocks(order.asin, currentUser))
                
                return (
                  <tr key={`${order.asin}-${index}`} data-testid={`aging-row-${index}`} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-sm text-gray-900 border-b">
                      {order.asin}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900 border-b">
                      {order.sku}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900 border-b">
                      {order.lastEventType}
                    </td>
                    <td className="px-3 py-2 text-sm text-center border-b">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAgingSeverityClass(order.severity)}`}>
                        {order.daysSinceLastEvent} days
                      </span>
                    </td>
                    <td className="px-3 py-2 text-sm text-center border-b">
                      {slaStatus && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          slaStatus.severity === 'red' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {slaStatus.severity.toUpperCase()}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-sm text-center border-b">
                      <button
                        data-testid={`ack-step1-${order.asin}`}
                        onClick={() => handleAckStep1(order.asin)}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Acknowledge
                      </button>
                    </td>
                    <td className="px-3 py-2 text-sm text-center border-b">
                      <button
                        data-testid={`ack-step2-${order.asin}`}
                        onClick={() => handleAckStep2(order.asin)}
                        disabled={!stepLocks.step2Enabled}
                        title={!stepLocks.step2Enabled ? "Two-person rule: Step 1 must be completed by a different user" : ""}
                        className={`px-3 py-1 text-xs rounded ${
                          stepLocks.step2Enabled
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Verify
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* All Orders */}
      <div>
        <h3 className="text-lg font-medium mb-3">All Orders</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  ASIN
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  SKU
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  SLA Status
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Step 1
                </th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                  Step 2
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order, index) => {
                const slaStatus = getSlaStatus(order.asin)
                const stepLocks = useSelector(selectStepLocks(order.asin, currentUser))
                
                return (
                  <tr key={`${order.asin}-${index}`} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-sm text-gray-900 border-b">
                      {order.asin}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900 border-b">
                      {order.sku}
                    </td>
                    <td className="px-3 py-2 text-sm text-center border-b">
                      {slaStatus && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          slaStatus.severity === 'red' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {slaStatus.severity.toUpperCase()}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-sm text-center border-b">
                      <button
                        data-testid={`ack-step1-${order.asin}`}
                        onClick={() => handleAckStep1(order.asin)}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Acknowledge
                      </button>
                    </td>
                    <td className="px-3 py-2 text-sm text-center border-b">
                      <button
                        data-testid={`ack-step2-${order.asin}`}
                        onClick={() => handleAckStep2(order.asin)}
                        disabled={!stepLocks.step2Enabled}
                        title={!stepLocks.step2Enabled ? "Two-person rule: Step 1 must be completed by a different user" : ""}
                        className={`px-3 py-1 text-xs rounded ${
                          stepLocks.step2Enabled
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        Verify
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default ChecklistView
