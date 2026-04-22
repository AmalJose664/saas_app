import { createClient } from '@myapp/supabase/server'

/**
 * Subscriptions Repository
 *
 * Raw Supabase access for the `subscriptions` table. No business logic here.
 * Joins with `profiles` and `plan` so callers get subscriber and plan info
 * in a single query. Called only by lib/subscriptions/service.ts.
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
