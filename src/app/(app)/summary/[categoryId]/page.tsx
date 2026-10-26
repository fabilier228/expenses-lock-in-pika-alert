import { createClient } from '@/lib/supabase/server'
import { getDateRange, formatPeriodLabel, type Period } from '@/lib/utils/dateRanges'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import Link from 'next/link'

export default async function CategoryDrilldownPage({
  params,
  searchParams,
}: {
  params: { categoryId: string }
  searchParams: { period?: string }
}) {
  const period = (searchParams.period ?? 'month') as Period
  const supabase = createClient()
  const { start, end } = getDateRange(period)

  const [categoryRes, expensesRes] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
      .eq('id', params.categoryId)
      .single(),
    supabase
      .from('expenses')
      .select('*')
      .eq('category_id', params.categoryId)
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString())
      .order('created_at', { ascending: false }),
  ])

  const category = categoryRes.data
  const expenses = expensesRes.data ?? []
  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

  return (
    <div className="flex flex-col gap-4 p-4 pt-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/summary?period=${period}`}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500"
        >
          ←
        </Link>
        <h1 className="text-xl font-bold text-gray-900">{category?.name}</h1>
      </div>

      <div className="rounded-2xl bg-gray-900 p-4 text-white">
        <p className="text-sm text-gray-400">{formatPeriodLabel(period)}</p>
        <p className="mt-1 text-2xl font-bold">{formatCurrency(total)}</p>
        <p className="text-sm text-gray-400">{expenses.length} transactions</p>
      </div>

      {expenses.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">No expenses in this period.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
          {expenses.map((expense, i) => (
            <div
              key={expense.id}
              className={`flex items-start justify-between px-4 py-3.5 ${
                i < expenses.length - 1 ? 'border-b border-gray-50' : ''
              }`}
            >
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {expense.comment || category?.name}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(expense.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {formatCurrency(Number(expense.amount))}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
