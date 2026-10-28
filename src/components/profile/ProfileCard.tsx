'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Currency } from '@/lib/utils/formatCurrency'

interface ProfileCardProps {
  name: string
  email: string
  avatarUrl?: string
  memberSince: string
  currency: Currency
}

export function ProfileCard({ name, email, avatarUrl, memberSince, currency: initialCurrency }: ProfileCardProps) {
  const router = useRouter()
  const [currency, setCurrency] = useState<Currency>(initialCurrency)
  const [savingCurrency, setSavingCurrency] = useState(false)
  const [currencyError, setCurrencyError] = useState('')

  async function changeCurrency(nextCurrency: Currency) {
    setCurrency(nextCurrency)
    setSavingCurrency(true)
    setCurrencyError('')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ data: { currency: nextCurrency } })
    if (error) {
      setCurrency(initialCurrency)
      setCurrencyError('Could not save currency. Please try again.')
    }
    else router.refresh()
    setSavingCurrency(false)
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const joined = new Date(memberSince).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={name}
            width={56}
            height={56}
            className="rounded-full"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-500">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p className="font-semibold text-gray-900">{name}</p>
          <p className="text-sm text-gray-500">{email}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <label htmlFor="currency" className="mb-2 block font-medium text-gray-900">Currency</label>
        <select
          id="currency"
          value={currency}
          disabled={savingCurrency}
          onChange={(event) => changeCurrency(event.target.value as Currency)}
          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-gray-900"
        >
          <option value="PLN">Polish złoty (PLN)</option>
          <option value="EUR">Euro (EUR)</option>
        </select>
        <p className="mt-2 text-xs text-gray-500">
          Applies to all amounts. Changing currency does not convert existing values.
        </p>
        {currencyError && <p role="alert" className="mt-2 text-sm text-red-500">{currencyError}</p>}
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-sm text-gray-500">Member since</p>
        <p className="mt-0.5 font-medium text-gray-900">{joined}</p>
      </div>

      <Button
        variant="danger"
        onClick={handleSignOut}
        className="w-full"
      >
        Sign out
      </Button>
    </div>
  )
}
