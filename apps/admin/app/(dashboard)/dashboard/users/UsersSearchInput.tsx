'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useTransition } from 'react';

export default function UsersSearchInput({ defaultValue }: { defaultValue: string }) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isPending, startTransition] = useTransition();

	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = e.target.value;
			const params = new URLSearchParams(searchParams.toString());
			params.set('tab', 'users');
			params.delete('page');

			if (value.trim()) {
				params.set('search', value);
			} else {
				params.delete('search');
			}

			startTransition(() => {
				router.replace(`/dashboard?${params.toString()}`);
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
