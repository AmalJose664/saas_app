/**
 * @file lib/plans/hooks.ts
 * @description TanStack Query hooks for plan CRUD operations.
 *
 * Architecture:
 * usePlans / usePlan / useCreatePlan / useUpdatePlan / useDeletePlan
 *   ↓ call
 * Plans Service → Plans Repository → Supabase
 *
 * Features:
 * - Automatic cache invalidation on create/update/delete
 * - Optimistic UI-ready structure (can be extended)
 * - Background refetching on window focus
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { createPlanAction, updatePlanAction, deletePlanAction } from './actions';

/**
 * Plans client-side hooks
 *
 * These hooks handle mutations only. Reads (list, detail) are done
 * server-side in Server Components — do not import service or repository
 * functions here, as they depend on next/headers and cannot run in the browser.
 *
 * Flow: hook → server action → service → repository → Supabase
 */

/** Query key factory — used to invalidate caches after mutations */
export const plansKeys = {
	all: ['plans'] as const,
	list: () => [...plansKeys.all, 'list'] as const,
	detail: (id: string) => [...plansKeys.all, 'detail', id] as const,
};

/**
 * useCreatePlan — mutation that auto-invalidates the plans list on success.
 */
export function useCreatePlan() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (formData: FormData) => {
			const result = await createPlanAction({ success: true }, formData);
			if (!result.success) throw new Error(result.error);
			return result;
		},
		onSuccess: () => {
			toast.success('Plan created successfully');
			queryClient.invalidateQueries({ queryKey: plansKeys.list() });
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to create plan');
		},
	});
}

/**
 * useUpdatePlan — mutation that invalidates list + detail caches.
 *
 * Ensures both the plans grid and the edit page show fresh data
 * after an update, without manual refresh.
 */
export function useUpdatePlan() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (formData: FormData) => {
			const result = await updatePlanAction({ success: true }, formData);
			if (!result.success) throw new Error(result.error);
			return result;
		},
		onSuccess: (data) => {
			toast.success('Plan updated successfully');
			queryClient.invalidateQueries({ queryKey: plansKeys.list() });
			// Also invalidate the specific plan detail if id is in the response
			if (data && 'id' in data && typeof data.id === 'string') {
				queryClient.invalidateQueries({ queryKey: plansKeys.detail(data.id) });
			}
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to update plan');
		},
	});
}

/**
 * useDeletePlan — mutation with list cache invalidation.
 *
 * On success: removes deleted plan from the list cache automatically.
 */
export function useDeletePlan() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (id: string) => {
			const result = await deletePlanAction(id);
			if (!result.success) throw new Error(result.error);
			return result;
		},
		onSuccess: () => {
			toast.success('Plan deleted successfully');
			queryClient.invalidateQueries({ queryKey: plansKeys.list() });
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to delete plan');
		},
	});
}
