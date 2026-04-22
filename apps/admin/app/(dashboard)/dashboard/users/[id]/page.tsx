/**
 * @file app/(dashboard)/dashboard/users/[id]/page.tsx
 * @description User profile detail page — shows a specific user's account
 * details, subscription status, lifetime value (from orders), and
 * transaction history. Includes a toggle to activate/deactivate the user.
 *
 * Architecture:
 * UserProfilePage (Server Component)
 *   ↓ calls (parallel)
 * Users Service      → Subscriptions Service    → Orders Service
 *   ↓                   ↓                        ↓
 * Repository            Repository               Repository
 *   ↓                   ↓                        ↓
 * Supabase            Supabase                 Supabase
 *
 * ToggleUserActive (Client Component)
 *   ↓ calls
 * toggleUserActiveAction (Server Action)
 *   ↓ calls
 * Users Service → Repository → Supabase
 */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import OrdersTable from '../../orders/OrdersTable';
import StatCard from '../../../../../components/StatCard';
import { getUserById } from '../../../../../lib/users/service';
import { getSubscriptionByUserId } from '../../../../../lib/subscriptions/service';
import { getOrders } from '../../../../../lib/orders/service';
import ToggleUserActive from './ToggleUserActive';

/**
 * UserProfilePage — fetches user, subscription, and order data in parallel,
 * then renders the full profile detail view.
 *
 * @param params — Next.js route params containing the user UUID
 */
export default async function UserProfilePage({
	params,
}: {
	params: Promise<{ id: string }>
}) {
	// ─── Parallel data fetching ──────────────────────────────────
	const { id } = await params

	const [profileResult, subscriptionResult, ordersResult] = await Promise.all([
		getUserById(id),
		getSubscriptionByUserId(id),
		getOrders({ userId: id }),
	])

	if (!profileResult.success || !profileResult.data) {
		notFound()
	}

	const profile = profileResult.data
	const subscription = subscriptionResult.success ? subscriptionResult.data : null
	const orders = ordersResult.success ? ordersResult.data : []

	const totalSpentPaise = orders.reduce((acc, o) => acc + (o.amount_paise ?? 0), 0)
	const totalSpentFormatted = `₹${(totalSpentPaise / 100).toLocaleString('en-IN')}`

	return (
		<div className="min-h-screen bg-gray-50 p-8">
			<div className="max-w-6xl mx-auto mb-8">
				<nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
					<Link href="/dashboard?tab=users" className="hover:text-blue-600 transition">
						Customers
					</Link>
					<span>/</span>
					<span className="text-gray-900 font-medium">User Profile</span>
				</nav>

				<div className="flex justify-between items-end">
					<div className="flex items-center gap-5">
						<div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-2xl font-bold shadow-xl">
							{profile.full_name?.[0]?.toUpperCase() ?? 'U'}
						</div>
						<div>
							<h1 className="text-3xl font-bold text-gray-900 tracking-tight">
								{profile.full_name ?? 'Anonymous'}
							</h1>
							<p className="text-gray-500 font-medium">{profile.email}</p>
						</div>
					</div>
					<ToggleUserActive userId={profile.id} isActive={profile.is_active} />
				</div>
			</div>

			<div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
				<div className="space-y-6">
					<StatCard
						title="Lifetime Value"
						value={totalSpentFormatted}
						color="text-emerald-600"
					/>

					<div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
						<h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
							Account Details
						</h3>
						<div className="space-y-4">
							<div>
								<label className="text-xs text-gray-400 block mb-1">Status</label>
								<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${profile.is_active
									? 'bg-emerald-50 text-emerald-700'
									: 'bg-red-50 text-red-700'
									}`}>
									{profile.is_active ? 'Active' : 'Inactive'}
								</span>
							</div>
							<div>
								<label className="text-xs text-gray-400 block mb-1">Role</label>
								<p className="text-sm font-semibold text-gray-800 uppercase">{profile.role}</p>
							</div>
							<div>
								<label className="text-xs text-gray-400 block mb-1">Joined</label>
								<p className="text-sm font-semibold text-gray-800">
									{new Date(profile.created_at).toLocaleDateString('en-IN', {
										day: 'numeric',
										month: 'long',
										year: 'numeric',
									})}
								</p>
							</div>
						</div>
					</div>
				</div>

				<div className="lg:col-span-2 space-y-6">
					<div className="bg-slate-900 rounded-2xl p-6 text-white shadow-2xl shadow-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-xl">
								💳
							</div>
							<div>
								<h4 className="text-sm font-bold text-blue-400 uppercase tracking-tighter">
									Current Plan
								</h4>
								<p className="text-xl font-bold">
									{subscription?.plan?.name ?? 'No Active Plan'}
								</p>
							</div>
						</div>

						<div className="text-right md:text-left">
							<p className="text-xs text-slate-400 uppercase font-bold">Billing cycle</p>
							<p className="text-sm font-medium capitalize">
								{subscription?.plan?.interval ?? 'N/A'}
							</p>
						</div>

						<div className="flex flex-col items-end">
							<p className="text-2xl font-bold">
								{subscription?.plan
									? `₹${(subscription.plan.amount / 100).toLocaleString('en-IN')}`
									: '—'}
							</p>
							<p className="text-xs text-slate-400">
								{subscription?.plan ? `per ${subscription.plan.interval}` : ''}
							</p>
						</div>
					</div>

					<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
						<div className="px-6 py-4 border-b border-gray-100">
							<h3 className="font-bold text-gray-800">Transaction History</h3>
						</div>
						<OrdersTable userId={id} limit={10} />
					</div>
				</div>
			</div>
		</div>
	)
}
