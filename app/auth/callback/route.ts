import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Sync Google avatar to profile if user doesn't have one set
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const googleAvatar = user.user_metadata?.avatar_url || user.user_metadata?.picture
          const googleName = user.user_metadata?.full_name || user.user_metadata?.name

          if (googleAvatar) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('avatar_url, display_name')
              .eq('id', user.id)
              .single()

            const updates: Record<string, string> = {}
            if (!profile?.avatar_url) updates.avatar_url = googleAvatar
            if (!profile?.display_name && googleName) updates.display_name = googleName

            if (Object.keys(updates).length > 0) {
              await supabase.from('profiles').update(updates).eq('id', user.id)
            }
          }
        }
      } catch {
        // Non-critical — don't block login if avatar sync fails
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
