/**
 * @file middleware.ts
 * @description Next.js middleware for route protection and authentication.
 *
 * ⚠️ Next.js 16 Deprecation Notice: The "middleware" convention is deprecated.
 * Future versions will use "proxy.ts". This file works for now but should be
 * migrated when Next.js fully transitions the API.
 *
 * Architecture Flow:
 * ┌─────────────┐     ┌──────────────┐     ┌─────────────┐
 * │   Request   │────→│  middleware  │────→│  Next.js    │
 * │  (browser)  │     │   (this)     │     │   page.tsx  │
 * └─────────────┘     └──────┬───────┘     └─────────────┘
 *                            │
 *              ┌─────────────┼─────────────┐
 *              ↓             ↓             ↓
 *        ┌─────────┐   ┌──────────┐  ┌─────────────┐
 *        │ Session │   │  JWT     │  │   Role      │
 *        │ check   │   │ decode   │  │  === admin  │
 *        └─────────┘   └──────────┘  └─────────────┘
 *
 * Protected routes: /dashboard/*
 * Unauthenticated users → /login
 * Non-admin users       → /not-authorized
 * Authenticated admins  → allow
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtDecode } from "jwt-decode"

/**
 * middleware — runs on every matched request before the page renders.
 *
 * @param request — NextRequest from the incoming HTTP request
 * @returns NextResponse — either redirect, or the original response with session cookies
 */
export async function middleware(request: NextRequest) {
	/**
	 * Get the pathname from the request URL.
	 */
	const pathname = request.nextUrl.pathname;

	// 1. Create the initial response
	let response = NextResponse.next({
		request: {
			headers: new Headers(request.headers),
		},
	});

	response.headers.set('x-pathname', pathname);

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
		{
			cookies: {
				getAll: () => request.cookies.getAll(),
				setAll: (cookies) => {
					cookies.forEach(({ name, value, options }) =>
						response.cookies.set(name, value, options)
					)
				}
			}
		}
	)

	const { data: { session } } = await supabase.auth.getSession()

	const isProtectedRoute = pathname.startsWith('/dashboard');

	if (isProtectedRoute) {
		if (!session) {
			return NextResponse.redirect(new URL('/login', request.url));
		}

		try {
			const decoded: any = jwtDecode(session.access_token);
			const role = decoded?.user_role;

			if (role !== 'admin') {
				return NextResponse.redirect(new URL('/not-authorized', request.url));
			}
		} catch (error) {
			return NextResponse.redirect(new URL('/login', request.url));
		}

		return response;
	}
	if (session && pathname.startsWith('/login')) {
		return NextResponse.redirect(new URL('/dashboard', request.url));
	}

	return response;
}

export const config = {
	matcher: [
		'/((?!api|_next/static|_next/image|favicon.ico|robots.txt).*)',
	],
}