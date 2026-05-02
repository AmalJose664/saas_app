/**
 * @file app/dashboard/payments/page.tsx
 * @description Payment history page — displays all payment records for the user.
 *
 * Server Component. Fetches all payments associated with the user's subscriptions
 * and displays them in a table format with:
 * - Payment date and time
 * - Amount and currency
 * - Status (captured, failed, pending)
 * - Razorpay payment ID
 * - Failure reason (if applicable)
 *
 * Protected by middleware — unauthenticated users are redirected to /login.
 */
import { getAuthUser } from '../../../lib/auth/server'
import { getPaymentsByUserId } from '../../../lib/payments/service'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function PaymentsPage() {
	const { user } = await getAuthUser()

	if (!user) {
		redirect('/login')
	}

	const result = await getPaymentsByUserId(user.id)

	// Handle error state
	if (!result.success) {
		return (
			<main className="max-w-7xl mx-auto px-6 py-12">
				<div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-600">
					<p className="font-semibold">Error loading payments</p>
					<p className="text-sm">{result.error}</p>
				</div>
			</main>
		)
	}

	const payments = result.data

	// Status badge colors
	const statusColors: Record<string, string> = {
		captured: 'bg-green-100 text-green-700',
		failed: 'bg-red-100 text-red-700',
		pending: 'bg-yellow-100 text-yellow-700',
		refunded: 'bg-gray-100 text-gray-700',
	}

	// Format currency
	const formatAmount = (amount: number, currency: string | null) => {
		const symbol = currency === 'INR' ? '₹' : currency || '₹'
		return `${symbol}${(amount / 100).toLocaleString()}`
	}

	// Format date
	const formatDate = (dateString: string | null) => {
		if (!dateString) return 'N/A'
		const date = new Date(dateString)
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		})
	}

	const formatDateTime = (dateString: string | null) => {
		if (!dateString) return 'N/A'
		const date = new Date(dateString)
		return date.toLocaleString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		})
	}

	return (
		<main className="max-w-7xl mx-auto px-6 py-12">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">Payment History</h1>
				<p className="text-gray-600">View all your payment transactions and receipts.</p>
			</div>

			{/* No payments state */}
			{payments.length === 0 ? (
				<div className="max-w-md mx-auto bg-white shadow-xl rounded-2xl p-8 border border-gray-100 text-center">
					<div className="w-20 h-20 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
						💳
					</div>
					<h2 className="text-xl font-bold text-gray-800 mb-2">No Payments Yet</h2>
					<p className="text-gray-600 mb-6">
						You haven't made any payments yet. Subscribe to a plan to get started.
					</p>
					<Link
						href="/dashboard"
						className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all"
					>
						Browse Plans
					</Link>
				</div>
			) : (
				<>
					{/* Summary Cards */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
						{/* Total Payments */}
						<div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100">
							<p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
								Total Payments
							</p>
							<p className="text-3xl font-bold text-gray-900">{payments.length}</p>
						</div>

						{/* Successful Payments */}
						<div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100">
							<p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
								Successful
							</p>
							<p className="text-3xl font-bold text-green-600">
								{payments.filter((p) => p.status === 'captured').length}
							</p>
						</div>

						{/* Total Amount Paid */}
						<div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100">
							<p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
								Total Paid
							</p>
							<p className="text-3xl font-bold text-gray-900">
								{formatAmount(
									payments
										.filter((p) => p.status === 'captured')
										.reduce((sum, p) => sum + p.amount, 0),
									'INR'
								)}
							</p>
						</div>
					</div>

					{/* Payments Table */}
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
											Payment ID
										</th>
										<th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
											Amount
										</th>
										<th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
											Status
										</th>
										<th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
											Details
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-100">
									{payments.map((payment) => (
										<tr key={payment.id} className="hover:bg-gray-50 transition-colors">
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="text-sm text-gray-900">
													{formatDate(payment.paid_at || payment.created_at)}
												</div>
												<div className="text-xs text-gray-500">
													{new Date(payment.paid_at || payment.created_at || '').toLocaleTimeString(
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
													{payment.razorpay_payment_id || 'N/A'}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="text-sm font-semibold text-gray-900">
													{formatAmount(payment.amount, payment.currency)}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span
													className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${statusColors[payment.status || 'pending'] || statusColors.pending
														}`}
												>
													{(payment.status === "captured" ? "paid" : payment.status) || 'pending'}
												</span>
											</td>
											<td className="px-6 py-4">
												{payment.status === 'failed' && payment.failure_reason ? (
													<div className="text-xs text-red-600">{payment.failure_reason}</div>
												) : payment.status === 'captured' ? (
													<div className="text-xs text-green-600">Payment successful</div>
												) : (
													<div className="text-xs text-gray-500">—</div>
												)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>

						{/* Mobile Cards */}
						<div className="md:hidden divide-y divide-gray-100">
							{payments.map((payment) => (
								<div key={payment.id} className="p-6">
									<div className="flex items-start justify-between mb-4">
										<div>
											<p className="text-sm font-semibold text-gray-900">
												{formatAmount(payment.amount, payment.currency)}
											</p>
											<p className="text-xs text-gray-500 mt-1">
												{formatDateTime(payment.paid_at || payment.created_at)}
											</p>
										</div>
										<span
											className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${statusColors[payment.status || 'pending'] || statusColors.pending
												}`}
										>
											{payment.status || 'pending'}
										</span>
									</div>

									<div className="space-y-2">
										<div>
											<p className="text-xs text-gray-500">Payment ID</p>
											<p className="text-sm font-mono text-gray-900">
												{payment.razorpay_payment_id || 'N/A'}
											</p>
										</div>

										{payment.status === 'failed' && payment.failure_reason && (
											<div>
												<p className="text-xs text-gray-500">Failure Reason</p>
												<p className="text-sm text-red-600">{payment.failure_reason}</p>
											</div>
										)}
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
							href="/dashboard/orders"
							className="text-blue-600 hover:text-blue-700 font-medium"
						>
							View Orders →
						</Link>
					</div>
				</>
			)}
		</main>
	)
}
