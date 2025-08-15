export type ValidatorInputRow = {
  asin?: string
  sku?: string
  category?: string
  sellingPriceINR: number
  buyerShipINR?: number
  referralPercent?: number
  actualFeesINR?: number
  gstOnFeesINR?: number
  netProceedsINR?: number
}

export type ValidationIssue = {
  code: string
  severity: 'info' | 'warn' | 'error'
  message: string
}

export type ValidationResult = ValidatorInputRow & {
  issues: ValidationIssue[]
}
