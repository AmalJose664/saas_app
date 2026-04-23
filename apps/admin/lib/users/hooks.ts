/**
 * @file lib/users/hooks.ts
 * @description TanStack Query hooks for user data and mutations.
 *
 * Architecture:
 * useUsers / useUser / useToggleUserActive (React Query hooks)
 *   ↓ call
 * Users Service → Users Repository → Supabase
 *
 * Features:
 * - Paginated user list with search parameter caching
 * - Automatic cache invalidation on toggle mutation
 * - Retry with exponential backoff on network failures
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getUsersPaginated, getUserById } from './service';
import { toggleUserActiveAction } from './actions';

/** Query key factory for users queries */
export const usersKeys = {
	all: ['users'] as const,
	list: (search: string, page: number) => [...usersKeys.all, 'list', search, page] as const,
	detail: (id: string) => [...usersKeys.all, 'detail', id] as const,
	count: () => [...usersKeys.all, 'count'] as const,
};

/**
 * useUsers — paginated user directory with caching.
 *
 * Cache is keyed by search string + page number. Changing search
 * immediately shows cached results if available, then fetches fresh data.
 *
 * @param search — email search query for ILIKE filter
 * @param page — 1-based page number (10 users per page)
 */
export function useUsers(search: string = '', page: number = 1) {
	return useQuery({
		queryKey: usersKeys.list(search, page),
		queryFn: async () => {
			const result = await getUsersPaginated({ search, page });
			if (!result.success) throw new Error(result.error);
			return result;
		},
		// Keep previous data while fetching new page (smooth pagination)
		placeholderData: (previousData) => previousData,
	});
}

/**
 * useUser — individual user profile with background refresh.
 *
 * Refetches in background when admin returns to tab, ensuring
 * subscription/order status is always current.
 *
 * @param id — Supabase user UUID
 */
export function useUser(id: string) {
	return useQuery({
		queryKey: usersKeys.detail(id),
		queryFn: async () => {
			const result = await getUserById(id);
			if (!result.success) throw new Error(result.error);
			return result.data;
		},
		enabled: !!id,
	});
}

/**
 * useToggleUserActive — mutation with cache invalidation.
 *
 * On success: invalidates the specific user detail + the users list,
 * so the UI reflects the change without manual refresh.
 * On error: shows toast with the server error message.
 *
 * @returns Mutation result with isPending, mutate, etc.
 */
export function useToggleUserActive() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const result = await toggleUserActiveAction(id);
			if (!result.success) throw new Error(result.error ?? 'Unknown error');
			return result;
		},
		onSuccess: (data, id) => {
			toast.success((data as { message?: string }).message ?? 'Status updated');
			// Invalidate this user's detail page
			queryClient.invalidateQueries({ queryKey: usersKeys.detail(id) });
			// Invalidate all user lists (conservative — ensures search results stay fresh)
			queryClient.invalidateQueries({ queryKey: usersKeys.all });
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to toggle user status');
		},
	});
}
