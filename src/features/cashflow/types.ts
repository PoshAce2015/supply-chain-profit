export type CashflowInput = {
  openingINR: number
  horizonDays: number
  settlementLagDays: number
  fx: number // use rates default if not provided
}

export type CashflowEvent = {
  date: string
  type: 'INFLOW' | 'OUTFLOW'
  asin?: string
  label: string
  amountINR: number
}

export type CashflowResult = {
  daily: { date: string; balance: number }[]
  events: CashflowEvent[]
  runwayDays: number
}
