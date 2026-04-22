import Link from 'next/link'
import OrdersTable from './orders/OrdersTable'
import SubscriptionsTable from './subscriptions/SubscriptionsTable'
import UsersTable from './users/UsersTable'
import StatCard from '../../../components/StatCard'
import { getDashboardStats } from '../../../lib/dashboard/service'

const TABS = [
	{ key: 'overview', label: 'Overview' },
	{ key: 'users', label: 'Users' },
	{ key: 'subscriptions', label: 'Subscriptions' },
]

export default async function Dashboard({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
	const resolvedSearchParams = await searchParams

	const currentTab = (resolvedSearchParams.tab as string) || 'overview'
	const search = (resolvedSearchParams.search as string) || ''
	const page = parseInt((resolvedSearchParams.page as string) || '1', 10)

	const statsResult = await getDashboardStats()
	const stats = statsResult.success
		? statsResult.data
		: { userCount: 0, orderCount: 0, formattedRevenue: '₹0' }

	return (
		<>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
				<StatCard
					title="Total Customers"
					value={stats.userCount.toLocaleString('en-IN')}
					color="text-blue-600"
					trend="+12%"
				/>
				<StatCard
					title="Total Orders"
					value={stats.orderCount.toLocaleString('en-IN')}
					color="text-slate-900"
					trend="+5%"
				/>
				<StatCard
					title="Gross Revenue"
					value={stats.formattedRevenue}
					color="text-emerald-600"
					trend="+18%"
				/>
			</div>

			{/* <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
				{TABS.map((tab) => (
					<Link
						key={tab.key}
						href={`/dashboard?tab=${tab.key}`}
						className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentTab === tab.key
								? 'bg-white text-gray-900 shadow-sm'
								: 'text-gray-500 hover:text-gray-700'
							}`}
					>
						{tab.label}
					</Link>
				))}
			</div> */}

			{currentTab === 'overview' && (
				<div className="bg-white rounded-xl shadow-sm border border-gray-200">
					<div className="p-6 border-b border-gray-100">
						<h3 className="font-semibold text-gray-800">Recent Transactions</h3>
					</div>
					<OrdersTable limit={5} />
				</div>
			)}

			{/* {currentTab === 'users' && (
				<UsersTable search={search} page={page} />
			)}

			{currentTab === 'subscriptions' && (
				<SubscriptionsTable />
			)} */}
		</>
	)
}
