'use server'

import { createClient } from '@myapp/supabase/server'
import { updateProfileSchema } from '@repo/validations'

interface UpdateProfileInput {
	userId: string
	fullName: string
	avatarUrl: string
}

export async function updateProfile({ userId, fullName, avatarUrl }: UpdateProfileInput) {
	const parsed = updateProfileSchema.safeParse({
		full_name: fullName,
		avatar_url: avatarUrl || null,
	})

	if (!parsed.success) {
		const firstError = parsed.error.issues[0]
		return { error: firstError.message }
	}

	const supabase = await createClient()

	const { error } = await supabase
		.from('profiles')
		.update({
			full_name: parsed.data.full_name,
			avatar_url: parsed.data.avatar_url ?? null,
			updated_at: new Date().toISOString(),
		})
		.eq('id', userId)

	if (error) {
		return { error: error.message }
	}

	return { success: true }
}
