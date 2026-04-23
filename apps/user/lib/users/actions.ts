'use server'

import { revalidatePath } from 'next/cache'
import { updateProfileSchema } from '@repo/validations'
import { updateUser } from './service'

export interface UpdateProfileInput {
	userId: string
	fullName: string
	avatarUrl: string
}

export type ProfileActionResult =
	| { success: true }
	| { success: false; error: string }

export async function updateProfile({
	userId,
	fullName,
	avatarUrl,
}: UpdateProfileInput): Promise<ProfileActionResult> {
	const parsed = updateProfileSchema.safeParse({
		full_name: fullName,
		avatar_url: avatarUrl || null,
	})

	if (!parsed.success) {
		return { success: false, error: parsed.error.issues[0]?.message ?? 'Validation failed' }
	}

	const result = await updateUser(userId, {
		full_name: parsed.data.full_name,
		avatar_url: parsed.data.avatar_url ?? null,
	})

	if (!result.success) return { success: false, error: result.error }

	// Only revalidate after a confirmed successful update
	revalidatePath('/profile')
	return { success: true }
}
