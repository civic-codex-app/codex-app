import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Only run middleware on routes that need auth checks:
     * - /dashboard, /admin, /account, /following, /onboarding (protected)
     * - /login, /signup (redirect if already authenticated)
     * - /api routes that need session refresh
     * Public pages skip middleware entirely for faster loads.
     */
    '/dashboard/:path*',
    '/admin/:path*',
    '/account/:path*',
    '/following/:path*',
    '/onboarding/:path*',
    '/login',
    '/signup',
    '/api/:path*',
  ],
}
