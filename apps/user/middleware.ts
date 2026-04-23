/**
 * @file middleware.ts
 * @description Route protection middleware for the user app.
 *
 * Runs on every request matched by `config.matcher`.
 * Checks for a valid Supabase session and enforces two rules:
 *
 * 1. Protected routes (/dashboard, /profile, /orders, /payments, /plans)
 *    → redirect to /login if no session
 *
 * 2. /login with an active session
 *    → redirect to /dashboard (already signed in)
 *
 * Auth cookies are refreshed on every request by passing them through
 * the Supabase SSR client's setAll handler.
 */
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedRoutes = ['/dashboard', '/orders', '/payments', '/profile', '/plans']

export async function middleware(request: NextRequest) {
	const response = NextResponse.next()
	const isLoginPage = request.nextUrl.pathname.startsWith('/login')

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
		{
			cookies: {
				getAll: () => request.cookies.getAll(),
				setAll: (cookies) => cookies.forEach(({ name, value, options }) =>
					response.cookies.set(name, value, options))
			}
		}
	)

	const { data: { session } } = await supabase.auth.getSession()

	const isProtectedRoute = protectedRoutes.some(route =>
		request.nextUrl.pathname.startsWith(route)
	)

	if (isProtectedRoute) {
		if (!session) {
			return NextResponse.redirect(new URL('/login', request.url))
		}
		return response
	}

	// Redirect authenticated users away from /login
	if (session && isLoginPage) {
		return NextResponse.redirect(new URL('/dashboard', request.url))
	}

	return response
}

export const config = {
	matcher: [
		'/dashboard/:path*',
		'/orders/:path*',
		'/payments/:path*',
		'/plans/:path*',
		'/profile/:path*',
		'/((?!api|_next/static|_next/image|favicon.ico|\\.well-known).*)'
	]
}
