// Margin color calculation based on margin percentage
export function marginColor(marginPct: number): 'green' | 'yellow' | 'red' {
  if (marginPct >= 10) {
    return 'green'
  } else if (marginPct >= 5) {
    return 'yellow'
  } else {
    return 'red'
  }
}

// Commission mismatch detection (>0.5 percentage points difference)
export function isCommissionMismatch(manualPct: number, keepaPct: number): boolean {
  const difference = Math.abs(manualPct - keepaPct)
  return difference > 0.5
}
