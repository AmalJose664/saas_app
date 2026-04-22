'use client'
import Link from 'next/link';
import NavCard from '../components/NavCard';

export default function AdminDashboardHome() {
	return (
		<div className="min-h-screen bg-slate-50 p-8">
			<div className="max-w-5xl mx-auto">
				<div className="flex justify-between items-center mb-12">
					<div>
						<h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
						<p className="text-slate-600 mt-2">
							Simple Subscription Service Tracking Page
						</p>
					</div>
					<div className='flex gap-4 items-center'>
						<button className="px-4 bg-blue-500 py-2 rounded-md">
							<Link href={"/dashboard"}>Dashboard</Link>
						</button>
						<button className="px-4 bg-blue-500 py-2 rounded-md">
							<Link href={"/login"}>Login</Link>
						</button>
					</div>
				</div>

				<h2 className="text-xl font-semibold text-slate-800 mb-6">Quick Management</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">

					<NavCard
						title="Users"
						description="Manage user profiles, roles, and view individual histories."
						href="/dashboard/users"
						color="bg-blue-50"
						borderColor="border-blue-200"
						textColor="text-blue-700"
					/>

					<NavCard
						title="Subscriptions"
						description="Track active, canceled, and past-due subscriptions."
						href="/dashboard/subscriptions"
						color="bg-indigo-50"
						borderColor="border-indigo-200"
						textColor="text-indigo-700"
					/>

					<NavCard
						title="Orders"
						description="View payment history, invoices, and failed transactions."
						href="/dashboard/orders"
						color="bg-emerald-50"
						borderColor="border-emerald-200"
						textColor="text-emerald-700"
					/>

					<NavCard
						title="Plans"
						description="Create or edit pricing tiers, features, and active status."
						href="/dashboard/plans"
						color="bg-purple-50"
						borderColor="border-purple-200"
						textColor="text-purple-700"
					/>

				</div>
			</div>
		</div>
	);
}

