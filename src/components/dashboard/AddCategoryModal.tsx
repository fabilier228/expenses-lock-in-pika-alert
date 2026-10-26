'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface AddCategoryModalProps {
  open: boolean
  onClose: () => void
}

export function AddCategoryModal({ open, onClose }: AddCategoryModalProps) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Something went wrong')
      setLoading(false)
      return
    }

    router.refresh()
    setName('')
    onClose()
  }

  function handleClose() {
    setName('')
    setError('')
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="New category">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Category name"
          type="text"
          placeholder="e.g. Groceries"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" disabled={loading || !name.trim()} className="w-full">
          {loading ? 'Creating…' : 'Create category'}
        </Button>
      </form>
    </Modal>
  )
}
