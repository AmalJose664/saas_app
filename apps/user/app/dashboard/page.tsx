/**
 * @file app/dashboard/page.tsx
 * @description Dashboard page — displays active subscription plans for purchase.
 *
 * Server Component. Fetches all active plans via the plans service and
 * renders them as a pricing grid. The "Get Started" button will trigger
 * the Razorpay payment flow (to be implemented).
 *
 * Protected by middleware — unauthenticated users are redirected to /login.
 */
import { getAllPlans } from '../../lib/plans/service'

interface Plan {
	id: string
	name: string
	amount: number
	interval: string
	razorpay_plan_id: string | null
}

export default async function DashboardPage() {
	const result = await getAllPlans();
	if (!result.success) {
		return (
			<div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-600">
				<p className="font-semibold">Error loading plans</p>
				<p className="text-sm">{result.error}</p>
			</div>
		)
	}
	const plans = result.data
	return (
		<main className="max-w-7xl mx-auto px-6 py-12">
			<div className="text-center mb-12">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
				<p className="text-gray-600">Choose a plan that fits your needs to get started.</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
				{plans && plans.map((plan) => (
					<div
						key={plan.id}
						className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 flex flex-col h-full"
					>
						<div className="mb-6">
							<h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">
								{plan.name}
							</h2>
							<div className="mt-4 flex items-baseline">
								<span className="text-4xl font-extrabold text-gray-900">
									₹{plan.amount}
								</span>
								<span className="ml-1 text-gray-500 text-sm">
									/{plan.interval}
								</span>
							</div>
						</div>

						<ul className="space-y-4 mb-8 flex-grow text-gray-600">
							<li className="flex items-center gap-2">
								<svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
								</svg>
								Access to all features
							</li>
							<li className="flex items-center gap-2">
								<svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
								</svg>
								Priority Support
							</li>
						</ul>

						<button
							className={`w-full py-3 px-4 rounded-lg font-semibold shadow-md transition-all ${plan.name.toLowerCase().includes('pro')
								? "bg-blue-600 text-white hover:bg-blue-700"
								: "bg-gray-100 text-gray-800 hover:bg-gray-200"
								}`}
						>
							Get Started
						</button>
					</div>
				))}
			</div>
		</main>
	)
}