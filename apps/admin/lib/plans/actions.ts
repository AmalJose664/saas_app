'use server'

import { revalidatePath } from 'next/cache'
import { createPlanSchema, updatePlanSchema } from '@workspace/validations'
import { createPlan, updatePlan, deletePlan } from './service'

/**
 * Plans Server Actions
 *
 * The only entry point for plan mutations from client components.
 * Each action: validates FormData with Zod → calls service → revalidates cache.
 *
 * Used with useActionState() in form components.
 * ActionResult is returned to the client to show field-level errors.
 */

export type ActionResult =
	| { success: true }
	| { success: false; error: string; fieldErrors?: Record<string, string> }

// ─── Create ──────────────────────────────────────────────────────────────────

export async function createPlanAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
	const raw = {
		name: formData.get('name') as string,
		amount: parseFloat(formData.get('amount') as string),
		interval: formData.get('interval') as string,
		razorpay_plan_id: (formData.get('razorpay_plan_id') as string) || null,
		is_active: formData.get('is_active') === 'true' || formData.get('is_active') === 'on',
		features: formData.getAll('features[]')
	}
	const parsed = createPlanSchema.safeParse(raw)
	if (!parsed.success) {
		const fieldErrors: Record<string, string> = {}
		parsed.error.issues.forEach((e) => {
			fieldErrors[e.path[0] as string] = e.message
		})
		return { success: false, error: 'Validation failed', fieldErrors }
	}

	const result = await createPlan(parsed.data)
	if (!result.success) return { success: false, error: result.error }

	revalidatePath('/dashboard/plans')
	return { success: true as const }
}

// ─── Update ──────────────────────────────────────────────────────────────────

export async function updatePlanAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
	const raw = {
		id: formData.get('id') as string,
		name: formData.get('name') as string,
		amount: parseFloat(formData.get('amount') as string),
		interval: formData.get('interval') as string,
		razorpay_plan_id: (formData.get('razorpay_plan_id') as string) || null,
		is_active: formData.get('is_active') === 'true' || formData.get('is_active') === 'on',
		features: formData.getAll('features[]')
	}
	console.log(formData.get('is_active'), "is active", formData.get('is_active') === 'true')
	const parsed = updatePlanSchema.safeParse(raw)
	if (!parsed.success) {
		const fieldErrors: Record<string, string> = {}
		parsed.error.issues.forEach((e) => {
			fieldErrors[e.path[0] as string] = e.message
		})
		return { success: false, error: 'Validation failed', fieldErrors }
	}

	const result = await updatePlan(parsed.data)
	if (!result.success) return { success: false, error: result.error }

	revalidatePath('/dashboard/plans')
	return { success: true as const }
}

// ─── Delete ──────────────────────────────────────────────────────────────────

export async function deletePlanAction(planId: string): Promise<ActionResult> {
	if (!planId) return { success: false, error: 'Plan ID is required' }

	const result = await deletePlan(planId)
	if (!result.success) return { success: false, error: result.error }

	revalidatePath('/dashboard/plans')
	return { success: true }
}
