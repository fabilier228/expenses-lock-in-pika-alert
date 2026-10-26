'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Category } from '@/types/database'
import { AddExpenseModal } from './AddExpenseModal'
import { AddCategoryModal } from './AddCategoryModal'
import { SubscriptionModal } from './SubscriptionModal'

const TILE_COLORS = [
  'bg-violet-100 text-violet-700',
  'bg-blue-100 text-blue-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
  'bg-yellow-100 text-yellow-700',
  'bg-teal-100 text-teal-700',
  'bg-red-100 text-red-700',
  'bg-cyan-100 text-cyan-700',
]

const TYPE_COLORS: Record<string, string> = {
  subscriptions: 'bg-purple-100 text-purple-700',
  income: 'bg-emerald-100 text-emerald-700',
  other: 'bg-gray-100 text-gray-700',
}

function getTileColor(category: Category, index: number): string {
  return TYPE_COLORS[category.type] ?? TILE_COLORS[index % TILE_COLORS.length]
}

interface CategoryGridProps {
  categories: Category[]
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  const router = useRouter()
  const [editMode, setEditMode] = useState(false)
  const [activeCategory, setActiveCategory] = useState<Category | null>(null)
  const [subCategory, setSubCategory] = useState<Category | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  async function deleteCategory(id: string) {
    await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  function handleTileClick(category: Category) {
    if (editMode) return
    if (category.type === 'subscriptions') {
      setSubCategory(category)
    } else {
      setActiveCategory(category)
    }
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        {categories.map((cat, i) => (
          <div key={cat.id} className="relative">
            {editMode && (
              <button
                onClick={() => deleteCategory(cat.id)}
                className="absolute -right-1.5 -top-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white shadow"
              >
                ✕
              </button>
            )}
            <button
              onClick={() => handleTileClick(cat)}
              className={`relative w-full rounded-2xl p-4 text-left transition active:scale-95 ${getTileColor(cat, i)} ${editMode ? 'animate-[wiggle_0.3s_ease-in-out_infinite]' : ''}`}
            >
              <div className="mb-6 text-2xl">
                {cat.type === 'subscriptions' && '🔄'}
                {cat.type === 'income' && '💰'}
                {cat.type === 'other' && '📝'}
                {cat.type === 'regular' && '💳'}
              </div>
              <p className="font-semibold leading-tight">{cat.name}</p>
            </button>
          </div>
        ))}

        <button
          onClick={() => setAddOpen(true)}
          className="flex h-full min-h-[100px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 transition hover:border-gray-300 hover:text-gray-500 active:scale-95"
        >
          <span className="text-2xl">+</span>
          <span className="mt-1 text-xs font-medium">New category</span>
        </button>
      </div>

      <button
        onClick={() => setEditMode((v) => !v)}
        className={`mt-4 text-sm font-medium transition ${editMode ? 'text-indigo-600' : 'text-gray-400'}`}
      >
        {editMode ? 'Done editing' : 'Edit categories'}
      </button>

      <AddExpenseModal
        category={activeCategory}
        onClose={() => setActiveCategory(null)}
      />

      {subCategory && (
        <SubscriptionModal
          open={true}
          categoryId={subCategory.id}
          onClose={() => setSubCategory(null)}
        />
      )}

      <AddCategoryModal open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  )
}
