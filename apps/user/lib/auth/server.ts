import { createClient } from '@myapp/supabase/server'
import type { User } from '@supabase/supabase-js'

/**
 * @file lib/auth/server.ts
 * @description Server-side authentication helpers for Next.js App Router.
 *
 * These functions are designed for Server Components and Server Actions.
 * They use the session-based Supabase client (reads auth cookies).
 *
 */

export type AuthResult = {
	user: User | null
	supabase: Awaited<ReturnType<typeof createClient>>
	error: Error | null
}

/**
 * getAuthUser — fetches the currently authenticated user from the session.
 *
 * Returns both the user object and the Supabase client for convenience.
 * If no user is authenticated, user will be null.
 *
 * @example
 * ```ts
 * const { user, supabase } = await getAuthUser()
 * if (!user) redirect('/login')
 * ```
 */
export async function getAuthUser(): Promise<AuthResult> {
	const supabase = await createClient()
	const { data: { user }, error } = await supabase.auth.getUser()

	return {
		user,
		supabase,
		error: error ? new Error(error.message) : null,
	}
}

/**
 * requireAuth — fetches the authenticated user and throws if not found.
 *
 * Use this when you want to enforce authentication and don't want to
 * manually check for null. The calling page should have an error boundary
 * or let Next.js handle the error.
 *
 * @returns {Promise<{ user: User; supabase }>} Guaranteed non-null user
 * @throws {Error} If no user is authenticated
 *
 * @example
 * ```ts
 * const { user, supabase } = await requireAuth()
 * // user is guaranteed to be non-null here
 * ```
 */
export async function requireAuth(): Promise<{ user: User; supabase: Awaited<ReturnType<typeof createClient>> }> {
	const { user, supabase, error } = await getAuthUser()

	if (!user || error) {
		throw new Error('Authentication required')
	}

	return { user, supabase }
}
