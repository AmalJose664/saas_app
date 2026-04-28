import {
	dbGetAllPlans,
	dbGetPlanById,
	dbCreatePlan,
	dbUpdatePlan,
	dbDeletePlan,
} from './repository'
import type { CreatePlanInput, UpdatePlanInput } from '@repo/validations'
import type { Tables } from '@repo/database'
import { getRazorpay } from '@myapp/razorpay'

/**
 * Plans Service
 *
 * Business logic for subscription plans. Responsibilities:
 * - Converting ₹ amounts to paise before writing to the DB (×100)
 * - Wrapping all results in { success, data } | { success, error }
 *
 * Called by lib/plans/actions.ts (mutations) and Server Components (reads).
 */

// ─── Domain types ─────────────────────────────────────────────────────────────

/** A single subscription plan row as returned from the DB */
export type Plan = Tables<'plan'>

/** Generic service result wrapper used across all services */
export type ServiceResult<T> =
	| { success: true; data: T }
	| { success: false; error: string }

/** Return type of getAllPlans */
export type GetAllPlansResult = ServiceResult<Plan[]>

/** Return type of getPlanById */
export type GetPlanByIdResult = ServiceResult<Plan | null>

export async function getAllPlans(): Promise<GetAllPlansResult> {
	const { data, error } = await dbGetAllPlans()
	if (error) return { success: false as const, error: error.message }
	return { success: true as const, data: data ?? [] }
}

export async function getPlanById(id: string): Promise<GetPlanByIdResult> {
	const { data, error } = await dbGetPlanById(id)
	if (error) return { success: false as const, error: error.message }
	return { success: true as const, data }
}

export async function createPlan(input: CreatePlanInput) {
	let razorpayPlanId: string | null = input.razorpay_plan_id ?? null

	const razorpay = getRazorpay()
	if (!razorpayPlanId) {
		try {
			const rzpPlan = await razorpay.plans.create({
				period: input.interval as 'daily' | 'weekly' | 'monthly' | 'yearly',
				interval: 1,
				item: {
					name: input.name,
					amount: Math.round(input.amount * 100), // ₹ → paise
					currency: 'INR',
				},
			})
			razorpayPlanId = rzpPlan.id
		} catch (err: any) {
			return {
				success: false as const,
				error: err?.error?.description ?? err?.message ?? 'Failed to create plan in Razorpay',
			}
		}
	}

	// Step 2 — Save to DB with the Razorpay plan ID.
	const { data, error } = await dbCreatePlan({
		name: input.name,
		amount: Math.round(input.amount * 100),
		interval: input.interval,
		razorpay_plan_id: razorpayPlanId,
		is_active: input.is_active ?? true,
	})
	if (error) return { success: false as const, error: error.message }
	return { success: true as const, data }
}

export async function updatePlan(input: UpdatePlanInput) {
	const { id, ...fields } = input
	const { data, error } = await dbUpdatePlan(id, {
		...(fields.name !== undefined && { name: fields.name }),
		...(fields.amount !== undefined && { amount: Math.round(fields.amount * 100) }),
		...(fields.interval !== undefined && { interval: fields.interval }),
		...(fields.razorpay_plan_id !== undefined && { razorpay_plan_id: fields.razorpay_plan_id ?? null }),
		...(fields.is_active !== undefined && { is_active: fields.is_active }),
	})
	if (error) return { success: false as const, error: error.message }
	return { success: true as const, data }
}

export async function deletePlan(id: string) {
	const { error } = await dbDeletePlan(id)
	if (error) return { success: false as const, error: error.message }
	return { success: true as const }
}
