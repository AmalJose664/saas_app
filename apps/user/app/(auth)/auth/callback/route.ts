/**
 * @file app/(auth)/auth/callback/route.ts
 * @description OAuth callback handler for Google sign-in.
 *
 * Supabase redirects here after the user approves Google OAuth.
 * This route exchanges the one-time `code` param for a session,
 * sets the auth cookies, then redirects the user to /dashboard.
 *
 * If no code is present (e.g. direct navigation), it still redirects
 * to /dashboard — middleware will handle unauthenticated access.
 */
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url)
	const code = searchParams.get('code')

	if (code) {
		const cookieStore = await cookies()
		const supabase = createServerClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
			{
				cookies: {
					getAll: () => cookieStore.getAll(),
					setAll: (c) => c.forEach(({ name, value, options }) =>
						cookieStore.set(name, value, options))
				}
			}
		)
		await supabase.auth.exchangeCodeForSession(code)
	}

	return NextResponse.redirect(
		new URL('/dashboard', request.url)
	)
}