import { getUsersCount } from '../users/service'
import { getOrdersCount, getFormattedRevenue } from '../orders/service'

/**
 * Service — aggregates stats for the dashboard overview.
 * Runs all queries in parallel for performance.
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
