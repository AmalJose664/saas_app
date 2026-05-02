import { getAuthUser } from '../../../../lib/auth/server'
import { getOrderById } from '../../../../lib/orders/service'
import { getPlanById } from '../../../../lib/plans/service'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, CreditCard } from 'lucide-react'
import { formatAmount } from '@workspace/utils'
import { getStatusIcon } from '@workspace/utils/react'

export default async function OrderDetailsPage(props: { params: Promise<{ id: string }> }) {
	const params = await props.params;
	const { id } = params;

	const { user } = await getAuthUser()
	if (!user) redirect('/login')

	const orderResult = await getOrderById(id)

	if (!orderResult.success || !orderResult.data) {
		return (
			<main className="max-w-4xl mx-auto px-6 py-12">
				<div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-600">
					<p className="font-semibold">Order not found</p>
					<Link href="/dashboard/orders" className="text-sm underline mt-2 inline-block">Return to orders</Link>
				</div>
			</main>
		)
	}

	const order = orderResult.data

	// Security check
	if (order.user_id !== user.id) {
		redirect('/dashboard/orders')
	}

	let plan = null
	if (order.plan_id) {
		const planResult = await getPlanById(order.plan_id)
		if (planResult.success) {
			plan = planResult.data
		}
	}

	return (
		<main className="max-w-4xl mx-auto px-6 py-12">
			{/* Back Link */}
			<Link href="/dashboard/orders" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-8 transition-colors">
				<ArrowLeft className="w-4 h-4 mr-2" />
				Back to Orders
			</Link>

			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
						<Package className="w-8 h-8 text-blue-600" />
						Order Details
					</h1>
					<p className="text-gray-500 mt-1 font-mono text-sm">ID: {order.id}</p>
				</div>
				<div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
					{getStatusIcon(order.status)}
					<span className="font-semibold text-gray-700 capitalize">{order.status || 'Pending'}</span>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				{/* Order Summary */}
				<div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
					<h2 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-3">Payment Information</h2>
					<div className="space-y-4">
						<div>
							<p className="text-sm text-gray-500">Amount Paid</p>
							<p className="text-2xl font-bold text-gray-900">{formatAmount(order.amount_paise || 0, order.currency)}</p>
						</div>

						{order.razorpay_order_id && (
							<div>
								<p className="text-sm text-gray-500">Razorpay Order ID</p>
								<p className="text-md font-mono text-gray-800">{order.razorpay_order_id}</p>
							</div>
						)}

						{order.razorpay_customer_id && (
							<div>
								<p className="text-sm text-gray-500">Customer ID</p>
								<p className="text-md font-mono text-gray-800">{order.razorpay_customer_id}</p>
							</div>
						)}

						<div>
							<p className="text-sm text-gray-500">Created At</p>
							<p className="text-md text-gray-800">
								{new Date((order as any).created_at).toLocaleString('en-US', {
									year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
								})}
							</p>
						</div>
					</div>
				</div>

				{/* Plan Details */}
				<div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
					<h2 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-3 flex items-center gap-2">
						<CreditCard className="w-5 h-5 text-gray-400" />
						Plan Data
					</h2>

					{plan ? (
						<div className="space-y-4">
							<div>
								<p className="text-sm text-gray-500">Plan Name</p>
								<p className="text-xl font-bold text-gray-900 capitalize">{plan.name}</p>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-sm text-gray-500">Interval</p>
									<p className="text-md text-gray-800 capitalize">{plan.interval}</p>
								</div>
								<div>
									<p className="text-sm text-gray-500">Base Price</p>
									<p className="text-md text-gray-800">{formatAmount(plan.amount || 0, "INR")}</p>
								</div>
							</div>
							{/* <div>
								<p className="text-sm text-gray-500">Description</p>
								<p className="text-md text-gray-800">{plan.description || 'No description provided.'}</p>
							</div> */}
						</div>
					) : (
						<div className="flex flex-col items-center justify-center h-40 text-center">
							<Package className="w-8 h-8 text-gray-300 mb-2" />
							<p className="text-gray-500">No plan data associated with this order.</p>
							{order.plan_id && (
								<p className="text-xs font-mono text-gray-400 mt-1">Plan ID: {order.plan_id}</p>
							)}
						</div>
					)}
				</div>
			</div>
		</main>
	)
}
