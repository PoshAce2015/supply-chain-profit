export type ReconcileRow = {
  asin: string
  sku?: string
  netSalesNetGST: number // Revenue_net × qty
  expectedFees: number // per spec
  settlementFees: number // from settlement dataset
  diff: number // settlementFees - expectedFees
  threshold: number // max(₹5, 0.008 × netSalesNetGST)
  status: 'OK' | 'Mismatch'
}

export type ReconcileSummary = {
  totalNetSales: number
  totalExpectedFees: number
  totalSettlementFees: number
  variancePct: number // abs(totalExpected - totalSettlement) / totalExpected
}
