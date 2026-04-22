'use server'

import { createClient } from '@myapp/supabase/server'

interface UpdateProfileInput {
	userId: string
	fullName: string
	avatarUrl: string
}

export async function updateProfile({ userId, fullName, avatarUrl }: UpdateProfileInput) {
	const supabase = await createClient()

	const { error } = await supabase
		.from('Profiles')
		.update({
			id: userId,
			full_name: fullName,
			avatar_url: avatarUrl,
			updated_at: new Date().toISOString(),
		})
		.eq("id", userId)

	if (error) {
		return { error: error.message }
	}

	return { success: true }
}
