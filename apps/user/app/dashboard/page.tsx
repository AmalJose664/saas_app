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
import PlanCard from '../../components/PlanCard';
import { getAllPlans } from '../../lib/plans/service'



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
					<PlanCard plan={plan} key={plan.id} />
				))}
			</div>
		</main>
	)
}