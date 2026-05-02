import { dbGetAllPlans, dbGetPlanById } from './repository'
import type { Tables } from '@workspace/database'

/**
 * Plans Service (user app)
 *
 * Read-only access to subscription plans for the customer-facing app.
 * Plans are created and managed in the admin app — this service only reads.
 */

// ─── Domain types ─────────────────────────────────────────────────────────────

/** A single subscription plan row as returned from the DB */
export type Plan = Tables<'plan'>

/** Generic service result wrapper */
export type ServiceResult<T> =
	| { success: true; data: T }
	| { success: false; error: string }

/** Return type of getAllPlans */
export type GetAllPlansResult = ServiceResult<Plan[]>

/** Return type of getPlanById */
export type GetPlanByIdResult = ServiceResult<Plan | null>

// ─── Service functions ────────────────────────────────────────────────────────

export async function getAllPlans(): Promise<GetAllPlansResult> {
	const { data, error } = await dbGetAllPlans()
	if (error) return { success: false, error: error.message }
	return { success: true, data: data ?? [] }
}

export async function getPlanById(id: string): Promise<GetPlanByIdResult> {
	const { data, error } = await dbGetPlanById(id)
	if (error) return { success: false, error: error.message }
	return { success: true, data: data ?? null }
}
