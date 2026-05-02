import { createClient } from '@workspace/supabase/server'
import { supabaseAdmin } from '@workspace/supabase/admin'
import type { TablesUpdate } from '@workspace/database'

/**
 * Users Repository
 *
 * Raw Supabase access for the `profiles` table.
 * Search uses case-insensitive ILIKE on the email column.
 * Called only by lib/users/service.ts.
 */

export async function dbGetUsersPaginated(opts: {
	search: string
	from: number
	to: number
}) {
	const supabase = await createClient()
	let query = supabase
		.from('profiles')
		.select('*', { count: 'exact' })
		.order('created_at', { ascending: false })
		.range(opts.from, opts.to)

	if (opts.search.trim()) {
		query = query.ilike('email', `%${opts.search.trim()}%`)
	}

	return query
}

export async function dbGetUserById(id: string) {
	const supabase = await createClient()
	return supabase.from('profiles').select('*').eq('id', id).single()
}

export async function dbGetUsersCount() {
	const supabase = await createClient()
	return supabase.from('profiles').select('*', { count: 'exact', head: true })
}

export async function dbUpdateUser(id: string, data: TablesUpdate<'profiles'>) {
	const supabase = await createClient()
	return supabase.from('profiles').update(data).eq('id', id).select().single()
}

// ─── Admin / service-role ─────────────────────────────────────────────────────

/**
 * Update a user's profile using the service role key.
 * Used in webhook handlers where no user session is available.
 * Bypasses RLS — use only for trusted server-side operations.
 */
export async function dbUpdateUserAdmin(id: string, data: TablesUpdate<'profiles'>) {
	return supabaseAdmin.from('profiles').update(data).eq('id', id).select().single()
}
