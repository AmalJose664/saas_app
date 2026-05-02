import { dbGetSubscriptions, dbGetSubscriptionByUserId } from './repository'
import type { Tables } from '@workspace/database'

/**
 * Subscriptions Service
 *
 * Business logic for subscriptions. Subscriptions are read-only from
 * the admin — status changes are handled by Razorpay webhooks, not
 * manual admin actions.
 */

// ─── Domain types ─────────────────────────────────────────────────────────────

/** A subscription row joined with profile and plan */
export type SubscriptionWithRelations = Tables<'subscriptions'> & {
	profiles: Pick<Tables<'profiles'>, 'full_name' | 'email'> | null
	plan: Pick<Tables<'plan'>, 'name' | 'amount' | 'interval'> | null
}

/** A subscription row joined with plan only (used on user detail page) */
export type SubscriptionWithPlan = Tables<'subscriptions'> & {
	plan: Pick<Tables<'plan'>, 'name' | 'amount' | 'interval'> | null
}

/** Return type of getAllSubscriptions */
export type GetAllSubscriptionsResult =
	| { success: true; data: SubscriptionWithRelations[] }
	| { success: false; error: string }

/** Return type of getSubscriptionByUserId */
export type GetSubscriptionByUserIdResult =
	| { success: true; data: SubscriptionWithPlan | null }
	| { success: false; error: string }

export async function getAllSubscriptions(): Promise<GetAllSubscriptionsResult> {
	const { data, error } = await dbGetSubscriptions()
	if (error) return { success: false as const, error: error.message }
	return { success: true as const, data: data ?? [] }
}

export async function getSubscriptionByUserId(userId: string): Promise<GetSubscriptionByUserIdResult> {
	const { data, error } = await dbGetSubscriptionByUserId(userId)
	if (error) return { success: false as const, error: error.message }
	return { success: true as const, data }
}
