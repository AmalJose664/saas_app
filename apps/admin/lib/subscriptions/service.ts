import { dbGetSubscriptions, dbGetSubscriptionByUserId } from './repository'

/**
 * Subscriptions Service
 *
 * Business logic for subscriptions. Subscriptions are read-only from
 * the admin — status changes are handled by Razorpay webhooks, not
 * manual admin actions.
 */

export async function getAllSubscriptions() {
	const { data, error } = await dbGetSubscriptions()
	if (error) return { success: false as const, error: error.message }
	return { success: true as const, data: data ?? [] }
}

export async function getSubscriptionByUserId(userId: string) {
	const { data, error } = await dbGetSubscriptionByUserId(userId)
	if (error) return { success: false as const, error: error.message }
	return { success: true as const, data }
}
