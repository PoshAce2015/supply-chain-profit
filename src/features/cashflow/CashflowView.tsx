import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { buildCashflow } from './engine'
import { CashflowInput } from './types'
import { selectDataset } from '../imports/selectors'
import { getDefaultRates } from '../../lib/calc/defaults'
import { Event, Order, USPO } from '../../lib/types'

const CashflowView: React.FC = () => {
  const events = useSelector(selectDataset('events')) as Event[]
  const orders = useSelector(selectDataset('indiaListings')) as Order[]
  const uspos = useSelector(selectDataset('uspo')) as USPO[]
  const rates = getDefaultRates()
  
  const [input, setInput] = useState<CashflowInput>({
    openingINR: 1000000, // 10 lakh INR
    horizonDays: 90,
    settlementLagDays: 30,
    fx: rates.FX,
  })
  
  const [result, setResult] = useState<any>(null)
  
  const handleCompute = () => {
    const cashflowResult = buildCashflow(
      { events, orders, uspos },
      input,
      rates
    )
    setResult(cashflowResult)
  }
  
  const formatINR = (amount: number) => {
    return `₹${Math.round(amount).toLocaleString('en-IN')}`
  }
  
  return (
    <div data-testid="cashflow-view" className="p-6">
      <h2 className="text-xl font-semibold mb-4">Cashflow</h2>
      
      {/* Input Form */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <h3 className="text-lg font-medium mb-4">Cashflow Parameters</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Opening Balance (₹)
            </label>
            <input
              type="number"
              value={input.openingINR}
              onChange={(e) => setInput({ ...input, openingINR: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Horizon (Days)
            </label>
            <input
              type="number"
              value={input.horizonDays}
              onChange={(e) => setInput({ ...input, horizonDays: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Settlement Lag (Days)
            </label>
            <input
              type="number"
              value={input.settlementLagDays}
              onChange={(e) => setInput({ ...input, settlementLagDays: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              FX Rate
            </label>
            <input
              type="number"
              value={input.fx}
              onChange={(e) => setInput({ ...input, fx: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <button
          onClick={handleCompute}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Compute Cashflow
        </button>
      </div>
      
      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium mb-4">Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Runway Days</p>
                <p className="text-2xl font-bold text-red-600">{result.runwayDays}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Ending Balance</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatINR(result.daily[result.daily.length - 1]?.balance || 0)}
                </p>
              </div>
            </div>
          </div>
          
          {/* Daily Balances Table */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium mb-4">Daily Balances (First 10)</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Date
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      Balance (₹)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {result.daily.slice(0, 10).map((day: any, index: number) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-sm text-gray-900 border-b">
                        {day.date}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900 text-right border-b">
                        {formatINR(day.balance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Events List */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium mb-4">Cashflow Events</h3>
            <div className="space-y-2">
              {result.events.slice(0, 10).map((event: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <span className="text-sm font-medium">{event.date.split('T')[0]}</span>
                    <span className="ml-2 text-sm text-gray-600">{event.label}</span>
                  </div>
                  <span className={`text-sm font-medium ${
                    event.type === 'INFLOW' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {event.type === 'INFLOW' ? '+' : '-'}{formatINR(event.amountINR)}
                  </span>
                </div>
              ))}
              {result.events.length > 10 && (
                <p className="text-sm text-gray-500 text-center">
                  ... and {result.events.length - 10} more events
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CashflowView
