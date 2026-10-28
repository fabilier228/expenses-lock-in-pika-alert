import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getDateRange, formatPeriodLabel, type Period } from '@/lib/utils/dateRanges'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import { PeriodSelector } from '@/components/summary/PeriodSelector'
import { DonutChart } from '@/components/summary/DonutChart'
import { SummaryTable } from '@/components/summary/SummaryTable'
import type { SummaryCategory } from '@/types/database'
import type { Currency } from '@/lib/utils/formatCurrency'

async function SummaryContent({ period }: { period: Period }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const currency: Currency = user?.user_metadata?.currency === 'EUR' ? 'EUR' : 'PLN'
  const { start, end } = getDateRange(period)

  const [categoriesRes, expensesRes, subscriptionsRes] = await Promise.all([
    supabase.from('categories').select('id, name, type').order('created_at'),
    supabase
      .from('expenses')
      .select('category_id, amount')
      .gte('created_at', start.toISOString())
      .lte('created_at', end.toISOString()),
    supabase.from('subscriptions').select('category_id, amount').eq('active', true),
  ])

  const categories = categoriesRes.data ?? []
  const expenses = expensesRes.data ?? []
  const activeSubs = subscriptionsRes.data ?? []

  const totalsMap: Record<string, number> = {}
  for (const exp of expenses) {
    totalsMap[exp.category_id] = (totalsMap[exp.category_id] ?? 0) + Number(exp.amount)
  }
  for (const sub of activeSubs) {
    const cat = categories.find((c) => c.id === sub.category_id)
    if (!cat || cat.type !== 'subscriptions') continue
    const multiplier = period === 'year' ? 12 : 1
    totalsMap[sub.category_id] = (totalsMap[sub.category_id] ?? 0) + Number(sub.amount) * multiplier
  }

  let totalSpent = 0
  let totalIncome = 0
  for (const cat of categories) {
    const amount = totalsMap[cat.id] ?? 0
    if (cat.type === 'income') totalIncome += amount
    else totalSpent += amount
  }

  const grandTotal = totalSpent || 1
  const summaryCategories: SummaryCategory[] = categories
    .filter((cat) => (totalsMap[cat.id] ?? 0) > 0)
    .map((cat) => ({
      id: cat.id,
      name: cat.name,
      type: cat.type,
      total: totalsMap[cat.id] ?? 0,
      percentage: Math.round(((totalsMap[cat.id] ?? 0) / grandTotal) * 1000) / 10,
    }))
    .sort((a, b) => b.total - a.total)

  return (
    <>
      <div className="rounded-2xl bg-indigo-500 p-5 text-white">
        <p className="text-sm font-medium text-indigo-200">{formatPeriodLabel(period)}</p>
        <p className="mt-1 text-3xl font-bold">{formatCurrency(totalSpent, currency)}</p>
        <p className="mt-0.5 text-sm text-indigo-200">Total spent</p>
        {totalIncome > 0 && (
          <p className="mt-2 text-sm text-indigo-100">
            Income: <span className="font-semibold">{formatCurrency(totalIncome, currency)}</span>
          </p>
        )}
        {period === 'week' && (
          <p className="mt-2 text-xs text-indigo-300">
            * Subscriptions shown as monthly equivalent
          </p>
        )}
      </div>

      <DonutChart categories={summaryCategories.filter((c) => c.type !== 'income')} currency={currency} />

      <SummaryTable categories={summaryCategories} period={period} currency={currency} />
    </>
  )
}

export default function SummaryPage({
  searchParams,
}: {
  searchParams: { period?: string }
}) {
  const period = (searchParams.period ?? 'month') as Period

  return (
    <div className="flex flex-col gap-4 p-4 pt-6">
      <h1 className="text-2xl font-bold text-gray-900">Summary</h1>
      <Suspense>
        <PeriodSelector />
      </Suspense>
      <Suspense fallback={<div className="h-48 animate-pulse rounded-2xl bg-gray-100" />}>
        <SummaryContent period={period} />
      </Suspense>
    </div>
  )
}
