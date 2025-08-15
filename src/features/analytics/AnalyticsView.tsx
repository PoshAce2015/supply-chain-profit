import React from 'react'
import { useSelector } from 'react-redux'
import { computeSegmentAverages } from './engine'
import { selectDataset } from '../imports/selectors'
import { Event } from '../../lib/types'

const AnalyticsView: React.FC = () => {
  const events = useSelector(selectDataset('events')) as any as Event[]
  
  const analytics = computeSegmentAverages(events)
  
  const formatDays = (days: number) => {
    return Math.round(days * 10) / 10 // Round to 1 decimal
  }
  
  return (
    <div data-testid="analytics-view" className="p-6">
      <h2 className="text-xl font-semibold mb-4">Analytics</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* IN_ORDER → US_PO */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">IN → USPO</h3>
          <p className="text-2xl font-bold text-blue-600">
            {formatDays(analytics.segments.in_to_uspo)} days
          </p>
        </div>
        
        {/* US_SHIP → STACKRY_RCVD */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">USSHIP → STACKRY</h3>
          <p className="text-2xl font-bold text-green-600">
            {formatDays(analytics.segments.usship_to_stackry)} days
          </p>
        </div>
        
        {/* EXPORT → CUSTOMS_CLEAR */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">EXPORT → CUSTOMS</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {formatDays(analytics.segments.export_to_customs)} days
          </p>
        </div>
        
        {/* DELIVERED → PAYMENT_RECEIVED */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-2">DELIVERED → PAYMENT</h3>
          <p className="text-2xl font-bold text-purple-600">
            {formatDays(analytics.segments.delivered_to_payment)} days
          </p>
        </div>
      </div>
      
      <div className="mt-6 text-sm text-gray-500">
        <p>Battery products add {analytics.batteryExtraDays} extra days to segments</p>
      </div>
    </div>
  )
}

export default AnalyticsView
