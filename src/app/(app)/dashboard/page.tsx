import { createClient } from '@/lib/supabase/server'
import { CategoryGrid } from '@/components/dashboard/CategoryGrid'
import { ExpenseHistory, type ExpenseHistoryItem } from '@/components/dashboard/ExpenseHistory'
import type { Currency } from '@/lib/utils/formatCurrency'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const currency: Currency = user?.user_metadata?.currency === 'EUR' ? 'EUR' : 'PLN'
  const [categoriesRes, expensesRes] = await Promise.all([
    supabase.from('categories').select('*').order('created_at', { ascending: true }),
    supabase.from('expenses').select('*').order('created_at', { ascending: false }),
  ])
  const categories = categoriesRes.data ?? []
  const categoryNames = new Map(categories.map((category) => [category.id, category.name]))
  const recentExpenses: ExpenseHistoryItem[] = (expensesRes.data ?? []).map((expense) => ({
    ...expense,
    categoryName: categoryNames.get(expense.category_id) ?? 'Deleted category',
  }))

  return (
    <div className="p-4 pt-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Dashboard</h1>
      <CategoryGrid categories={categories} currency={currency} />
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold text-gray-900">Recent records</h2>
        <ExpenseHistory expenses={recentExpenses} currency={currency} expandable emptyMessage="No records yet." />
      </section>
    </div>
  )
}
