/**
 * @file app/(dashboard)/dashboard/subscriptions/page.tsx
 * @description Subscriptions list page — server component wrapper that renders
 * the SubscriptionsTable with all active, cancelled, and past-due subscriptions.
 *
 * Architecture:
 * Server Component (this)
 *   ↓ renders
 * SubscriptionsTable (async Server Component)
 *   ↓ calls
 * Subscriptions Service (lib/subscriptions/service.ts::getAllSubscriptions)
 *   ↓ calls
 * Subscriptions Repository (lib/subscriptions/repository.ts::dbGetSubscriptions)
 *   ↓ calls
 * Supabase Server Client
 */

import SubscriptionsTable from './SubscriptionsTable';

/**
 * SubscriptionsPage — server component wrapper for the subscriptions list.
 *
 * @returns JSX.Element
 */
export default function SubscriptionsPage() {
	return (
		<div>
			<h3>Subscriptions</h3>
			<SubscriptionsTable />
		</div>
	);
}