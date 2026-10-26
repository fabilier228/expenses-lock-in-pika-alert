export type Period = 'week' | 'month' | 'year'

export function getDateRange(period: Period): { start: Date; end: Date } {
  const now = new Date()
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)

  const start = new Date(now)
  start.setHours(0, 0, 0, 0)

  if (period === 'week') {
    const day = start.getDay()
    const diff = day === 0 ? -6 : 1 - day
    start.setDate(start.getDate() + diff)
  } else if (period === 'month') {
    start.setDate(1)
  } else {
    start.setMonth(0, 1)
  }

  return { start, end }
}

export function formatPeriodLabel(period: Period): string {
  const now = new Date()
  if (period === 'month') {
    return now.toLocaleString('default', { month: 'long', year: 'numeric' })
  }
  if (period === 'year') {
    return now.getFullYear().toString()
  }
  return 'This week'
}
