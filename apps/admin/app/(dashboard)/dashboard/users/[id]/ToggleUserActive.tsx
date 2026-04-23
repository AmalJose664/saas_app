/**
 * @file ToggleUserActive.tsx
 * @description Client-side button component to toggle a user's active status.
 *
 * Architecture:
 * UI (this component)
 *   ↓ calls
 * TanStack Query Hook (lib/users/hooks.ts::useToggleUserActive)
 *   ↓ calls
 * Server Action (lib/users/actions.ts::toggleUserActiveAction)
 *   ↓ calls
 * Service (lib/users/service.ts::updateUser)
 *   ↓ calls
 * Repository (lib/users/repository.ts::dbUpdateUser)
 *   ↓ calls
 * Supabase (@myapp/supabase/server)
 *
 * Cache invalidation: On success, the hook automatically invalidates
 * the user detail + users list caches, so data refreshes without
 * manual page reload. Toast notifications are handled by the hook.
 */

'use client';

import { useToggleUserActive } from '../../../../../lib/users/hooks';

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
 * Uses the useToggleUserActive TanStack Query mutation hook for:
 * - Automatic loading state (isPending)
 * - Toast notifications on success/error
 * - Cache invalidation across the app
 * - Retry on network failures
 *
 * @param userId — the profiles.id to update
 * @param isActive — current value of profiles.is_active
 */
export default function ToggleUserActive({ userId, isActive }: ToggleUserActiveProps) {
	// ─── Hooks ───────────────────────────────────────────────────
	const { mutate, isPending } = useToggleUserActive();

	// ─── Handlers ────────────────────────────────────────────────

	/**
	 * Triggers the TanStack Query mutation to flip the user's is_active flag.
	 * The hook handles server calls, toast notifications, and cache invalidation.
	 */
	const handleToggle = () => {
		mutate({ id: userId, isActive: !isActive });
	};
	console.log(isActive, "value we get")
	// ─── Render ──────────────────────────────────────────────────
	return (
		<button
			onClick={handleToggle}
			disabled={isPending}
			className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isActive
				? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
				: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
				}`}
		>
			{isPending ? 'Updating...' : isActive ? 'Deactivate User' : 'Activate User'}
		</button>
	);
}
