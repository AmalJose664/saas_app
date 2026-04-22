'use server'

import { revalidatePath } from 'next/cache'
import { updateUser } from './service'

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
