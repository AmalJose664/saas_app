import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtDecode } from "jwt-decode"


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


	console.log({ isProtectedRoute, session: !!session ? "yes" : "No" })


	if (isProtectedRoute) {
		console.log("protected route ", request.url)
		if (!session) {
			console.log("from no session")
			return NextResponse.redirect(new URL('/login', request.url))
		}
		else {
			return response
		}
	} else {
		console.log("not protected route", request.url)
		if (session) {
			console.log("Yes session")
			if (isLoginPage) {
				console.log("login page with session")
				return NextResponse.redirect(new URL('/dashboard', request.url))
			} else {
				console.log("Not login")
				return response
			}
		} else {
			console.log("Not session")
			return response
		}
	}

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
