/**
 * @file lib/dashboard/hooks.ts
 * @description TanStack Query hooks for dashboard data.
 *
 * Architecture:
 * useDashboardStats (React Query hook)
 *   ↓ calls
 * Dashboard Service (lib/dashboard/service.ts::getDashboardStats)
 *   ↓ calls
 * Dashboard Repository → Supabase
 *
 * Features:
 * - Auto-refreshes every 30 seconds for live dashboard metrics
 * - Automatic retry on network failures
 * - Background refetch on window focus
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from './service';

/** Query key factory for dashboard queries */
export const dashboardKeys = {
	all: ['dashboard'] as const,
	stats: () => [...dashboardKeys.all, 'stats'] as const,
};

/**
 * useDashboardStats — real-time dashboard metrics with auto-refresh.
 *
 * Refetches every 30s so admins see live numbers without manual refresh.
 * On window focus, data refreshes in background (non-blocking).
 *
 * @returns TanStack Query result { data, isLoading, error, isFetching }
 */
export function useDashboardStats() {
	return useQuery({
		queryKey: dashboardKeys.stats(),
		queryFn: async () => {
			const result = await getDashboardStats();
			if (!result.success) throw new Error(result.error);
			return result.data;
		},
		// Live dashboard feel — refresh every 30 seconds
		refetchInterval: 30_000,
		// Don't refetch if user is not viewing the tab (save bandwidth)
		refetchIntervalInBackground: false,
	});
}
