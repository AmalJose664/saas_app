import { createClient } from '@myapp/supabase/server';
import Link from 'next/link';
import OrdersTable from '../../orders/OrdersTable';
import StatCard from '../../../../../components/StatCard';

export default async function UserProfilePage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const supabase = await createClient();


	const { data: profile } = await supabase
		.from('profiles')
		.select('*')
		.eq('id', id)
		.single();


	const { data: subscription } = await supabase
		.from('subscriptions')
		.select('*, Plan(*)')
		.eq('user_id', id)
		.maybeSingle();

	const { data: orders } = await supabase
		.from('orders')
		.select('amount')
		.eq('user_id', id);

	const totalSpent = orders?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;

	if (!profile) return <div className="p-10 text-gray-500 text-center">User not found.</div>;

	return (
		<div className="min-h-screen bg-gray-50 p-8">
			<div className="max-w-6xl mx-auto mb-8">
				<nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
					<Link href="/dashboard?tab=users" className="hover:text-blue-600 transition">Customers</Link>
					<span>/</span>
					<span className="text-gray-900 font-medium">User Profile</span>
				</nav>

				<div className="flex justify-around items-end">
					<div className="flex items-center gap-5">
						<div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-2xl font-bold shadow-xl">
							{profile.full_name?.[0].toUpperCase() || 'U'}
						</div>
						<div>
							<h1 className="text-3xl font-bold text-gray-900 tracking-tight">{profile.full_name}</h1>
							<p className="text-gray-500 font-medium">{profile.email}</p>
						</div>
					</div>

				</div>
			</div>

			<div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
				<div className="space-y-6">
					<StatCard title="Lifetime Value" value={`$${totalSpent.toLocaleString()}`} color="text-emerald-600" />

					<div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
						<h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Account Details</h3>
						<div className="space-y-4">
							<div>
								<label className="text-xs text-gray-400 block mb-1">Status</label>
								<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${profile.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
									}`}>
									{profile.is_active ? 'Active' : 'Inactive'}
								</span>
							</div>
							<div>
								<label className="text-xs text-gray-400 block mb-1">Joined</label>
								<p className="text-sm font-semibold text-gray-800">{new Date(profile.created_at).toLocaleDateString()}</p>
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
								<h4 className="text-sm font-bold text-blue-400 uppercase tracking-tighter">Current Plan</h4>
								<p className="text-xl font-bold">
									{subscription?.Plan?.name || 'No Active Plan'}
								</p>
							</div>
						</div>

						<div className="text-right md:text-left">
							<p className="text-xs text-slate-400 uppercase font-bold">Billing cycle</p>
							<p className="text-sm font-medium">
								{subscription?.next_billing_date
									? `Next bill on ${new Date(subscription.next_billing_date).toLocaleDateString()}`
									: 'N/A'}
							</p>
						</div>

						<div className="flex flex-col items-end">
							<p className="text-2xl font-bold">${subscription?.Plan?.price || 0}</p>
							<p className="text-xs text-slate-400">per month</p>
						</div>
					</div>

					<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
						<div className="px-6 py-4 border-b border-gray-100">
							<h3 className="font-bold text-gray-800">Transaction History</h3>
						</div>
						<OrdersTable limit={10} />
					</div>
				</div>
			</div>
		</div>
	);
}