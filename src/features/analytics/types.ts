export type SegmentStat = { name: string; days: number }

export type AnalyticsSummary = {
  segments: {
    in_to_uspo: number
    usship_to_stackry: number
    export_to_customs: number
    delivered_to_payment: number
  }
  batteryExtraDays: number // for reference only
}
