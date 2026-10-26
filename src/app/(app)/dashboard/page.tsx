import { createClient } from '@/lib/supabase/server'
import { CategoryGrid } from '@/components/dashboard/CategoryGrid'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true })

  return (
    <div className="p-4 pt-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Dashboard</h1>
      <CategoryGrid categories={categories ?? []} />
    </div>
  )
}
