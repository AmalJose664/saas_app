/**
 * @file app/dashboard/subscriptions/SubscriptionsClient.tsx
 * @description Client Component for the Subscriptions list page.
 * 
 * Renders the full subscription history UI. Uses TanStack Query hydrated with initial data
 * fetched by the Server Component to provide instant load times while enabling 
 * client-side background refetching via Server Actions.
 */
'use client'

import Link from 'next/link'
import { formatAmount, formatDate } from '@workspace/utils'
import { statusColors } from '@workspace/utils/styles'
import { useQuery } from '@tanstack/react-query'
import { getSubscriptionsByUserIdAction } from '../../../lib/subscriptions/actions'
import type { User } from '@supabase/supabase-js'
import type { GetSubscriptionsResult } from '../../../lib/subscriptions/service'

interface SubscriptionsClientProps {
	user: User;
	initialResult: GetSubscriptionsResult;
}

export default function SubscriptionsClient({ user, initialResult }: SubscriptionsClientProps) {
	const { data: result } = useQuery({
		queryKey: ['subscriptions', user?.id],
		queryFn: async () => await getSubscriptionsByUserIdAction(user?.id),
		initialData: initialResult,
	});

	// Handle error state
	if (!result.success) {
		return (
			<main className="max-w-7xl mx-auto px-6 py-12">
				<div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-600">
					<p className="font-semibold">Error loading subscriptions</p>
					<p className="text-sm">{result.error}</p>
				</div>
			</main>
		)
	}

	const subscriptions = result.data

	// Split subscriptions into active and inactive
	const activeSubscriptions = subscriptions.filter(
		(sub) => sub.status === 'active'
	)
	const inactiveSubscriptions = subscriptions.filter(
		(sub) => sub.status !== 'active'
	)

	return (
		<main className="max-w-7xl mx-auto px-6 py-12">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">My Subscriptions</h1>
				<p className="text-gray-600">View and manage all your subscription history.</p>
			</div>

			{/* No subscriptions state */}
			{subscriptions.length === 0 ? (
				<div className="max-w-md mx-auto bg-white shadow-xl rounded-2xl p-8 border border-gray-100 text-center">
					<div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
						📋
					</div>
					<h2 className="text-xl font-bold text-gray-800 mb-2">No Subscriptions Found</h2>
					<p className="text-gray-600 mb-6">
						You haven't subscribed to any plans yet. Once you do, they will appear here.
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
						{/* Total Subscriptions */}
						<div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100">
							<p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
								Total Subscriptions
							</p>
							<p className="text-3xl font-bold text-gray-900">{subscriptions.length}</p>
						</div>

						{/* Active Subscriptions */}
						<div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100">
							<p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
								Active
							</p>
							<p className="text-3xl font-bold text-green-600">
								{activeSubscriptions.length}
							</p>
						</div>

						{/* Inactive Subscriptions */}
						<div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100">
							<p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
								Inactive
							</p>
							<p className="text-3xl font-bold text-gray-600">
								{inactiveSubscriptions.length}
							</p>
						</div>
					</div>

					{/* Active Subscriptions Table */}
					{activeSubscriptions.length > 0 && (
						<div className="mb-8">
							<h2 className="text-xl font-bold text-gray-900 mb-4">Active Subscriptions</h2>
							<div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
								{/* Desktop Table */}
								<div className="hidden md:block overflow-x-auto">
									<table className="w-full">
										<thead className="bg-gray-50 border-b border-gray-100">
											<tr>
												<th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
													Plan
												</th>
												<th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
													Amount
												</th>
												<th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
													Status
												</th>
												<th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
													Period End
												</th>
												<th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
													Actions
												</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-gray-100">
											{activeSubscriptions.map((subscription) => (
												<tr key={subscription.id} className="hover:bg-gray-50 transition-colors">
													<td className="px-6 py-4">
														<div className="text-sm font-semibold text-gray-900">
															{subscription.plan?.name || 'N/A'}
														</div>
														<div className="text-xs text-gray-500">
															{subscription.plan?.interval || 'N/A'}
														</div>
													</td>
													<td className="px-6 py-4 whitespace-nowrap">
														<div className="text-sm font-semibold text-gray-900">
															{subscription.plan
																? formatAmount(subscription.plan.amount, 'INR')
																: 'N/A'}
														</div>
													</td>
													<td className="px-6 py-4 whitespace-nowrap">
														<span
															className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${statusColors[subscription.status || 'pending'] ||
																statusColors.active
																}`}
														>
															{subscription.status || 'pending'}
														</span>
													</td>
													<td className="px-6 py-4 whitespace-nowrap">
														<div className="text-sm text-gray-900">
															{subscription.current_period_end
																? formatDate(subscription.current_period_end)
																: 'N/A'}
														</div>
													</td>
													<td className="px-6 py-4">
														<Link
															href={`/dashboard/subscriptions/${subscription.id}`}
															className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
														>
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
									{activeSubscriptions.map((subscription) => (
										<div key={subscription.id} className="p-6">
											<div className="flex items-start justify-between mb-4">
												<div>
													<p className="text-sm font-semibold text-gray-900">
														{subscription.plan?.name || 'N/A'}
													</p>
													<p className="text-xs text-gray-500 mt-1">
														{subscription.plan
															? formatAmount(subscription.plan.amount, 'INR')
															: 'N/A'}{' '}
														/ {subscription.plan?.interval || 'N/A'}
													</p>
												</div>
												<span
													className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${statusColors[subscription.status || 'pending'] ||
														statusColors.active
														}`}
												>
													{subscription.status || 'pending'}
												</span>
											</div>

											<div className="space-y-3">
												<div>
													<p className="text-xs text-gray-500">Period End</p>
													<p className="text-sm text-gray-900">
														{subscription.current_period_end
															? formatDate(subscription.current_period_end)
															: 'N/A'}
													</p>
												</div>

												<div className="pt-2">
													<Link
														href={`/dashboard/subscriptions/${subscription.id}`}
														className="inline-flex w-full justify-center items-center px-4 py-2 bg-gray-50 hover:bg-gray-100 text-sm font-medium text-gray-700 rounded-lg transition-colors border border-gray-200"
													>
														View Details
													</Link>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					)}

					{/* Inactive Subscriptions Table */}
					{inactiveSubscriptions.length > 0 && (
						<div>
							<h2 className="text-xl font-bold text-gray-900 mb-4">
								Inactive & Cancelled Subscriptions
							</h2>
							<div className="bg-white shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
								{/* Desktop Table */}
								<div className="hidden md:block overflow-x-auto">
									<table className="w-full">
										<thead className="bg-gray-50 border-b border-gray-100">
											<tr>
												<th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
													Plan
												</th>
												<th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
													Amount
												</th>
												<th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
													Status
												</th>
												<th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
													Ended On
												</th>
												<th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
													Actions
												</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-gray-100">
											{inactiveSubscriptions.map((subscription) => (
												<tr key={subscription.id} className="hover:bg-gray-50 transition-colors">
													<td className="px-6 py-4">
														<div className="text-sm font-semibold text-gray-900">
															{subscription.plan?.name || 'N/A'}
														</div>
														<div className="text-xs text-gray-500">
															{subscription.plan?.interval || 'N/A'}
														</div>
													</td>
													<td className="px-6 py-4 whitespace-nowrap">
														<div className="text-sm font-semibold text-gray-900">
															{subscription.plan
																? formatAmount(subscription.plan.amount, 'INR')
																: 'N/A'}
														</div>
													</td>
													<td className="px-6 py-4 whitespace-nowrap">
														<span
															className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${statusColors[subscription.status || 'pending'] ||
																statusColors.pending
																}`}
														>
															{subscription.status || 'pending'}
														</span>
													</td>
													<td className="px-6 py-4 whitespace-nowrap">
														<div className="text-sm text-gray-900">
															{subscription.current_period_end
																? formatDate(subscription.current_period_end)
																: 'N/A'}
														</div>
													</td>
													<td className="px-6 py-4">
														<Link
															href={`/dashboard/subscriptions/${subscription.id}`}
															className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
														>
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
									{inactiveSubscriptions.map((subscription) => (
										<div key={subscription.id} className="p-6">
											<div className="flex items-start justify-between mb-4">
												<div>
													<p className="text-sm font-semibold text-gray-900">
														{subscription.plan?.name || 'N/A'}
													</p>
													<p className="text-xs text-gray-500 mt-1">
														{subscription.plan
															? formatAmount(subscription.plan.amount, 'INR')
															: 'N/A'}{' '}
														/ {subscription.plan?.interval || 'N/A'}
													</p>
												</div>
												<span
													className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${statusColors[subscription.status || 'pending'] ||
														statusColors.pending
														}`}
												>
													{subscription.status || 'pending'}
												</span>
											</div>

											<div className="space-y-3">
												<div>
													<p className="text-xs text-gray-500">Ended On</p>
													<p className="text-sm text-gray-900">
														{subscription.current_period_end
															? formatDate(subscription.current_period_end)
															: 'N/A'}
													</p>
												</div>

												<div className="pt-2">
													<Link
														href={`/dashboard/subscriptions/${subscription.id}`}
														className="inline-flex w-full justify-center items-center px-4 py-2 bg-gray-50 hover:bg-gray-100 text-sm font-medium text-gray-700 rounded-lg transition-colors border border-gray-200"
													>
														View Details
													</Link>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					)}

					{/* Quick Links */}
					<div className="mt-8 flex justify-center gap-4">
						<Link
							href="/dashboard"
							className="text-blue-600 hover:text-blue-700 font-medium"
						>
							← Browse Plans
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
