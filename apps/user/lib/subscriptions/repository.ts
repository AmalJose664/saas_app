import { createClient } from '@myapp/supabase/server'
import { TablesInsert, TablesUpdate } from '@repo/database'

/**
 * Subscriptions Repository
 *
 * Raw Supabase access for the `subscriptions` table.
 * All functions return the raw Supabase response and are called only
 * by lib/subscriptions/service.ts.
 */
export async function dbGetSubscriptionById(id: string) {
	const supabase = await createClient()
	return supabase.from("subscriptions").select("*").eq('id', id).single()
}

export async function dbGetSubscriptionsByUserId(userId: string) {
	const supabase = await createClient()
	return supabase.from("subscriptions").select("*").eq('user_id', userId)
}

export async function dbCreateNewSubscription(orderData: TablesInsert<'subscriptions'>) {
	const supabase = await createClient()
	return supabase
		.from('subscriptions')
		.insert([orderData])
		.select()
		.single()
}


export async function dbUpdateSubscription(id: string, data: TablesUpdate<'subscriptions'>) {
	const supabase = await createClient()
	return supabase
		.from('subscriptions')
		.update(data)
		.eq('id', id)
		.select()
		.single()
}

export async function dbDeleteSubscription(id: string) {
	const supabase = await createClient()
	return supabase
		.from('subscriptions')
		.delete()
		.eq('id', id)
}
