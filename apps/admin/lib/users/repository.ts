import { createClient } from '@myapp/supabase/server'
import type { TablesUpdate } from '@repo/database'

/**
 * Repository — raw Supabase access for the profiles table only.
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
