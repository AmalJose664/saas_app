import type { CreateSubscriptionInput } from '@repo/validations'
import type { Tables } from '@repo/database'
import { dbCreateNewSubscription, dbDeleteSubscription, dbGetSubscriptionById, dbGetSubscriptionsByUserId } from './repository';

/**
 * Orders Service
 *
 * Business logic for subscription orders. Responsibilities:
 * - Creating new orders, updating, deleting
 * - Wrapping all results in { success, data } | { success, error }
 *
 * Called by lib/orders/actions.ts (mutations) and Server Components (reads).
 */

// ─── Domain types ─────────────────────────────────────────────────────────────

/** A single subscription plan row as returned from the DB */
export type Subscriptions = Tables<'subscriptions'>

/** Generic service result wrapper used across all services */
export type ServiceResult<T> =
	| { success: true; data: T }
	| { success: false; error: string }

/** Return type of getAllPlans */
export type GetAllSubscriptionsResult = ServiceResult<Subscriptions[]>

/** Return type of getPlanById */
export type GetSubscriptionByIdResult = ServiceResult<Subscriptions | null>
export type GetMultipleSubscriptionsResult = ServiceResult<Subscriptions[] | null>



export async function getSubscriptionById(id: string): Promise<GetSubscriptionByIdResult> {
	const { data, error } = await dbGetSubscriptionById(id)
	if (error) return { success: false as const, error: error.message }
	return { success: true as const, data }
}


export async function getSubscriptionsByUserId(userId: string): Promise<GetMultipleSubscriptionsResult> {
	const { data, error } = await dbGetSubscriptionsByUserId(userId)
	if (error) return { success: false as const, error: error.message }
	return { success: true as const, data }
}


export async function createNewSubscription(input: CreateSubscriptionInput) {
	const { data, error } = await dbCreateNewSubscription({
		plan_id: input.plan_id,
		user_id: input.user_id,
		razorpay_subscription_id: input.razorpay_subscription_id,
		current_period_end: input.current_period_end?.toISOString(),
		current_period_start: input.current_period_start?.toISOString(),
	})
	if (error) return { success: false as const, error: error.message }
	return { success: true as const, data }
}

// export async function updateSubscription(input: UpdatePlanInput) {
// 	const { id, ...fields } = input
// 	const { data, error } = await dbUpdateSubscription(id, {
// 		...(fields.name !== undefined && { name: fields.name }),
// 		...(fields.amount !== undefined && { amount: Math.round(fields.amount * 100) }),
// 		...(fields.interval !== undefined && { interval: fields.interval }),
// 		...(fields.razorpay_plan_id !== undefined && { razorpay_plan_id: fields.razorpay_plan_id ?? null }),
// 		...(fields.is_active !== undefined && { is_active: fields.is_active }),
// 	})
// 	if (error) return { success: false as const, error: error.message }
// 	return { success: true as const, data }
// }

export async function deleteSubscription(id: string) {
	const { error } = await dbDeleteSubscription(id)
	if (error) return { success: false as const, error: error.message }
	return { success: true as const }
}
