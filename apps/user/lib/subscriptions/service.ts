import type { Tables, TablesUpdate } from '@repo/database'
import type { CreateSubscriptionInput } from '@repo/validations'
import {
	dbGetSubscriptionById,
	dbGetSubscriptionsByUserId,
	dbGetCurrentSubscription,
	dbCreateNewSubscription,
	dbUpdateSubscription,
	dbDeleteSubscription,
	dbGetSubscriptionByRazorpayId,
	dbUpdateSubscriptionByRazorpayId,
	dbUpdateSubscriptionViaAdmin,
} from './repository'

/**
 * Subscriptions Service
 *
 * Business logic for subscription lifecycle. Responsibilities:
 * - Wrapping all results in { success, data } | { success, error }
 * - Exposing both session-based functions (for Server Components / Actions)
 *   and admin functions (for webhook handlers)
 *
 * Called by:
 *   - lib/subscriptions/actions.ts (create on user click)
 *   - app/api/razorpay/webhook/route.ts (status updates from Razorpay events)
 *   - Server Components (reading user's subscription history)
 */

// ─── Domain types ─────────────────────────────────────────────────────────────

export type Subscription = Tables<'subscriptions'>
export type Plan = Tables<'plan'>

/** Subscription with plan details joined */
export type SubscriptionWithPlan = Subscription & {
	plan: Plan
}

export type ServiceResult<T> =
	| { success: true; data: T }
	| { success: false; error: string }

export type GetSubscriptionResult = ServiceResult<Subscription | null>
export type GetSubscriptionsResult = ServiceResult<SubscriptionWithPlan[]>
export type GetSubscriptionWithPlanResult = ServiceResult<SubscriptionWithPlan | null>

// ─── Reads (session-based) ────────────────────────────────────────────────────

export async function getSubscriptionById(id: string): Promise<GetSubscriptionResult> {
	const { data, error } = await dbGetSubscriptionById(id)
	if (error) return { success: false, error: error.message }
	return { success: true, data }
}

export async function getSubscriptionsByUserId(userId: string): Promise<GetSubscriptionsResult> {
	const { data, error } = await dbGetSubscriptionsByUserId(userId)
	if (error) return { success: false, error: error.message }
	return { success: true, data: (data ?? []) as SubscriptionWithPlan[] }
}

/**
 * getCurrentSubscription — fetches the user's current active subscription.
 *
 * Returns the most recent subscription with status 'active'.
 *
 *
 * @param userId - The user's ID
 * @returns ServiceResult with subscription + plan data, or null if no active subscription
 */
export async function getCurrentSubscription(userId: string, withPlan?: boolean): Promise<GetSubscriptionWithPlanResult> {
	const { data, error } = await dbGetCurrentSubscription(userId, withPlan)
	if (error) return { success: false, error: error.message }
	return { success: true, data: data as SubscriptionWithPlan | null }
}

// ─── Writes (session-based) ───────────────────────────────────────────────────


export async function updateSubscription(
	id: string,
	data: TablesUpdate<'subscriptions'>
): Promise<GetSubscriptionResult> {
	const { data: updated, error } = await dbUpdateSubscription(id, data)
	if (error) return { success: false, error: error.message }
	return { success: true, data: updated }
}

export async function deleteSubscription(id: string): Promise<ServiceResult<null>> {
	const { error } = await dbDeleteSubscription(id)
	if (error) return { success: false, error: error.message }
	return { success: true, data: null }
}




// ─── Webhook helpers (admin / service-role) ───────────────────────────────────


/**
 * createNewSubscription — creates a new subscription using admin permission to bypass rls.
 * Called after calling @function razorpay.subscriptions.create()
 */
export async function createNewSubscription(input: CreateSubscriptionInput): Promise<GetSubscriptionResult> {
	const { data, error } = await dbCreateNewSubscription({
		plan_id: input.plan_id,
		user_id: input.user_id,
		status: input.status ?? 'pending',
		razorpay_subscription_id: input.razorpay_subscription_id ?? null,
		current_period_start: input.current_period_start?.toISOString() ?? null,
		current_period_end: input.current_period_end?.toISOString() ?? null,
		cancel_at_period_end: input.cancel_at_period_end ?? false,
	})
	if (error) return { success: false, error: error.message }
	return { success: true, data }
}

/**
 * getSubscriptionByRazorpayId — looks up a subscription using the Razorpay
 * subscription ID (sub_xxx). Used in webhook handlers where only the
 * Razorpay ID is available in the event payload.
 */
export async function getSubscriptionByRazorpayId(razorpaySubscriptionId: string): Promise<GetSubscriptionResult> {
	const { data, error } = await dbGetSubscriptionByRazorpayId(razorpaySubscriptionId)
	if (error) return { success: false, error: error.message }
	return { success: true, data }
}

/**
 * updateSubscriptionByRazorpayId — updates a subscription record using the
 * Razorpay subscription ID. Used in webhook handlers to avoid a separate
 * lookup + update round trip.
 */
export async function updateSubscriptionByRazorpayId(
	razorpaySubscriptionId: string,
	data: TablesUpdate<'subscriptions'>
): Promise<GetSubscriptionResult> {
	const { data: updated, error } = await dbUpdateSubscriptionByRazorpayId(razorpaySubscriptionId, data)
	if (error) return { success: false, error: error.message }
	return { success: true, data: updated }
}

/**
 * updateSubscriptionByIdAdmin — updates a subscription record using the
 * subscription ID. Used in webhook handlers to update with admin permissions to bypass rls.
 */
export async function updateSubscriptionByIdAdmin(
	subscriptionId: string,
	data: TablesUpdate<'subscriptions'>
): Promise<GetSubscriptionResult> {
	const { data: updated, error } = await dbUpdateSubscriptionViaAdmin(subscriptionId, data)
	if (error) return { success: false, error: error.message }
	return { success: true, data: updated }
}
