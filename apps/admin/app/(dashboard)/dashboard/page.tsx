import Link from 'next/link';
import { createClient } from '@myapp/supabase/server';
import Logout from '@repo/ui/Logout';
import OrdersTable from './OrdersTable';
import SubscriptionsTable from './SubscriptionsTable';
import UsersTable from './UsersTable';
import StatCard from './StatCard';

export default async function Dashboard({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined };
}) {
	const resolvedSearchParams = await searchParams;
	const supabase = await createClient();
	const currentTab = (resolvedSearchParams.tab as string) || 'overview';

	const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
	const { count: orderCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
	const { data: revenueData } = await supabase.from('orders').select('amount');
	const totalRevenue = revenueData?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;

	return (
		<div className="flex h-screen bg-gray-50">

			<aside className="w-64 bg-slate-900 text-slate-300 hidden md:flex flex-col border-r border-slate-800">
				<div className="p-6 text-white text-xl font-bold tracking-tight border-b border-slate-800 flex items-center gap-2">
					<div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-sm">S</div>
					Admin Portal
				</div>
				<nav className="flex-1 p-4 space-y-1">
					<NavItem href="?tab=overview" active={currentTab === 'overview'} label="Overview" icon="📊" />
					<NavItem href="?tab=users" active={currentTab === 'users'} label="Customers" icon="👥" />
					<NavItem href="?tab=orders" active={currentTab === 'orders'} label="Orders" icon="📦" />
					<NavItem href="?tab=subscriptions" active={currentTab === 'subscriptions'} label="Subscriptions" icon="💳" />
					<NavItem href="/plans" active={false} label="Manage Plans" icon="" />
				</nav>
			</aside>

			<div className="flex-1 flex flex-col overflow-hidden">
				<header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
					<h2 className="text-lg font-medium text-gray-700 capitalize">{currentTab}</h2>
					<Logout />
				</header>

				<main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
					{currentTab === 'overview' && (
						<>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
								<StatCard title="Total Customers" value={userCount?.toLocaleString() || '0'} color="text-blue-600" trend="+12%" />
								<StatCard title="Total Orders" value={orderCount?.toLocaleString() || '0'} color="text-slate-900" trend="+5%" />
								<StatCard title="Gross Revenue" value={`$${totalRevenue.toLocaleString()}`} color="text-emerald-600" trend="+18%" />
							</div>

							<div className="bg-white rounded-xl shadow-sm border border-gray-200">
								<div className="p-6 border-b border-gray-100">
									<h3 className="font-semibold text-gray-800">Recent Transactions</h3>
								</div>
								<OrdersTable limit={5} />
							</div>
						</>
					)}

					{currentTab === 'users' && <UsersTable />}
					{currentTab === 'orders' && <OrdersTable />}
					{currentTab === 'subscriptions' && <SubscriptionsTable />}
				</main>
			</div>
		</div>
	);
}

function NavItem({ href, active, label, icon }: { href: string; active: boolean; label: string; icon: string }) {
	return (
		<Link
			href={href}
			className={`flex items-center gap-3 py-2.5 px-4 rounded-lg transition-all duration-200 ${active
				? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
				: 'hover:bg-slate-800 hover:text-white'
				}`}
		>
			<span>{icon}</span>
			<span className="font-medium text-sm">{label}</span>
		</Link>
	);
}