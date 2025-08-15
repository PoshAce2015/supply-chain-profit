// Safe date parsing with fallback
export function parseDateSafe(str: string): Date | null {
  try {
    const date = new Date(str)
    return isNaN(date.getTime()) ? null : date
  } catch {
    return null
  }
}

// Calculate days between two dates
export function daysBetween(a: Date, b: Date): number {
  const timeDiff = Math.abs(a.getTime() - b.getTime())
  return Math.floor(timeDiff / (1000 * 60 * 60 * 24))
}
