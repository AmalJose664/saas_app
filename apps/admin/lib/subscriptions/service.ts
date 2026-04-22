import { dbGetSubscriptions, dbGetSubscriptionByUserId } from './repository'

/**
 * Service — business logic for subscriptions.
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
