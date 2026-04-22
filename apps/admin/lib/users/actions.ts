'use server'

import { revalidatePath } from 'next/cache'
import { updateUser } from './service'

/**
 * Users Server Actions
 *
 * Entry point for user mutations from client components.
 * Currently exposes one action: toggling a user's active status.
 * Revalidates both the dashboard list and the individual user page.
 */

export type UserActionResult =
	| { success: true }
	| { success: false; error: string }

export async function toggleUserActiveAction(
	userId: string,
	isActive: boolean
): Promise<UserActionResult> {
	if (!userId) return { success: false, error: 'User ID is required' }

	const result = await updateUser(userId, { is_active: isActive })
	if (!result.success) return { success: false, error: result.error }

	revalidatePath('/dashboard')
	revalidatePath(`/dashboard/users/${userId}`)
	return { success: true }
}
