import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Endpoints de API com autenticação própria (cron via Bearer CRON_SECRET)
  // não passam pelo controle de sessão — senão seriam redirecionados p/ login.
  if (pathname.startsWith('/api/cron')) {
    return NextResponse.next({ request })
  }

  const response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cs) =>
          cs.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          ),
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const rotasPublicas = ['/', '/pricing', '/login', '/signup']
  const isPublica = rotasPublicas.includes(pathname)

  if (!user && !isPublica) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && ['/login', '/signup'].includes(pathname)) {
    return NextResponse.redirect(new URL('/carteira', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
