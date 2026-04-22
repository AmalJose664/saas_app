import { getUsersCount } from '../users/service'
import { getOrdersCount, getFormattedRevenue } from '../orders/service'

/**
 * Dashboard Service
 *
 * Aggregates stats from users, orders, and revenue for the overview page.
 * All three queries run in parallel via Promise.all — do not await them
 * sequentially or you'll add unnecessary latency to the dashboard load.
 */

export interface DashboardStats {
	userCount: number
	orderCount: number
	formattedRevenue: string
}

export async function getDashboardStats(): Promise<
	{ success: true; data: DashboardStats } | { success: false; error: string }
> {
	const [users, orders, revenue] = await Promise.all([
		getUsersCount(),
		getOrdersCount(),
		getFormattedRevenue(),
	])

	if (!users.success) return { success: false, error: users.error }
	if (!orders.success) return { success: false, error: orders.error }
	if (!revenue.success) return { success: false, error: revenue.error }

	return {
		success: true,
		data: {
			userCount: users.count,
			orderCount: orders.count,
			formattedRevenue: revenue.formatted,
		},
	}
}
