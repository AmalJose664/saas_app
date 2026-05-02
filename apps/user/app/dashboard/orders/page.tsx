/**
 * @file app/dashboard/orders/page.tsx
 * @description Order history page — displays all orders for the user.
 *
 * Server Component. Fetches all orders associated with the user
 * and displays them in a table format with:
 * - Order date and time
 * - Amount and currency
 * - Status
 * - Razorpay order ID
 * - Plan ID
 *
 * Protected by middleware — unauthenticated users are redirected to /login.
 */
import { getAuthUser } from '../../../lib/auth/server'
import { getOrdersByUserId } from '../../../lib/orders/service'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatAmount, formatDate, formatDateTime } from '@workspace/utils'



export default async function OrdersPage() {
	const { user } = await getAuthUser()

	if (!user) {
		redirect('/login')
	}

	const result = await getOrdersByUserId(user.id)

	// Handle error state
	if (!result.success) {
		return (
			<main className="max-w-7xl mx-auto px-6 py-12">
				<div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-600">
					<p className="font-semibold">Error loading orders</p>
					<p className="text-sm">{result.error}</p>
				</div>
			</main>
		)
	}

	const orders = result.data

	const statusColors: Record<string, string> = {
		paid: 'bg-green-100 text-green-700',
		created: 'bg-blue-100 text-blue-700',
		attempted: 'bg-yellow-100 text-yellow-700',
		pending: 'bg-yellow-100 text-yellow-700',
		failed: 'bg-red-100 text-red-700',
	}


	return (
		<main className="max-w-7xl mx-auto px-6 py-12">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">Order History</h1>
				<p className="text-gray-600">View and track all your orders and their current status.</p>
			</div>

			{/* No orders state */}
			{orders.length === 0 ? (
				<div className="max-w-md mx-auto bg-white shadow-xl rounded-2xl p-8 border border-gray-100 text-center">
					<div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
						📦
					</div>
					<h2 className="text-xl font-bold text-gray-800 mb-2">No Orders Found</h2>
					<p className="text-gray-600 mb-6">
						You haven't placed any orders yet. Once you do, they will appear here.
					</p>
					<Link
						href="/dashboard"
						className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all"
					>
						Explore Plans
					</Link>
				</div>
			) : (
				<>
					{/* Summary Cards */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
						{/* Total Orders */}
						<div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100">
							<p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
								Total Orders
							</p>
							<p className="text-3xl font-bold text-gray-900">{orders.length}</p>
						</div>

						{/* Paid Orders */}
						<div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100">
							<p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
								Completed
							</p>
							<p className="text-3xl font-bold text-green-600">
								{orders.filter((o) => (o.status as string)).length}
							</p>
						</div>

						<div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100">
							<p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
								Total Value
							</p>
							<p className="text-3xl font-bold text-gray-900">
								{formatAmount(
									orders
										.filter((o) => (o.status as string) === 'paid')
										.reduce((sum, o) => sum + (o.amount_paise || 0), 0),
									'INR'
								)}
							</p>
						</div>
					</div>

					{/* Orders Table */}
					<div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
						{/* Desktop Table */}
						<div className="hidden md:block overflow-x-auto">
							<table className="w-full">
								<thead className="bg-gray-50 border-b border-gray-100">
									<tr>
										<th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
											Date
										</th>
										<th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
											Order ID
										</th>
										<th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
											Amount
										</th>
										<th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
											Status
										</th>
										<th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
											Plan
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-100">
									{orders.map((order) => (
										<tr key={order.id} className="hover:bg-gray-50 transition-colors">
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="text-sm text-gray-900">
													{formatDate((order as any).created_at)}
												</div>
												<div className="text-xs text-gray-500">
													{new Date((order as any).created_at || '').toLocaleTimeString(
														'en-US',
														{
															hour: '2-digit',
															minute: '2-digit',
														}
													)}
												</div>
											</td>
											<td className="px-6 py-4">
												<div className="text-sm font-mono text-gray-900">
													{order.razorpay_order_id || 'N/A'}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="text-sm font-semibold text-gray-900">
													{formatAmount(order.amount_paise || 0, order.currency)}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span
													className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${statusColors[order.status || 'pending'] || statusColors.pending
														}`}
												>
													{order.status || 'pending'}
												</span>
											</td>
											<td className="px-6 py-4">
												<Link href={`/dashboard/orders/${order.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline">
													View Details
												</Link>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{/* Mobile Cards */}
						<div className="md:hidden divide-y divide-gray-100">
							{orders.map((order) => (
								<div key={order.id} className="p-6">
									<div className="flex items-start justify-between mb-4">
										<div>
											<p className="text-sm font-semibold text-gray-900">
												{formatAmount(order.amount_paise || 0, order.currency)}
											</p>
											<p className="text-xs text-gray-500 mt-1">
												{formatDateTime((order as any).created_at)}
											</p>
										</div>
										<span
											className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${statusColors[order.status || 'pending'] || statusColors.pending
												}`}
										>
											{order.status || 'pending'}
										</span>
									</div>

									<div className="space-y-3">
										<div>
											<p className="text-xs text-gray-500">Order ID</p>
											<p className="text-sm font-mono text-gray-900">
												{order.razorpay_order_id || 'N/A'}
											</p>
										</div>

										<div className="pt-2">
											<Link href={`/dashboard/orders/${order.id}`} className="inline-flex w-full justify-center items-center px-4 py-2 bg-gray-50 hover:bg-gray-100 text-sm font-medium text-gray-700 rounded-lg transition-colors border border-gray-200">
												View Order Details
											</Link>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Quick Links */}
					<div className="mt-8 flex justify-center gap-4">
						<Link
							href="/dashboard/subscription"
							className="text-blue-600 hover:text-blue-700 font-medium"
						>
							← Back to Subscription
						</Link>
						<span className="text-gray-300">|</span>
						<Link
							href="/dashboard/payments"
							className="text-blue-600 hover:text-blue-700 font-medium"
						>
							View Payments →
						</Link>
					</div>
				</>
			)}
		</main>
	)
}