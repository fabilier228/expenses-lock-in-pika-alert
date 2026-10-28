'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Subscription } from '@/types/database'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import type { Currency } from '@/lib/utils/formatCurrency'

interface SubscriptionModalProps {
  open: boolean
  categoryId: string
  onClose: () => void
  currency: Currency
}

export function SubscriptionModal({ open, categoryId, onClose, currency }: SubscriptionModalProps) {
  const router = useRouter()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchSubscriptions = useCallback(async () => {
    const res = await fetch(`/api/subscriptions?categoryId=${categoryId}`)
    if (res.ok) {
      const data = await res.json()
      setSubscriptions(data)
    }
  }, [categoryId])

  useEffect(() => {
    if (open && categoryId) fetchSubscriptions()
  }, [open, categoryId, fetchSubscriptions])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, amount, category_id: categoryId }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Something went wrong')
      setLoading(false)
      return
    }

    setName('')
    setAmount('')
    await fetchSubscriptions()
    router.refresh()
    setLoading(false)
  }

  async function toggleActive(sub: Subscription) {
    await fetch(`/api/subscriptions/${sub.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !sub.active }),
    })
    await fetchSubscriptions()
    router.refresh()
  }

  async function deleteSub(id: string) {
    await fetch(`/api/subscriptions/${id}`, { method: 'DELETE' })
    await fetchSubscriptions()
    router.refresh()
  }

  function handleClose() {
    setName('')
    setAmount('')
    setError('')
    onClose()
  }

  const monthlyTotal = subscriptions
    .filter((s) => s.active)
    .reduce((sum, s) => sum + Number(s.amount), 0)

  return (
    <Modal open={open} onClose={handleClose} title="Subscriptions">
      <div className="flex flex-col gap-5">
        {subscriptions.length > 0 && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium text-gray-500">Monthly total</p>
              <p className="text-base font-semibold text-indigo-600">
                {formatCurrency(monthlyTotal, currency)}
              </p>
            </div>
            <ul className="flex flex-col gap-2">
              {subscriptions.map((sub) => (
                <li
                  key={sub.id}
                  className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5"
                >
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(sub)}
                      className={`h-5 w-5 rounded-full border-2 transition ${
                        sub.active
                          ? 'border-indigo-500 bg-indigo-500'
                          : 'border-gray-300 bg-white'
                      }`}
                      title={sub.active ? 'Deactivate' : 'Activate'}
                    />
                    <span className={`text-sm font-medium ${sub.active ? 'text-gray-800' : 'text-gray-400 line-through'}`}>
                      {sub.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${sub.active ? 'text-gray-700' : 'text-gray-400'}`}>
                      {formatCurrency(Number(sub.amount), currency)}
                    </span>
                    <button
                      onClick={() => deleteSub(sub.id)}
                      className="text-gray-300 transition hover:text-red-400"
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleAdd} className="flex flex-col gap-3">
          <p className="text-sm font-medium text-gray-700">Add subscription</p>
          <Input
            placeholder="Name (e.g. Netflix)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            placeholder={`Monthly amount (${currency})`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button
            type="submit"
            disabled={loading || !name.trim() || !amount}
            className="w-full"
          >
            {loading ? 'Adding…' : 'Add'}
          </Button>
        </form>
      </div>
    </Modal>
  )
}
