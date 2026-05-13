/**
 * @file app/dashboard/active-plans/SubscriptionClient.tsx
 * @description Client Component for the Subscription management page.
 * 
 * Renders the subscription details UI. Uses TanStack Query hydrated with initial data
 * fetched by the Server Component to provide instant load times while enabling 
 * client-side background refetching via Server Actions.
 */
'use client'

import Link from 'next/link'
import CancelSubscriptionButton from '../../../components/CancelSubscription'
import { statusColors } from "@workspace/utils/styles"
import { formatDateLong } from '@workspace/utils'
import { useQuery } from '@tanstack/react-query'
import { getSubscriptionsByUserIdAction } from '../../../lib/subscriptions/actions'
import type { User } from '@supabase/supabase-js'
import type { GetSubscriptionsResult } from '../../../lib/subscriptions/service'

interface SubscriptionClientProps {
	user: User;
	initialResult: GetSubscriptionsResult;
}

export default function SubscriptionClient({ user, initialResult }: SubscriptionClientProps) {
	// Initialize TanStack Query with the server-fetched data
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
					<p className="font-semibold">Error loading subscription</p>
					<p className="text-sm">{result.error}</p>
				</div>
			</main>
		)
	}

	// Filter for active, paused, or created subscriptions
	const activeSubscriptions = result.data?.filter(
		(sub: any) => sub.status === 'active' || sub.status === 'paused' || sub.status === 'created'
	) || []

	// No active subscription
	if (activeSubscriptions.length === 0) {
		return (
			<main className="max-w-7xl mx-auto px-6 py-12">
				<div className="text-center mb-12">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">No Active Subscriptions</h1>
					<p className="text-gray-600 mb-8">You don't have any active subscriptions yet.</p>
				</div>

				<div className="max-w-md mx-auto bg-white shadow-xl rounded-2xl p-8 border border-gray-100 text-center">
					<div className="w-20 h-20 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
						📦
					</div>
					<h2 className="text-xl font-bold text-gray-800 mb-2">Start Your Journey</h2>
					<p className="text-gray-600 mb-6">
						Choose a plan that fits your needs and unlock all features.
					</p>
					<Link
						href="/dashboard"
						className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all"
					>
						Browse Plans
					</Link>
				</div>
			</main>
		)
	}

	return (
		<main className="max-w-7xl mx-auto px-6 py-12">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">My Active Plans</h1>
				<p className="text-gray-600">Manage your active subscriptions and billing.</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{activeSubscriptions.map((subscription: any) => {
					const plan = subscription.plan
					if (!plan) return null;

					const periodStart = subscription.current_period_start
						? formatDateLong(subscription.current_period_start)
						: 'N/A'

					const periodEnd = subscription.current_period_end
						? formatDateLong(subscription.current_period_end)
						: 'N/A'

					return (
						<div key={subscription.id} className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100 flex flex-col h-full">
							{/* Plan Header */}
							<div className="flex items-start justify-between mb-4">
								<div>
									<h2 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h2>
									<p className="text-gray-600 text-sm">
										₹{(plan.amount / 100).toLocaleString()} / {plan.interval}
									</p>
								</div>
								<span
									className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${statusColors[subscription.status as keyof typeof statusColors] || statusColors.active
										}`}
								>
									{subscription.status}
								</span>
							</div>

							{/* Billing Period */}
							<div className="bg-gray-50 rounded-xl p-4 mb-4">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<p className="text-xs text-gray-500 mb-1">Period Start</p>
										<p className="text-gray-900 text-sm font-medium">{periodStart}</p>
									</div>
									<div>
										<p className="text-xs text-gray-500 mb-1">Period End</p>
										<p className="text-gray-900 text-sm font-medium">{periodEnd}</p>
									</div>
								</div>
							</div>

							{/* IDs */}
							<div className="mb-4 flex-grow space-y-2">
								<div>
									<p className="text-xs text-gray-500">Subscription ID</p>
									<p className="text-gray-900 font-mono text-xs break-all">
										{subscription.id.slice(0, 16)}...
									</p>
								</div>
								{subscription.razorpay_subscription_id && (
									<div>
										<p className="text-xs text-gray-500">Razorpay ID</p>
										<p className="text-gray-900 font-mono text-xs break-all">
											{subscription.razorpay_subscription_id}
										</p>
									</div>
								)}
							</div>

							{/* Footer Actions */}
							<div className="mt-auto pt-4 border-t border-gray-100">
								{subscription.cancel_at_period_end ? (
									<div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center mb-4">
										<p className="text-xs font-semibold text-orange-800 mb-1">
											⚠️ Cancellation Scheduled
										</p>
										<p className="text-xs text-orange-700">
											Ends on {periodEnd}
										</p>
									</div>
								) : (
									subscription.status === 'active' && (
										<div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center mb-4">
											<p className="text-xs text-blue-800">
												<span className="font-semibold">Auto-renews</span> on {periodEnd}
											</p>
										</div>
									)
								)}

								<div className="space-y-3">
									<Link
										href={`/dashboard/subscriptions/${subscription.id}`}
										className="flex w-full justify-center items-center py-2.5 bg-gray-50 hover:bg-gray-100 text-sm font-medium text-gray-700 rounded-lg transition-colors border border-gray-200"
									>
										View Details
									</Link>
									{!subscription.cancel_at_period_end && (
										<div className="w-full">
											<CancelSubscriptionButton currentSubscriptionId={subscription.id} />
										</div>
									)}
								</div>
							</div>
						</div>
					)
				})}
			</div>

			{/* Quick Links */}
			<div className="mt-12 flex justify-center gap-6 text-sm">
				<Link
					href="/dashboard/subscriptions"
					className="text-blue-600 hover:text-blue-700 font-medium"
				>
					View All Subscriptions
				</Link>
				<span className="text-gray-300">|</span>
				<Link
					href="/dashboard/payments"
					className="text-blue-600 hover:text-blue-700 font-medium"
				>
					Payment History
				</Link>
				<span className="text-gray-300">|</span>
				<Link
					href="/dashboard/orders"
					className="text-blue-600 hover:text-blue-700 font-medium"
				>
					Order History
				</Link>
			</div>
		</main>
	)
}
