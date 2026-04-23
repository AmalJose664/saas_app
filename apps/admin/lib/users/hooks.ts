/**
 * Users client-side hooks
 *
 * These hooks handle mutations only. Reads (list, detail) are done
 * server-side in Server Components — do not import service or repository
 * functions here, as they depend on next/headers and cannot run in the browser.
 *
 * Flow: hook → server action → service → repository → Supabase
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { toggleUserActiveAction } from './actions';

/** Query key factory — used to invalidate caches after mutations */
export const usersKeys = {
	all: ['users'] as const,
	list: (search: string, page: number) => [...usersKeys.all, 'list', search, page] as const,
	detail: (id: string) => [...usersKeys.all, 'detail', id] as const,
	count: () => [...usersKeys.all, 'count'] as const,
};

/**
 * useToggleUserActive — mutation with cache invalidation.
 *
 * On success: invalidates the specific user detail + the users list,
 * so the UI reflects the change without manual refresh.
 */
export function useToggleUserActive() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: { id: string; isActive: boolean }) => {
			const { id, isActive } = data;
			const result = await toggleUserActiveAction(id, isActive);
			if (!result.success) throw new Error(result.error ?? 'Unknown error');
			return result;
		},
		onSuccess: (_data, variables) => {
			const { id } = variables;
			toast.success('User status updated');
			queryClient.invalidateQueries({ queryKey: usersKeys.detail(id) });
			queryClient.invalidateQueries({ queryKey: usersKeys.all });
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to toggle user status');
		},
	});
}
