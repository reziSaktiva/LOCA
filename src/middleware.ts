import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import { env } from './shared/infrastructure/env'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(env.supabase.url, env.supabase.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, cacheHeaders) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))

        supabaseResponse = NextResponse.next({ request })

        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        )

        Object.entries(cacheHeaders).forEach(([key, value]) =>
          supabaseResponse.headers.set(key, value),
        )
      },
    },
  })

  // Wajib gunakan getClaims(), bukan getSession().
  // getClaims() memvalidasi JWT signature secara lokal — aman untuk server code.
  await supabase.auth.getClaims()

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Jalankan middleware pada semua route kecuali:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - file statis (svg, png, jpg, jpeg, gif, webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
