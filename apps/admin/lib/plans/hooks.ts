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

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getAllPlans, getPlanById } from './service';
import { createPlanAction, updatePlanAction, deletePlanAction } from './actions';

/** Query key factory for plans queries */
export const plansKeys = {
	all: ['plans'] as const,
	list: () => [...plansKeys.all, 'list'] as const,
	detail: (id: string) => [...plansKeys.all, 'detail', id] as const,
};

/**
 * usePlans — cached subscription plans list.
 *
 * Data refetches in background when admin returns to the tab,
 * ensuring the list stays current across multiple admin sessions.
 */
export function usePlans() {
	return useQuery({
		queryKey: plansKeys.list(),
		queryFn: async () => {
			const result = await getAllPlans();
			if (!result.success) throw new Error(result.error);
			return result.data;
		},
	});
}

/**
 * usePlan — single plan detail with cache pre-population.
 *
 * @param id — Supabase plan UUID
 */
export function usePlan(id: string) {
	return useQuery({
		queryKey: plansKeys.detail(id),
		queryFn: async () => {
			const result = await getPlanById(id);
			if (!result.success) throw new Error(result.error);
			return result.data;
		},
		enabled: !!id,
	});
}

/**
 * useCreatePlan — mutation that auto-invalidates the plans list.
 *
 * On success: invalidates plans list cache → UI refreshes automatically.
 * On error: shows toast with server error message.
 */
export function useCreatePlan() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (formData: FormData) => {
			const result = await createPlanAction(formData);
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
			const result = await updatePlanAction(formData);
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
