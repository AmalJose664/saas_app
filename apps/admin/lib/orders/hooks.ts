/**
 * @file lib/orders/hooks.ts
 * @description TanStack Query hooks for order data.
 *
 * Architecture:
 * useOrders (React Query hook)
 *   ↓ call
 * Orders Service → Orders Repository → Supabase
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { getOrders } from './service';

/** Query key factory for orders queries */
export const ordersKeys = {
	all: ['orders'] as const,
	list: () => [...ordersKeys.all, 'list'] as const,
	byUser: (userId: string) => [...ordersKeys.all, 'byUser', userId] as const,
};

/**
 * useOrders — cached order list with optional user filter.
 *
 * @param userId — optional filter to show only a specific user's orders
 */
export function useOrders(userId?: string) {
	return useQuery({
		queryKey: userId ? ordersKeys.byUser(userId) : ordersKeys.list(),
		queryFn: async () => {
			const result = await getOrders({ userId });
			if (!result.success) throw new Error(result.error);
			return result.data;
		},
	});
}
