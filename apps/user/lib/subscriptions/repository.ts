import { createClient } from '@myapp/supabase/server'
import { supabaseAdmin } from '@myapp/supabase/admin'
import type { TablesInsert, TablesUpdate } from '@repo/database'

/**
 * Subscriptions Repository
 *
 * Raw Supabase access for the `subscriptions` table.
 * Two client variants:
 *
 * - createClient (session-based) — for Server Components and Server Actions
 *   where a user session is available (e.g. reading a user's own subscriptions)
 *
 * - supabaseAdmin (service role) — for webhook handlers where no user session
 *   exists. Functions suffixed with Admin use this client.
 *
 * Called only by lib/subscriptions/service.ts.
 */

// ─── Session-based (Server Components / Server Actions) ───────────────────────

export async function dbGetSubscriptionById(id: string) {
	const supabase = await createClient()
	return supabase
		.from('subscriptions')
		.select('*')
		.eq('id', id)
		.single()
}

export async function dbGetSubscriptionsByUserId(userId: string) {
	const supabase = await createClient()
	return supabase
		.from('subscriptions')
		.select('*, plan(*)')
		.eq('user_id', userId)
		.order('created_at', { ascending: false })
}

/**
 * Get the user's current active subscription.
 * Returns the most recent subscription with status 'active'.
 * Includes the plan details via join.
 */
export async function dbGetCurrentSubscription(userId: string, withPlan: boolean = true) {
	const supabase = await createClient()
	const selectText = withPlan ? '*, plan(*)' : "*"
	return supabase
		.from('subscriptions')
		.select(selectText)
		.eq('user_id', userId)
		.eq('status', 'active')
		.order('created_at', { ascending: false })
		.limit(1)
		.maybeSingle()
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

// ─── Admin / service-role (Webhook handlers) ──────────────────────────────────


/**
 * Create a subscription by its Razorpay subscription ID.
 * Used in new subscription calls
 */
export async function dbCreateNewSubscription(data: TablesInsert<'subscriptions'>) {
	return supabaseAdmin
		.from('subscriptions')
		.insert([data])
		.select()
		.single()
}

/**
 * Look up a subscription by its Razorpay subscription ID.
 * Used in webhooks where only the Razorpay ID is available.
 */
export async function dbGetSubscriptionByRazorpayId(razorpaySubscriptionId: string) {
	return supabaseAdmin
		.from('subscriptions')
		.select('*')
		.eq('razorpay_subscription_id', razorpaySubscriptionId)
		.single()
}

/**
 * Update a subscription by its Razorpay subscription ID.
 * Used in webhooks — no user session available.
 */
export async function dbUpdateSubscriptionByRazorpayId(
	razorpaySubscriptionId: string,
	data: TablesUpdate<'subscriptions'>
) {
	return supabaseAdmin
		.from('subscriptions')
		.update(data)
		.eq('razorpay_subscription_id', razorpaySubscriptionId)
		.select()
		.single()
}
/**
 * Update a subscription by its Razorpay subscription ID.
 * Used in webhooks — no user session available.
 */
export async function dbUpdateSubscriptionViaAdmin(id: string, data: TablesUpdate<'subscriptions'>) {
	return supabaseAdmin
		.from('subscriptions')
		.update(data)
		.eq('id', id)
		.select()
		.single()
}