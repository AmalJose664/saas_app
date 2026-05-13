'use server'

import { getRazorpay } from '@workspace/razorpay'
import { getPlanById } from '../plans/service'
import { createNewSubscription, getCurrentSubscription, getSubscriptionById, updateSubscriptionByIdAdmin, getSubscriptionsByUserId } from './service'
import { getAuthUser } from '../auth/server'

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
 * 
 * Also exposes wrappers (e.g. getCurrentSubscriptionAction) around service
 * functions to be used as `queryFn` within TanStack Query in Client Components.
 */
export type SubscribeResult =
	| { success: true; data: { checkoutUrl: string, subscriptionId: string, interval?: string } }
	| { success: false; error: string }

export async function createSubscriptionAction(planId: string): Promise<SubscribeResult> {
	// ── 1. Auth ───────────────────────────────────────────────────────────────
	const { user, error: authError } = await getAuthUser()

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
	let rzpSubscription = {
		short_url: "", id: ""
	}
	try {
		rzpSubscription = await razorpay.subscriptions.create({
			plan_id: plan.razorpay_plan_id,
			total_count: plan.duration_cycles,
			quantity: 1,
			customer_notify: 1,
		})
	} catch (err: any) {
		const message = err?.error?.description ?? err?.message ?? 'Failed to create subscription with Razorpay'
		return { success: false, error: message }
	}

	if (!rzpSubscription.short_url) {
		return { success: false, error: 'Razorpay did not return a checkout URL' }
	}

	// ── 4. Save pending subscription to DB ────────────────────────────────────
	const dbResult = await createNewSubscription({
		user_id: user.id,
		plan_id: plan.id,
		razorpay_subscription_id: rzpSubscription.id,
		status: 'created',
		cancel_at_period_end: false,
	})

	if (!dbResult.success) {
		console.error(
			'[subscriptions] DB write failed after Razorpay subscription created:',
			{ razorpay_subscription_id: rzpSubscription.id, error: dbResult.error }
		)
	}

	// ── 5. Return checkout URL ────────────────────────────────────────────────
	return {
		success: true, data: {
			checkoutUrl:
				rzpSubscription.short_url,
			subscriptionId: rzpSubscription.id,
			interval: plan.interval
		}
	}
}



export async function cancelSubscription(subscriptionId: string, cancelAtCycleEnd: boolean) {

	// ── 1. Auth ───────────────────────────────────────────────────────────────
	const { user, error: authError } = await getAuthUser()
	if (authError || !user) {
		return { success: false, error: 'You must be logged in to upgrade' }
	}
	const razorpay = getRazorpay()

	const subscription = await getSubscriptionById(subscriptionId)
	if (!subscription.success || !subscription.data) {
		return { success: false, error: 'No subscription found' }
	}

	const subscriptionData = subscription.data

	if (!subscriptionData.razorpay_subscription_id) {
		return { success: false, error: 'Current subscription has no Razorpay ID' }
	}

	let rzpSubscription
	try {
		rzpSubscription = await razorpay.subscriptions.cancel(
			subscriptionData.razorpay_subscription_id,
			cancelAtCycleEnd
		)

		if (cancelAtCycleEnd) {
			await updateSubscriptionByIdAdmin(subscriptionData.id, {
				cancel_at_period_end: cancelAtCycleEnd,
			})
		}

	} catch (err: any) {
		console.log(err)
		const message = err?.error?.description ?? err?.message ?? 'Failed to update subscription with Razorpay'
		return { success: false, error: message }
	}

	return { success: true }
}

export async function getCurrentSubscriptionAction(userId: string, withPlan?: boolean) {
	return getCurrentSubscription(userId, withPlan)
}

export async function getSubscriptionsByUserIdAction(userId: string) {
	return getSubscriptionsByUserId(userId)
}