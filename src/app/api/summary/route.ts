import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { getDateRange, type Period } from '@/lib/utils/dateRanges'
import type { SummaryResponse, SummaryCategory } from '@/types/database'

export async function GET(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const period = (searchParams.get('period') ?? 'month') as Period
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

  // Add subscription recurring totals to their categories
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
    if (cat.type === 'income') {
      totalIncome += amount
    } else {
      totalSpent += amount
    }
  }

  const grandTotal = totalSpent || 1 // avoid division by zero

  const summaryCategories: SummaryCategory[] = categories
    .filter((cat) => (totalsMap[cat.id] ?? 0) > 0)
    .map((cat) => ({
      id: cat.id,
      name: cat.name,
      type: cat.type,
      total: totalsMap[cat.id] ?? 0,
      percentage: Math.round(((totalsMap[cat.id] ?? 0) / grandTotal) * 100 * 10) / 10,
    }))
    .sort((a, b) => b.total - a.total)

  const response: SummaryResponse = {
    period,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    totalSpent,
    totalIncome,
    categories: summaryCategories,
  }

  return NextResponse.json(response)
}
