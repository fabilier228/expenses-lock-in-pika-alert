import Link from 'next/link'
import type { SummaryCategory } from '@/types/database'
import { formatCurrency } from '@/lib/utils/formatCurrency'

const COLORS = [
  'bg-indigo-400', 'bg-emerald-400', 'bg-amber-400', 'bg-red-400',
  'bg-violet-400', 'bg-cyan-400', 'bg-orange-400', 'bg-pink-400',
]

interface SummaryTableProps {
  categories: SummaryCategory[]
  period: string
}

export function SummaryTable({ categories, period }: SummaryTableProps) {
  if (categories.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-gray-400">
        No expenses recorded yet.
      </p>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
      {categories.map((cat, i) => (
        <Link
          key={cat.id}
          href={`/summary/${cat.id}?period=${period}`}
          className="flex items-center gap-3 border-b border-gray-50 px-4 py-3.5 transition last:border-0 active:bg-gray-50"
        >
          <div className={`h-3 w-3 shrink-0 rounded-full ${COLORS[i % COLORS.length]}`} />
          <span className="flex-1 text-sm font-medium text-gray-800">{cat.name}</span>
          <span className="text-xs text-gray-400">{cat.percentage}%</span>
          <span className="min-w-[80px] text-right text-sm font-semibold text-gray-900">
            {formatCurrency(cat.total)}
          </span>
        </Link>
      ))}
    </div>
  )
}
