import { supabaseAdmin } from '@myapp/supabase/admin'
import type { TablesInsert } from '@repo/database'

/**
 * Payments Repository
 *
 * Raw Supabase access for the `payments` table.
 * Uses supabaseAdmin (service role) because payments are written exclusively
 * from webhook handlers which have no user session.
 *
 * Called only by lib/payments/service.ts.
 */

// ─── Reads ────────────────────────────────────────────────────────────────────

export async function dbGetPaymentById(id: string) {
	return supabaseAdmin
		.from('payments')
		.select('*')
		.eq('id', id)
		.single()
}

export async function dbGetPaymentByRazorpayId(razorpayPaymentId: string) {
	return supabaseAdmin
		.from('payments')
		.select('*')
		.eq('razorpay_payment_id', razorpayPaymentId)
		.single()
}

/**
 * Get all payments for a subscription (internal UUID).
 * Returns payments ordered by most recent first.
 */
export async function dbGetPaymentsBySubscriptionId(subscriptionId: string) {
	return supabaseAdmin
		.from('payments')
		.select('*')
		.eq('subscription_id', subscriptionId)
		.order('created_at', { ascending: false })
}

/**
 * Get all payments for a user by joining through subscriptions.
 * Returns payments with their linked subscription data.
 */
export async function dbGetPaymentsByUserId(userId: string) {
	return supabaseAdmin
		.from('payments')
		.select('*, subscriptions!inner(user_id, plan_id, razorpay_subscription_id)')
		.eq('subscriptions.user_id', userId)
		.order('created_at', { ascending: false })
}

// ─── Writes ───────────────────────────────────────────────────────────────────

export async function dbCreatePayment(data: TablesInsert<'payments'>) {
	return supabaseAdmin
		.from('payments')
		.insert([data])
		.select()
		.single()
}
