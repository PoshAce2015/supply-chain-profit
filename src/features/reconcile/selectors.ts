import { createSelector } from '@reduxjs/toolkit'
import { selectOrders, selectProducts, selectSettlements } from '../imports/selectors'
import { getDefaultRates } from '../../lib/calc/defaults'
import { reconcileRows } from './engine'
import { round2 } from '../../lib/num'

// Pure helper selectors that compute reconcile data on demand
export const selectReconcileData = createSelector(
  [selectOrders, selectProducts, selectSettlements],
  (orders, products, settlements) => {
    const rates = getDefaultRates()
    return reconcileRows({ orders, products, settlements }, rates)
  }
)

export const selectReconcileRows = createSelector(
  [selectReconcileData],
  (reconcileData) => reconcileData.rows
)

export const selectReconcileSummary = createSelector(
  [selectReconcileData],
  (reconcileData) => reconcileData.summary
)

export const selectSettlementVariancePct = createSelector(
  [selectReconcileSummary],
  (summary) => round2(summary?.variancePct || 0)
)
