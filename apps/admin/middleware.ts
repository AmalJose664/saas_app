import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtDecode } from "jwt-decode"

export async function middleware(request: NextRequest) {
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