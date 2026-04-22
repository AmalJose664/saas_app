import { createClient } from '@myapp/supabase/server'

/**
 * Repository — raw Supabase access for the subscriptions table only.
 */

export async function dbGetSubscriptions() {
	const supabase = await createClient()
	return supabase
		.from('subscriptions')
		.select('*, profiles(full_name, email), plan(name, amount, interval)')
		.order('created_at', { ascending: false })
}

export async function dbGetSubscriptionByUserId(userId: string) {
	const supabase = await createClient()
	return supabase
		.from('subscriptions')
		.select('*, plan(name, amount, interval)')
		.eq('user_id', userId)
		.maybeSingle()
}
