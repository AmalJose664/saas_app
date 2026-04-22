/**
 * @file ToggleUserActive.tsx
 * @description Client-side button component to toggle a user's active status.
 *
 * Architecture:
 * UI (this component)
 *   ↓ calls
 * Server Action (lib/users/actions.ts::toggleUserActiveAction)
 *   ↓ calls
 * Service (lib/users/service.ts::updateUser)
 *   ↓ calls
 * Repository (lib/users/repository.ts::dbUpdateUser)
 *   ↓ calls
 * Supabase (@myapp/supabase/server)
 *
 * Uses useTransition to show pending state without blocking the UI.
 * Shows toast notifications via sonner on success / error.
 */

'use client';

import { useTransition } from 'react';
import { toast } from 'sonner';
import { toggleUserActiveAction } from '../../../../../lib/users/actions';

/** Props for the ToggleUserActive button */
interface ToggleUserActiveProps {
	/** Supabase user (profile) ID */
	userId: string;
	/** Current active state from the profiles table */
	isActive: boolean;
}

/**
 * ToggleUserActive — renders a button that activates or deactivates a user.
 *
 * @param userId — the profiles.id to update
 * @param isActive — current value of profiles.is_active
 */
export default function ToggleUserActive({ userId, isActive }: ToggleUserActiveProps) {
	// ─── Hooks ───────────────────────────────────────────────────
	const [isPending, startTransition] = useTransition();

	// ─── Handlers ────────────────────────────────────────────────

	/**
	 * Calls the server action to flip the user's is_active flag.
	 * Displays a toast on success or failure.
	 */
	const handleToggle = () => {
		startTransition(async () => {
			const result = await toggleUserActiveAction(userId, !isActive);
			if (!result.success) {
				toast.error(result.error);
			} else {
				toast.success(isActive ? 'User deactivated.' : 'User activated.');
			}
		});
	};

	// ─── Render ──────────────────────────────────────────────────
	return (
		<button
			onClick={handleToggle}
			disabled={isPending}
			className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
				isActive
					? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
					: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
			}`}
		>
			{isPending ? 'Updating...' : isActive ? 'Deactivate User' : 'Activate User'}
		</button>
	);
}
