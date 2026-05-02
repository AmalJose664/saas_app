/**
 * @file app/dashboard/subscription/page.tsx
 * @description Subscription management page — displays current subscription details.
 *
 * Server Component. Fetches the user's active subscription and displays:
 * - Current plan details (name, price, billing cycle)
 * - Subscription status and period dates
 * - Plan features
 * - Management actions (cancel, upgrade)
 *
 * Protected by middleware — unauthenticated users are redirected to /login.
 */
import { getAuthUser } from '../../../lib/auth/server'
import { getCurrentSubscription } from '../../../lib/subscriptions/service'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import CancelSubscriptionButton from '../../../components/CancelSubscription'

export default async function SubscriptionPage() {
	const { user } = await getAuthUser()

	if (!user) {
		redirect('/login')
	}

	const result = await getCurrentSubscription(user.id)

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

	// No active subscription
	if (!result.data) {
		return (
			<main className="max-w-7xl mx-auto px-6 py-12">
				<div className="text-center mb-12">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">No Active Subscription</h1>
					<p className="text-gray-600 mb-8">You don't have an active subscription yet.</p>
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

	// Active subscription exists
	const subscription = result.data
	if (!subscription.plan) {
		return (
			<main className="max-w-7xl mx-auto px-6 py-12">
				<div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-600">
					<p className="font-semibold">Error loading subscription</p>
					<p className="text-sm">Plan details not found</p>
				</div>
			</main>
		)
	}
	const plan = subscription.plan

	// Format dates
	const periodStart = subscription.current_period_start
		? new Date(subscription.current_period_start).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		})
		: 'N/A'

	const periodEnd = subscription.current_period_end
		? new Date(subscription.current_period_end).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		})
		: 'N/A'

	// Status badge color
	const statusColors: Record<string, string> = {
		active: 'bg-green-100 text-green-700',
		pending: 'bg-yellow-100 text-yellow-700',
		cancelled: 'bg-red-100 text-red-700',
		failed: 'bg-red-100 text-red-700',
		completed: 'bg-gray-100 text-gray-700',
		paused: 'bg-orange-100 text-orange-700',
		created: 'bg-blue-100 text-blue-700',
	}

	return (
		<main className="max-w-7xl mx-auto px-6 py-12">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">My Subscription</h1>
				<p className="text-gray-600">Manage your current subscription and billing.</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
				{/* Main Subscription Card */}
				<div className="lg:col-span-2">
					<div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
						{/* Plan Header */}
						<div className="flex items-start justify-between mb-6">
							<div>
								<h2 className="text-2xl font-bold text-gray-900 mb-1">{plan.name}</h2>
								<p className="text-gray-600">
									₹{(plan.amount / 100).toLocaleString()} / {plan.interval}
								</p>
							</div>
							<span
								className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${statusColors[subscription.status] || statusColors.active
									}`}
							>
								{subscription.status}
							</span>
						</div>

						{/* Billing Period */}
						<div className="bg-gray-50 rounded-xl p-6 mb-6">
							<h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
								Current Billing Period
							</h3>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-xs text-gray-500 mb-1">Period Start</p>
									<p className="text-gray-900 font-medium">{periodStart}</p>
								</div>
								<div>
									<p className="text-xs text-gray-500 mb-1">Period End</p>
									<p className="text-gray-900 font-medium">{periodEnd}</p>
								</div>
							</div>
						</div>

						{/* Plan Features */}
						{plan.features && plan.features.length > 0 && (
							<div className="mb-6">
								<h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
									Plan Features
								</h3>
								<ul className="space-y-3">
									{plan.features.map((feature: string, index: number) => (
										<li key={index} className="flex items-start gap-3">
											<span className="text-green-500 mt-1">✓</span>
											<span className="text-gray-700">{feature}</span>
										</li>
									))}
								</ul>
							</div>
						)}

						{!subscription.cancel_at_period_end ? (
							<div className="bg-orange-50 border border-orange-200 rounded-xl p-6 text-center">
								<p className="text-sm font-semibold text-orange-800 mb-2">
									⚠️ Cancellation Scheduled
								</p>
								<p className="text-sm text-orange-700">
									Your subscription is scheduled to be cancelled at the end of the current billing period on{' '}
									<span className="font-semibold">{periodEnd}</span>. You will continue to have access until then.
								</p>
								<CancelSubscriptionButton currentSubscriptionId={subscription.id} btnText='Cancel Now' />
							</div>
						) : (
							<>
								<div className="pt-6 border-t border-gray-100">
									<CancelSubscriptionButton currentSubscriptionId={subscription.id} />
								</div>
								<p className="text-xs text-gray-500 text-center mt-3">
									Cancellation will take effect at the end of the current billing period.
								</p>
							</>
						)}
					</div>
				</div>

				<div className="space-y-6">
					<div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100">
						<h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
							Subscription Details
						</h3>
						<div className="space-y-4">
							<div>
								<p className="text-xs text-gray-500 mb-1">Subscription ID</p>
								<p className="text-gray-900 font-mono text-sm break-all">
									{subscription.id.slice(0, 8)}...
								</p>
							</div>
							{subscription.razorpay_subscription_id && (
								<div>
									<p className="text-xs text-gray-500 mb-1">Razorpay ID</p>
									<p className="text-gray-900 font-mono text-sm break-all">
										{subscription.razorpay_subscription_id}
									</p>
								</div>
							)}
							<div>
								<p className="text-xs text-gray-500 mb-1">Started On</p>
								<p className="text-gray-900 font-medium">
									{new Date(subscription.created_at).toLocaleDateString('en-US', {
										year: 'numeric',
										month: 'long',
										day: 'numeric',
									})}
								</p>
							</div>
						</div>
					</div>

					{/* Quick Links */}
					<div className="bg-white shadow-xl rounded-2xl p-6 border border-gray-100">
						<h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
							Quick Links
						</h3>
						<div className="space-y-3">
							<Link
								href="/dashboard/payments"
								className="block text-blue-600 hover:text-blue-700 font-medium"
							>
								→ Payment History
							</Link>
							<Link
								href="/dashboard/orders"
								className="block text-blue-600 hover:text-blue-700 font-medium"
							>
								→ Order History
							</Link>
							<Link
								href="/dashboard"
								className="block text-blue-600 hover:text-blue-700 font-medium"
							>
								→ Browse Plans
							</Link>
						</div>
					</div>

					{subscription.status === 'active' && !subscription.cancel_at_period_end && (
						<div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
							<p className="text-sm text-blue-800">
								<span className="font-semibold">Auto-renewal enabled.</span> Your subscription
								will automatically renew on {periodEnd}.
							</p>
						</div>
					)}

					{subscription.cancel_at_period_end && (
						<div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
							<p className="text-sm text-orange-800">
								<span className="font-semibold">Cancellation scheduled.</span> Your subscription
								will end on {periodEnd}.
							</p>
						</div>
					)}
				</div>
			</div>
		</main>
	)
}
