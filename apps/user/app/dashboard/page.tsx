/**
 * @file app/dashboard/page.tsx
 * @description Dashboard page — displays active subscription plans or premium content.
 */
import Link from 'next/link';
import PlanCard from '../../components/PlanCard';
import { getAllPlans } from '../../lib/plans/service'
import { getAuthUser } from '../../lib/auth/server'
import { getCurrentSubscription } from '../../lib/subscriptions/service'
import { Crown, Zap, Shield, Rocket } from 'lucide-react'

export default async function DashboardPage() {
	const { user } = await getAuthUser()
	if (!user) return null;

	const [plansResult, subResult] = await Promise.all([
		getAllPlans(),
		getCurrentSubscription(user.id, true)
	])

	const isPro = user.user_metadata?.role === 'pro'

	if (isPro) {
		return (
			<main className="max-w-7xl mx-auto px-6 py-12">
				<div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
					<div>
						<h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
							Welcome to Premium <Crown className="text-yellow-500 w-8 h-8" />
						</h1>
						<p className="text-gray-600">You are currently enjoying the benefits of a pro subscription.</p>
					</div>
					<Link
						href="/dashboard/subscription"
						className="px-6 py-3 bg-white border border-gray-200 shadow-sm rounded-xl font-semibold text-gray-800 hover:bg-gray-50 transition"
					>
						Manage Subscription
					</Link>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
					<div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
						<Zap className="w-8 h-8 mb-4 opacity-80" />
						<h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
						<p className="text-blue-100 text-sm">Your requests are prioritized on our high-performance infrastructure.</p>
					</div>
					<div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
						<Shield className="w-8 h-8 mb-4 opacity-80" />
						<h3 className="text-xl font-bold mb-2">Advanced Security</h3>
						<p className="text-purple-100 text-sm">Enhanced data protection and priority support available 24/7.</p>
					</div>
					<div className="bg-gradient-to-br from-gray-800 to-black rounded-2xl p-6 text-white shadow-lg">
						<Rocket className="w-8 h-8 mb-4 opacity-80" />
						<h3 className="text-xl font-bold mb-2">Exclusive Features</h3>
						<p className="text-gray-300 text-sm">Early access to new tools and premium content updates.</p>
					</div>
				</div>

				<div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-xl">
					<h2 className="text-2xl font-bold text-gray-900 mb-4">Your Recent Activity</h2>
					<div className="h-48 border-2 border-dashed border-gray-100 rounded-xl flex items-center justify-center text-gray-400">
						Activity metrics will appear here soon
					</div>
				</div>
			</main>
		)
	}

	if (!plansResult.success) {
		return (
			<div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-600 m-6">
				<p className="font-semibold">Error loading plans</p>
				<p className="text-sm">{plansResult.error}</p>
			</div>
		)
	}

	const plans = plansResult.data

	return (
		<main className="max-w-7xl mx-auto px-6 py-12">
			<div className="text-center mb-12">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">Upgrade to Pro</h1>
				<p className="text-gray-600 max-w-2xl mx-auto">Choose a plan that fits your needs to unlock premium features, advanced security, and priority support.</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
				{plans && plans.map((plan) => (
					<PlanCard plan={plan} key={plan.id} />
				))}
			</div>
		</main>
	)
}