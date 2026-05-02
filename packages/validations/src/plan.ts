import { z } from 'zod'

/**
 * Plan validation schemas
 *
 * Amount rule: the UI accepts ₹ (e.g. 499). The service layer converts
 * to paise (×100) before writing to the DB. Schemas work in ₹.
 *
 * razorpay_plan_id is optional — only needed when linking to an existing
 * plan in the Razorpay dashboard.
 */

const PLAN_INTERVALS = ['daily', 'weekly', 'monthly', 'yearly'] as const

export const planSchema = z.object({
	name: z
		.string()
		.min(1, 'Plan name is required')
		.max(100, 'Plan name must be 100 characters or less'),

	// Amount is entered in ₹ (e.g. 499), stored as paise (49900)
	amount: z
		.number({ message: 'Amount must be a number' })
		.positive('Amount must be greater than 0')
		.max(1_000_000, 'Amount seems too large'),

	interval: z.enum(PLAN_INTERVALS, {
		message: 'Interval must be daily, weekly, monthly, or yearly',
	}),

	razorpay_plan_id: z
		.string()
		.max(100, 'Razorpay Plan ID is too long')
		.nullable()
		.optional(),

	is_active: z.boolean().default(true),
	features: z.string().array().optional()
})

export const createPlanSchema = planSchema

export const updatePlanSchema = planSchema.partial().extend({
	// id is required when updating
	id: z.string().uuid('Invalid plan ID'),
})

export type PlanFormValues = z.infer<typeof planSchema>
export type CreatePlanInput = z.infer<typeof createPlanSchema>
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>
