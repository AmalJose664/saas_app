/**
 * @file app/(dashboard)/dashboard/orders/page.tsx
 * @description Orders list page — server component wrapper that renders
 * the OrdersTable with all orders (no limit or filter).
 *
 * Architecture:
 * Server Component (this)
 *   ↓ renders
 * OrdersTable (async Server Component)
 *   ↓ calls
 * Orders Service (lib/orders/service.ts::getOrders)
 *   ↓ calls
 * Orders Repository (lib/orders/repository.ts::dbGetOrders)
 *   ↓ calls
 * Supabase Server Client
 */

import OrdersTable from './OrdersTable';

/**
 * OrdersPage — server component wrapper for the orders list.
 *
 * @returns JSX.Element
 */
export default function OrdersPage() {
	return (
		<div>
			<h2>Orders</h2>
			<OrdersTable />
		</div>
	);
}