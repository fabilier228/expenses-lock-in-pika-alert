import Link from 'next/link'
import type { SummaryCategory } from '@/types/database'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import { getCategoryColor } from '@/lib/utils/categoryColor'
import type { Currency } from '@/lib/utils/formatCurrency'

interface SummaryTableProps {
  categories: SummaryCategory[]
  period: string
  currency: Currency
}

export function SummaryTable({ categories, period, currency }: SummaryTableProps) {
  if (categories.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-gray-400">
        No expenses recorded yet.
      </p>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/summary/${cat.id}?period=${period}`}
          className="flex items-center gap-3 border-b border-gray-50 px-4 py-3.5 transition last:border-0 active:bg-gray-50"
        >
          <div className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: getCategoryColor(cat.id) }} />
          <span className="flex-1 text-sm font-medium text-gray-800">{cat.name}</span>
          <span className="text-xs text-gray-400">{cat.percentage}%</span>
          <span className="min-w-[80px] text-right text-sm font-semibold text-gray-900">
            {formatCurrency(cat.total, currency)}
          </span>
        </Link>
      ))}
    </div>
  )
}
