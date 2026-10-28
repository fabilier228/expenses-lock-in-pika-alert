'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatCurrency, type Currency } from '@/lib/utils/formatCurrency'
import type { Expense } from '@/types/database'
import { Modal } from '@/components/ui/Modal'

export interface ExpenseHistoryItem extends Expense {
  categoryName: string
}

interface ExpenseHistoryProps {
  expenses: ExpenseHistoryItem[]
  currency: Currency
  expandable?: boolean
  emptyMessage?: string
}

export function ExpenseHistory({
  expenses,
  currency,
  expandable = false,
  emptyMessage = 'No records yet.',
}: ExpenseHistoryProps) {
  const router = useRouter()
  const [visibleCount, setVisibleCount] = useState(10)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [expenseToDelete, setExpenseToDelete] = useState<ExpenseHistoryItem | null>(null)
  const [error, setError] = useState('')
  const visibleExpenses = expandable ? expenses.slice(0, visibleCount) : expenses

  async function deleteExpense() {
    if (!expenseToDelete) return
    const expense = expenseToDelete
    setDeletingId(expense.id)
    setError('')
    const response = await fetch(`/api/expenses/${expense.id}`, { method: 'DELETE' })
    if (!response.ok) {
      setError('Could not delete this record. Please try again.')
      setDeletingId(null)
      return
    }
    setExpenseToDelete(null)
    setDeletingId(null)
    router.refresh()
  }

  if (expenses.length === 0) {
    return <p className="py-6 text-center text-sm text-gray-400">{emptyMessage}</p>
  }

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
        {visibleExpenses.map((expense, index) => (
          <div
            key={expense.id}
            className={`flex items-center gap-3 px-4 py-3.5 ${index < visibleExpenses.length - 1 ? 'border-b border-gray-50' : ''}`}
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-800">{expense.categoryName}</p>
              {expense.comment && <p className="truncate text-xs text-gray-500">{expense.comment}</p>}
              <p className="text-xs text-gray-400">
                {new Date(expense.created_at).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
            <span className="shrink-0 text-sm font-semibold text-gray-900">
              {formatCurrency(Number(expense.amount), currency)}
            </span>
            <button
              type="button"
              aria-label={`Delete record from ${expense.categoryName}`}
              disabled={deletingId !== null}
              onClick={() => setExpenseToDelete(expense)}
              className="min-h-11 min-w-16 shrink-0 rounded-xl px-3 text-xs font-semibold text-red-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            >
              {deletingId === expense.id ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        ))}
      </div>
      <Modal
        open={expenseToDelete !== null}
        onClose={() => deletingId === null && setExpenseToDelete(null)}
        title="Delete record?"
      >
        <p className="mb-5 text-sm text-gray-500">
          This will permanently delete this record. You can’t undo this action.
        </p>
        {error && <p role="alert" className="mb-4 text-sm text-red-500">{error}</p>}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={deletingId !== null}
            onClick={() => setExpenseToDelete(null)}
            className="min-h-12 rounded-xl bg-gray-100 px-5 text-sm font-semibold text-gray-700 disabled:opacity-50 sm:min-w-28"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={deletingId !== null}
            onClick={deleteExpense}
            className="min-h-12 rounded-xl bg-red-500 px-5 text-sm font-semibold text-white disabled:opacity-50 sm:min-w-28"
          >
            {deletingId ? 'Deleting…' : 'Delete record'}
          </button>
        </div>
      </Modal>
      {expandable && visibleCount < expenses.length && (
        <button
          type="button"
          onClick={() => setVisibleCount((count) => count + 10)}
          className="mt-3 w-full rounded-xl py-2.5 text-sm font-semibold text-indigo-400 transition hover:bg-gray-100"
        >
          Show more
        </button>
      )}
    </div>
  )
}
