import React, { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { selectOrders, selectProducts, selectUspos } from '../features/imports/selectors'
import { selectRates } from '../features/settings/ratesSlice'
import { selectSettlementVariancePct } from '../features/reconcile/selectors'
import { joinByAsin } from '../features/calculator/join'
import { computeRow } from '../lib/calc/formulas'
import { getDefaultRates } from '../lib/calc/defaults'
import { APP_VERSION } from '../lib/version'

const Header: React.FC = () => {
  const orders = useSelector(selectOrders)
  const products = useSelector(selectProducts)
  const uspos = useSelector(selectUspos)
  const rates = useSelector(selectRates) || getDefaultRates()
  const settlementVariance = useSelector(selectSettlementVariancePct)
  
  const kpis = useMemo(() => {
    const joinedRows = joinByAsin({ orders, products, uspos })
    
    let totalRevenue = 0
    let totalProfit = 0
    let totalOrders = joinedRows.length
    
    joinedRows.forEach(row => {
      const calcInput = {
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
      totalRevenue += result.revenue_net * row.qty
      totalProfit += result.profit
    })
    
    const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0
    
    return {
      revenue: totalRevenue,
      profit: totalProfit,
      orders: totalOrders,
      avgMargin,
      settlementVariance
    }
  }, [orders, products, uspos, rates, settlementVariance])
  
  const formatINR = (amount: number) => {
    return `₹${Math.round(amount).toLocaleString('en-IN')}`
  }
  
  const formatPercent = (pct: number) => {
    return `${Math.round(pct * 100) / 100}%`
  }
  return (
    <header className="header-gradient text-white" data-testid="app-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-semibold">Supply Chain & Profit 1.0</h1>
            <span 
              data-testid="app-version" 
              className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded"
            >
              v{APP_VERSION}
            </span>
          </div>
          
          {/* KPI Tiles */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="kpi-tile" data-testid="kpi-revenue">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Revenue</div>
              <div className="text-lg font-semibold text-gray-900">{formatINR(kpis.revenue)}</div>
            </div>
            <div className="kpi-tile" data-testid="kpi-profit">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Profit</div>
              <div className="text-lg font-semibold text-gray-900">{formatINR(kpis.profit)}</div>
            </div>
            <div className="kpi-tile" data-testid="kpi-orders">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Orders</div>
              <div className="text-lg font-semibold text-gray-900">{kpis.orders}</div>
            </div>
            <div className="kpi-tile" data-testid="kpi-avg-margin">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Avg Margin</div>
              <div className="text-lg font-semibold text-gray-900">{formatPercent(kpis.avgMargin)}</div>
            </div>
            <div className="kpi-tile" data-testid="kpi-settlement-var">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Settlement Variance</div>
              <div className="text-lg font-semibold text-gray-900">{formatPercent(kpis.settlementVariance)}</div>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <button className="text-white hover:text-gray-200 focus:outline-none focus:text-gray-200">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
