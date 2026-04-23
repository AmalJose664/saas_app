/**
 * @file lib/query-client.ts
 * @description TanStack Query client configuration for the admin app.
 *
 * Architecture:
 * QueryClient (this file)
 *   ↓ instantiated once per session
 * QueryClientProvider (components/QueryProvider.tsx)
 *   ↓ wraps app in layout.tsx
 * React Query Hooks (lib/*/hooks.ts)
 *   ↓ call
 * Service Layer → Repository → Supabase
 *
 * Configuration designed for 5-year stability:
 * - Stale time: 30s (reduces redundant network requests)
 * - Retry: exponential backoff with 3 max attempts
 * - Refetch on window focus: enabled for admin dashboard freshness
 * - Persist: disabled (admin data is sensitive, fresh is better)
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Global QueryClient instance — instantiated once per app lifecycle.
 *
 * Do NOT instantiate inside a component or hook. Import this singleton
 * and pass it to QueryClientProvider in layout.tsx.
 */
export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			// Data stays fresh for 30s — reduces redundant server calls
			staleTime: 1000 * 30,
			// Cache persists for 5 minutes before garbage collection
			gcTime: 1000 * 60 * 5,
			// Retry failed queries 3x with exponential backoff
			retry: 3,
			retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
			// Refetch when admin returns to the tab (useful for live dashboards)
			refetchOnWindowFocus: true,
			// Refetch when network reconnects
			refetchOnReconnect: true,
			// Do not refetch on mount if data is fresh
			refetchOnMount: false,
		},
		mutations: {
			// Retry failed mutations once (network blip protection)
			retry: 1,
			retryDelay: 1000,
		},
	},
});
