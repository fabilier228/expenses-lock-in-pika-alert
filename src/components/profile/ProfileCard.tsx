'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/profile/ThemeToggle'

interface ProfileCardProps {
  name: string
  email: string
  avatarUrl?: string
  memberSince: string
}

export function ProfileCard({ name, email, avatarUrl, memberSince }: ProfileCardProps) {
  const router = useRouter()

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

      <ThemeToggle />

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
