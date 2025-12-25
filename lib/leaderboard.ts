/**
 * Get the start of the ISO week (Monday 00:00:00 UTC) for a given date.
 */
export function getISOWeekStart(date: Date): Date {
  const d = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  )
  const day = d.getUTCDay()
  // Adjust for Monday (day 0 is Sunday, so we need Monday = 1)
  const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1)
  d.setUTCDate(diff)
  return d
}

/**
 * Check if two dates are in the same ISO week.
 */
export function isSameISOWeek(date1: Date, date2: Date): boolean {
  const week1 = getISOWeekStart(date1)
  const week2 = getISOWeekStart(date2)
  return week1.getTime() === week2.getTime()
}

/**
 * Format a date as ISO week string (e.g., "2024-W01")
 */
export function formatISOWeek(date: Date): string {
  const weekStart = getISOWeekStart(date)
  const year = weekStart.getUTCFullYear()

  // Calculate week number
  const jan1 = new Date(Date.UTC(year, 0, 1))
  const jan1Day = jan1.getUTCDay()
  const jan1Monday =
    jan1Day <= 4
      ? new Date(Date.UTC(year, 0, 1 - jan1Day + 1))
      : new Date(Date.UTC(year, 0, 1 + (8 - jan1Day)))

  const weekNumber =
    Math.ceil(
      (weekStart.getTime() - jan1Monday.getTime()) / (7 * 24 * 60 * 60 * 1000)
    ) + 1

  return `${year}-W${String(weekNumber).padStart(2, '0')}`
}
