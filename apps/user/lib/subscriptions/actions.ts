'use server'

import { createClient } from '@myapp/supabase/server'
import { getRazorpay } from '@myapp/razorpay'
import { getPlanById } from '../plans/service'
import { createNewSubscription } from './service'

/**
 * Subscription Server Actions
 *
 * Handles the full subscription creation flow:
 * 1. Fetch plan from DB → validate it has a Razorpay plan ID
 * 2. Get authenticated user
 * 3. Create a Razorpay subscription → get back short_url for hosted checkout
 * 4. Save a pending subscription record to DB
 * 5. Return the Razorpay checkout URL to the client
 *
 * The subscription starts as 'pending' in the DB.
 * A webhook (to be wired up) will update it to 'active' once payment completes.
 */
export type SubscribeResult =
	| { success: true; checkoutUrl: string }
	| { success: false; error: string }

export async function createSubscriptionAction(planId: string): Promise<SubscribeResult> {
	// ── 1. Auth ───────────────────────────────────────────────────────────────
	const supabase = await createClient()
	const { data: { user }, error: authError } = await supabase.auth.getUser()

	if (authError || !user) {
		return { success: false, error: 'You must be logged in to subscribe' }
	}

	// ── 2. Fetch plan ─────────────────────────────────────────────────────────
	const planResult = await getPlanById(planId)
	if (!planResult.success || !planResult.data) {
		return { success: false, error: 'Plan not found' }
	}

	const plan = planResult.data

	if (!plan.razorpay_plan_id) {
		return { success: false, error: 'This plan is not available for purchase yet' }
	}

	if (!plan.is_active) {
		return { success: false, error: 'This plan is no longer active' }
	}

	// ── 3. Create Razorpay subscription ───────────────────────────────────────
	const razorpay = getRazorpay()
	let rzpSubscription
	try {
		rzpSubscription = await razorpay.subscriptions.create({
			plan_id: plan.razorpay_plan_id,
			total_count: 12,
			quantity: 1,
			customer_notify: 1,
		})
	} catch (err: any) {
		const message = err?.error?.description ?? err?.message ?? 'Failed to create subscription with Razorpay'
		return { success: false, error: message }
	}

	// if (!rzpSubscription.short_url) {
	// 	return { success: false, error: 'Razorpay did not return a checkout URL' }
	// }

	// ── 4. Save pending subscription to DB ────────────────────────────────────
	const dbResult = await createNewSubscription({
		user_id: user.id,
		plan_id: plan.id,
		razorpay_subscription_id: rzpSubscription.id,
		status: 'created',
		cancel_at_period_end: false,
	})

	if (!dbResult.success) {
		// Razorpay subscription was created but DB write failed.
		// Log it — a webhook will attempt to reconcile later.
		console.error(
			'[subscriptions] DB write failed after Razorpay subscription created:',
			{ razorpay_subscription_id: rzpSubscription.id, error: dbResult.error }
		)
		// Still return the checkout URL so the user can complete payment.
		// The webhook will create/update the DB record on payment success.
	}

	// ── 5. Return checkout URL ────────────────────────────────────────────────
	return { success: true, checkoutUrl: rzpSubscription.short_url }
}
