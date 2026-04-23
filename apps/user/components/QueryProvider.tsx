/**
 * @file components/QueryProvider.tsx
 * @description TanStack QueryClientProvider wrapper for the admin app.
 *
 * Architecture:
 *   layout.tsx — Server Component
 *     ↓ renders
 *   QueryProvider — Client Component ('use client')
 *     ↓ provides
 *   QueryClient instance (lib/query-client.ts singleton)
 *     ↓ consumed by
 *   React Query Hooks (lib domain hooks e.g. users/plans/orders)
 *
 * This component must be a Client Component because QueryClientProvider
 * uses React context internally. It wraps the entire app tree so all
 * pages and components can use useQuery/useMutation without re-instantiating.
 */

'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '../lib/query-client';

/** Props accepted by QueryProvider — mirrors React children pattern */
interface QueryProviderProps {
	/** App tree to be wrapped in the query context */
	children: React.ReactNode;
}

/**
 * QueryProvider — wraps the application in TanStack Query's React context.
 *
 * Includes ReactQueryDevtools in development for cache inspection.
 * The QueryClient is a singleton imported from lib/query-client.ts
 * to prevent hydration mismatches and memory leaks.
 *
 * @param children — entire Next.js app tree from layout.tsx
 */
export default function QueryProvider({ children }: QueryProviderProps) {
	return (
		<QueryClientProvider client={queryClient}>
			{children}
			<ReactQueryDevtools initialIsOpen={false} />
		</QueryClientProvider>
	);
}
