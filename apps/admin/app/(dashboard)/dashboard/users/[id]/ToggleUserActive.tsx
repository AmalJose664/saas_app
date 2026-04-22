'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { toggleUserActiveAction } from '../../../../../lib/users/actions'

interface Props {
	userId: string
	isActive: boolean
}

export default function ToggleUserActive({ userId, isActive }: Props) {
	const [isPending, startTransition] = useTransition()

	const handleToggle = () => {
		startTransition(async () => {
			const result = await toggleUserActiveAction(userId, !isActive)
			if (!result.success) {
				toast.error(result.error)
			} else {
				toast.success(isActive ? 'User deactivated.' : 'User activated.')
			}
		})
	}

	return (
		<button
			onClick={handleToggle}
			disabled={isPending}
			className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 ${isActive
					? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
					: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
				}`}
		>
			{isPending ? 'Updating...' : isActive ? 'Deactivate User' : 'Activate User'}
		</button>
	)
}
