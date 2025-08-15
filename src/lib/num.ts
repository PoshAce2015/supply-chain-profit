/**
 * Safely round a number to 2 decimal places
 * Returns 0 if input is NaN or undefined
 */
export const round2 = (n: number | undefined | null): number => {
  if (n === undefined || n === null || isNaN(n)) return 0
  return Math.round(n * 100) / 100
}
