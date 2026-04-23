'use client'

/**
 * User app — client-side hooks
 *
 * Mutations only. Reads are handled server-side in Server Components.
 * Never import from service.ts or repository.ts here.
 *
 * Flow: hook → server action → service → repository → Supabase
 */

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { updateProfile } from './actions'
import type { UpdateProfileInput } from './actions'

/**
 * useUpdateProfile — mutation for updating the user's profile.
 *
 * On success: shows a toast and navigates back to /profile.
 * On error: shows the server error message as a toast.
 */
export function useUpdateProfile() {
	const router = useRouter()

	return useMutation({
		mutationFn: async (data: UpdateProfileInput) => {
			const result = await updateProfile(data)
			if (!result.success) throw new Error(result.error)
			return result
		},
		onSuccess: () => {
			toast.success('Profile updated successfully')
			router.push('/profile')
			router.refresh()
		},
		onError: (error: Error) => {
			toast.error(error.message || 'Failed to update profile')
		},
	})
}
