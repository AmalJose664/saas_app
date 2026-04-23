/**
 * @file lib/subscriptions/hooks.ts
 * @description TanStack Query hooks for subscription data.
 *
 * Architecture:
 * useSubscriptions / useSubscriptionByUser (React Query hooks)
 *   ↓ call
 * Subscriptions Service → Subscriptions Repository → Supabase
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { getAllSubscriptions, getSubscriptionByUserId } from './service';

/** Query key factory for subscriptions queries */
export const subscriptionsKeys = {
	all: ['subscriptions'] as const,
	list: () => [...subscriptionsKeys.all, 'list'] as const,
	byUser: (userId: string) => [...subscriptionsKeys.all, 'byUser', userId] as const,
};

/**
 * useSubscriptions — all subscriptions with plan and subscriber details.
 *
 * Data refetches in background on window focus to keep subscription
 * statuses current (active, cancelled, past_due).
 */
export function useSubscriptions() {
	return useQuery({
		queryKey: subscriptionsKeys.list(),
		queryFn: async () => {
			const result = await getAllSubscriptions();
			if (!result.success) throw new Error(result.error);
			return result.data;
		},
	});
}

/**
 * useSubscriptionByUser — single user's subscription for profile pages.
 *
 * @param userId — Supabase user UUID
 */
export function useSubscriptionByUser(userId: string) {
	return useQuery({
		queryKey: subscriptionsKeys.byUser(userId),
		queryFn: async () => {
			const result = await getSubscriptionByUserId(userId);
			if (!result.success) throw new Error(result.error);
			return result.data;
		},
		enabled: !!userId,
	});
}
