import { z } from 'zod'

/**
 * Auth validation schemas
 *
 * loginSchema  — email + password (no strength rules, just presence)
 * signupSchema — email + full name + password with strength requirements
 */

export const loginSchema = z.object({
	email: z
		.string()
		.min(1, 'Email is required')
		.email('Please enter a valid email address'),

	password: z
		.string()
		.min(1, 'Password is required'),
})

export const signupSchema = z.object({
	email: z
		.string()
		.min(1, 'Email is required')
		.email('Please enter a valid email address'),

	full_name: z
		.string()
		.min(1, 'Full name is required')
		.max(100, 'Full name must be 100 characters or less')
		.trim(),

	password: z
		.string()
		.min(8, 'Password must be at least 8 characters')
		.max(72, 'Password must be 72 characters or less')
		.regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
		.regex(/[0-9]/, 'Password must contain at least one number'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
