'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { Period } from '@/lib/utils/dateRanges'

const PERIODS: { value: Period; label: string }[] = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'year', label: 'Year' },
]

export function PeriodSelector() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = (searchParams.get('period') ?? 'month') as Period

  function select(period: Period) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('period', period)
    router.push(`/summary?${params.toString()}`)
  }

  return (
    <div className="flex gap-1 rounded-2xl bg-gray-100 p-1">
      {PERIODS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => select(value)}
          className={`flex-1 rounded-xl py-2 text-sm font-medium transition ${
            current === value
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
