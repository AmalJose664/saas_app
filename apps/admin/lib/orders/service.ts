import { dbGetOrders, dbGetOrdersCount, dbGetOrdersRevenue } from './repository'
import type { Tables } from '@workspace/database'

/**
 * Orders Service
 *
 * Business logic for orders. Responsibilities:
 * - Converting paise → ₹ for display (amount_paise / 100)
 * - Aggregating total revenue across all orders
 * - Formatting revenue as a localised ₹ string (en-IN)
 *
 * Orders are read-only from the admin — no mutation actions exist here.
 */

// ─── Domain types ─────────────────────────────────────────────────────────────

/** An order row joined with the profile (full_name, email) */
export type OrderWithProfile = Tables<'orders'> & {
	user: Pick<Tables<'profiles'>, 'full_name' | 'email'> | null
}

/** Return type of getOrders */
export type GetOrdersResult =
	| { success: true; data: OrderWithProfile[] }
	| { success: false; error: string }

export async function getOrders(opts: { limit?: number; userId?: string } = {}): Promise<GetOrdersResult> {
	const { data, error } = await dbGetOrders(opts)
	if (error) return { success: false as const, error: error.message }
	return { success: true as const, data: data ?? [] }
}

export async function getOrdersCount() {
	const { count, error } = await dbGetOrdersCount()
	if (error) return { success: false as const, error: error.message }
	return { success: true as const, count: count ?? 0 }
}

export async function getTotalRevenuePaise() {
	const { data, error } = await dbGetOrdersRevenue()
	if (error) return { success: false as const, error: error.message }
	const total = data?.reduce((acc, row) => acc + (row.amount_paise ?? 0), 0) ?? 0
	return { success: true as const, totalPaise: total }
}

/** Returns revenue formatted as ₹ string */
export async function getFormattedRevenue() {
	const result = await getTotalRevenuePaise()
	if (!result.success) return { success: false as const, error: result.error }
	const formatted = `₹${(result.totalPaise / 100).toLocaleString('en-IN')}`
	return { success: true as const, formatted }
}
