import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

const PRESET_CATEGORIES = [
  { name: 'Subscriptions', type: 'subscriptions' },
  { name: 'Other', type: 'other' },
  { name: 'Income', type: 'income' },
] as const

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const response = NextResponse.redirect(`${origin}/dashboard`)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

  if (sessionError) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)

    if (!existing?.length) {
      await supabase.from('categories').insert(
        PRESET_CATEGORIES.map((c) => ({ ...c, user_id: user.id }))
      )
    }
  }

  return response
}
