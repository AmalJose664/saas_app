/**
 * @file app/(dashboard)/dashboard/orders/OrdersTable.tsx
 * @description Async server component that fetches order records and
 * renders them in a styled table with customer, amount, status, and date.
 *
 * Architecture:
 * OrdersTable (Server Component)
 *   ↓ calls
 * Orders Service (lib/orders/service.ts::getOrders)
 *   ↓ calls
 * Orders Repository (lib/orders/repository.ts::dbGetOrders)
 *   ↓ calls
 * Supabase Server Client
 *
 * Joins: profiles (full_name, email) for customer display.
 * Amount is displayed in ₹ (converted from paise ÷100).
 */

import { getOrders } from '../../../../lib/orders/service';

/** Props for the OrdersTable component */
interface OrdersTableProps {
	/** Maximum number of rows to fetch (optional) */
	limit?: number;
	/** Filter to a specific user's orders (optional) */
	userId?: string;
}

/**
 * OrdersTable — renders a table of order records.
 *
 * @param limit — max rows to show
 * @param userId — optional user filter for profile pages
 */
export default async function OrdersTable({ limit, userId }: OrdersTableProps) {
	// ─── Fetch data through the service layer ────────────────────
	const result = await getOrders({ limit, userId });

	if (!result.success) {
		return (
			<div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-600">
				<p className="font-semibold">Error loading orders</p>
				<p className="text-sm">{result.error}</p>
			</div>
		)
	}

	const orders = result.data

	return (
		<div className="overflow-x-auto bg-white rounded-xl border border-gray-200">
			<table className="w-full text-left border-collapse">
				<thead>
					<tr className="bg-gray-50 border-b border-gray-200">
						<th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
						<th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
						<th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
						<th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
						<th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-gray-100">
					{orders.map((order) => (
						<tr key={order.id} className="hover:bg-gray-50 transition-colors">
							<td className="px-6 py-4 text-sm font-mono text-gray-600">
								#{order.id.slice(0, 8)}
							</td>
							<td className="px-6 py-4">
								<div className="text-sm font-medium text-gray-900">
									{order.profiles?.full_name ?? '—'}
								</div>
								<div className="text-xs text-gray-500">
									{order.profiles?.email ?? '—'}
								</div>
							</td>
							<td className="px-6 py-4 text-sm font-semibold text-gray-900">
								₹{(order.amount_paise / 100).toLocaleString('en-IN')}
							</td>
							<td className="px-6 py-4">
								<span className={`px-2.5 py-1 rounded-full text-xs font-medium ${order.status === 'active'
										? 'bg-emerald-50 text-emerald-700'
										: order.status === 'cancelled'
											? 'bg-red-50 text-red-700'
											: 'bg-amber-50 text-amber-700'
									}`}>
									{order.status}
								</span>
							</td>
							<td className="px-6 py-4 text-sm text-gray-500">
								{new Date(order.created_at).toLocaleDateString('en-IN', {
									day: 'numeric',
									month: 'short',
									year: 'numeric',
								})}
							</td>
						</tr>
					))}
				</tbody>
			</table>

			{orders.length === 0 && (
				<div className="p-12 text-center">
					<p className="text-gray-400 italic">No orders found.</p>
				</div>
			)}
		</div>
	)
}
