import { z } from 'zod'

/**
 * Profile validation schemas
 *
 * avatar_url accepts a valid URL or an empty string.
 * Empty string is allowed so users can clear their avatar — null/undefined
 * means "not provided", '' means "explicitly removed".
 */

export const updateProfileSchema = z.object({
	full_name: z
		.string()
		.min(1, 'Full name is required')
		.max(100, 'Full name must be 100 characters or less')
		.trim(),

	avatar_url: z
		.string()
		.url('Please enter a valid URL')
		.max(500, 'URL is too long')
		.or(z.literal(''))   // allow empty string to clear the avatar
		.nullable()
		.optional(),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
