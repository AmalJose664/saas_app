/**
 * @file app/(dashboard)/dashboard/users/UsersSearchInput.tsx
 * @description Client-side search input for the users table.
 * Debounces user input and updates the URL query params via
 * `useTransition` for optimistic UI updates.
 *
 * Architecture:
 * UsersSearchInput (Client Component — 'use client')
 *   ↓ onChange
 * Next.js Router (useRouter + useSearchParams)
 *   ↓ updates URL
 * Server Component re-renders with new search params
 *   ↓ calls
 * Users Service → Repository → Supabase
 */

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useTransition } from 'react';

/** Props for the UsersSearchInput component */
interface UsersSearchInputProps {
	/** Current search value from URL query params */
	defaultValue: string;
}

/**
 * UsersSearchInput — debounced email search for the user directory.
 *
 * @param defaultValue — initial search string from the URL
 */
export default function UsersSearchInput({ defaultValue }: UsersSearchInputProps) {
	// ─── Hooks ───────────────────────────────────────────────────
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isPending, startTransition] = useTransition();

	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = e.target.value;
			const params = new URLSearchParams(searchParams.toString());
			// Remove stale tab/page params — we're on a dedicated path now
			params.delete('tab');
			params.delete('page');

			if (value.trim()) {
				params.set('search', value);
			} else {
				params.delete('search');
			}

			const qs = params.toString()
			startTransition(() => {
				router.replace(`/dashboard/users${qs ? `?${qs}` : ''}`);
			});
		},
		[router, searchParams]
	);

	return (
		<div className="relative">
			<svg
				className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
			</svg>
			<input
				type="text"
				defaultValue={defaultValue}
				onChange={handleChange}
				placeholder="Search by email..."
				className={`text-sm border border-gray-300 rounded-lg pl-9 pr-4 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all w-64 ${isPending ? 'opacity-60' : ''
					}`}
			/>
			{isPending && (
				<div className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
			)}
		</div>
	);
}
