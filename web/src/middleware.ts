import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Auth pages: login, register, forgot-password, update-password
  const isAuthRoute =
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/update-password')

  const isDashboardRoute = pathname.startsWith('/dashboard')

  // If user is logged in and trying to access auth pages (except update-password which needs auth),
  // redirect to dashboard
  if (user && (pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/forgot-password'))) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If user is not logged in and trying to access dashboard routes, redirect to login
  if (!user && isDashboardRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const isApiRoute = pathname.startsWith('/api')

  // Protect API routes from public access
  if (!user && isApiRoute) {
    // Allow auth and webhook routes
    if (pathname.startsWith('/api/auth') || pathname.startsWith('/api/webhooks')) {
      return supabaseResponse
    }
    // Allow POST to /api/sensor (used by ESP32, which authenticates via API_KEY)
    if (pathname === '/api/sensor' && request.method === 'POST') {
      return supabaseResponse
    }
    
    // Block other API access (like GET /api/sensor, etc.)
    return NextResponse.json({ success: false, error: 'Unauthorized API Access' }, { status: 401 })
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
