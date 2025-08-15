// Round to 2 decimal places for display
export function round2(n: number): number {
  return Math.round(n * 100) / 100
}

// Format INR currency for display
export function formatINR(n: number): string {
  return `₹${round2(n).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}
