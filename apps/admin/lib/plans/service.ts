import {
	dbGetAllPlans,
	dbGetPlanById,
	dbCreatePlan,
	dbUpdatePlan,
	dbDeletePlan,
} from './repository'
import type { CreatePlanInput, UpdatePlanInput } from '@repo/validations'


export type ServiceResult<T> =
	| { success: true; data: T }
	| { success: false; error: string }

export async function getAllPlans() {
	const { data, error } = await dbGetAllPlans()
	if (error) return { success: false as const, error: error.message }
	return { success: true as const, data: data ?? [] }
}

export async function getPlanById(id: string) {
	const { data, error } = await dbGetPlanById(id)
	if (error) return { success: false as const, error: error.message }
	return { success: true as const, data }
}

export async function createPlan(input: CreatePlanInput) {
	const { data, error } = await dbCreatePlan({
		name: input.name,
		amount: Math.round(input.amount * 100),
		interval: input.interval,
		razorpay_plan_id: input.razorpay_plan_id ?? null,
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
