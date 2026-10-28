import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileCard } from '@/components/profile/ProfileCard'

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="p-4 pt-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Profile</h1>
      <ProfileCard
        name={user.user_metadata?.full_name ?? user.email ?? 'User'}
        email={user.email ?? ''}
        avatarUrl={user.user_metadata?.avatar_url}
        memberSince={user.created_at}
        currency={user.user_metadata?.currency === 'EUR' ? 'EUR' : 'PLN'}
      />
    </div>
  )
}
