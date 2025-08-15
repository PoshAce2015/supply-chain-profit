export type SlaSettings = {
  SLA_PO_Hours: number              // default 12
  SLA_Customs_Days: number          // default 4 (non-battery), red at 6
  BatteryExtraDays: number          // default +3
  twoPersonRule: boolean            // default false
}

export type Alert = {
  id: string                         // nanoid
  asin: string
  severity: 'red' | 'yellow'
  kind: 'MISSED_US_PO' | 'CUSTOMS_TIMEOUT'
  message: string
  createdAt: string                  // ISO
  acknowledgedBy?: string
}
