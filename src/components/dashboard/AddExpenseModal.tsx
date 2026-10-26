'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Category } from '@/types/database'

interface AddExpenseModalProps {
  category: Category | null
  onClose: () => void
}

export function AddExpenseModal({ category, onClose }: AddExpenseModalProps) {
  const router = useRouter()
  const [amount, setAmount] = useState('')
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!category) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category_id: category.id,
        amount,
        comment: comment || undefined,
      }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Something went wrong')
      setLoading(false)
      return
    }

    router.refresh()
    onClose()
  }

  function handleClose() {
    setAmount('')
    setComment('')
    setError('')
    onClose()
  }

  return (
    <Modal open={!!category} onClose={handleClose} title={category?.name ?? ''}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Amount (zł)"
          type="number"
          inputMode="decimal"
          min="0.01"
          step="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          autoFocus
        />
        <Input
          label="Comment (optional)"
          type="text"
          placeholder="What was this for?"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Adding…' : 'Add expense'}
        </Button>
      </form>
    </Modal>
  )
}
