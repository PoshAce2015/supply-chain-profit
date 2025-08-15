import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { computeRow } from '../../lib/calc/formulas'
import { getDefaultRates } from '../../lib/calc/defaults'
import { CalcInput } from '../../lib/calc/types'
import { selectOrders, selectProducts, selectUspos } from '../imports/selectors'
import { selectRates } from '../settings/ratesSlice'
import { joinByAsin } from './join'
import { formatINR, round2 } from './utils'

const CalculatorView: React.FC = () => {
  const orders = useSelector(selectOrders)
  const products = useSelector(selectProducts)
  const uspos = useSelector(selectUspos)
  
  const rates = useSelector(selectRates) || getDefaultRates()
  
  // Join data by ASIN and compute profitability with memoization
  const calculatedRows = useMemo(() => {
    const joinedRows = joinByAsin({ orders, products, uspos })
    
    return joinedRows.map((row, index) => {
    const calcInput: CalcInput = {
      asin: row.asin,
      sku: row.sku,
      qty: row.qty,
      sellingPriceINR: row.sellingPriceINR,
      buyerShipINR: row.buyerShipINR,
      channel: row.channel,
      weight: row.weight,
      weightUnit: row.weightUnit,
      unit_usd: row.unit_usd,
      ...(row.commission_value !== undefined && { commission_value: row.commission_value }),
      ...(row.commission_mode && { commission_mode: row.commission_mode }),
      ...(row.fx_override !== undefined && { fx_override: row.fx_override }),
    }
    
    const result = computeRow(calcInput, rates, 'rule')
    
      return {
        ...row,
        calculation: result,
        index,
      }
    })
  }, [orders, products, uspos, rates])
  
  if (calculatedRows.length === 0) {
    return (
      <div data-testid="calc-view" className="p-6">
        <h2 className="text-xl font-semibold mb-4">Calculator</h2>
        <p className="text-gray-500">No data available. Please import orders and products first.</p>
      </div>
    )
  }
  
  return (
    <div data-testid="calc-view" className="p-6">
      <h2 className="text-xl font-semibold mb-4">Calculator</h2>
      
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
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                SP₹
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Rev(net)₹
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Fees₹
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                GST_fees₹
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                TCS₹
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Landed/unit₹
              </th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Qty
              </th>
              <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Profit₹
              </th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                Margin%
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {calculatedRows.map((row) => {
              const { calculation, index } = row
              const marginColorClass = {
                green: 'bg-green-100 text-green-800',
                yellow: 'bg-yellow-100 text-yellow-800',
                red: 'bg-red-100 text-red-800',
              }[calculation.marginColor]
              
              return (
                <tr key={`${row.asin}-${index}`} className="hover:bg-gray-50">
                  <td className="px-3 py-2 text-sm text-gray-900 border-b">
                    {row.asin}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900 border-b">
                    {row.sku}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900 text-right border-b">
                    {formatINR(row.sellingPriceINR)}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900 text-right border-b">
                    {formatINR(calculation.revenue_net)}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900 text-right border-b">
                    {formatINR(calculation.fees_total)}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900 text-right border-b">
                    {formatINR(calculation.gst_fees)}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900 text-right border-b">
                    {formatINR(calculation.tcs)}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900 text-right border-b">
                    {formatINR(calculation.landed_unit)}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900 text-center border-b">
                    {row.qty}
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-900 text-right border-b">
                    {formatINR(calculation.profit)}
                  </td>
                  <td className="px-3 py-2 text-sm text-center border-b">
                    <div className="flex flex-col items-center space-y-1">
                      <span
                        data-testid={`margin-badge-${index}`}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${marginColorClass}`}
                      >
                        {round2(calculation.marginPct)}%
                      </span>
                      
                      {calculation.thinMargin && (
                        <span
                          data-testid={`pill-thin-${index}`}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                        >
                          Thin Margin
                        </span>
                      )}
                      
                      {calculation.flags.includes('Commission Mismatch') && (
                        <span
                          data-testid={`flag-commission-mismatch-${index}`}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                        >
                          Commission Mismatch
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default CalculatorView
