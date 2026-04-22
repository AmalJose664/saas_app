import { createClient } from '@myapp/supabase/server'


export async function dbGetOrders(opts: { limit?: number; userId?: string } = {}) {
	const supabase = await createClient()

	let query = supabase
		.from('orders')
		.select('*, profiles(full_name, email)')
		.order('created_at', { ascending: false })

	if (opts.userId) {
		query = query.eq('user_id', opts.userId)
	}

	if (opts.limit) {
		query = query.limit(opts.limit)
	}

	return query
}

export async function dbGetOrdersCount() {
	const supabase = await createClient()
	return supabase.from('orders').select('*', { count: 'exact', head: true })
}

export async function dbGetOrdersRevenue() {
	const supabase = await createClient()
	return supabase.from('orders').select('amount_paise')
}
