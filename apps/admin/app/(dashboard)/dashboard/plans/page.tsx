import Link from 'next/link'
import DeletePlanButton from '../../../../components/DeletePlan'
import { getAllPlans } from '../../../../lib/plans/service'

export default async function ManagePlans() {
	const result = await getAllPlans()

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
		<div className="min-h-screen bg-slate-50 p-8">
			<div className="max-w-6xl mx-auto">
				<div className="flex justify-between items-center mb-8">
					<div>
						<h1 className="text-2xl font-bold text-slate-900">Subscription Plans</h1>
						<p className="text-slate-500">Configure tiers for your Razorpay integration</p>
					</div>
					<Link
						href="/dashboard/plans/add"
						className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm"
					>
						+ Create New Plan
					</Link>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{plans.map((plan) => (
						<div key={plan.id} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col">
							<div className="flex justify-between items-start mb-4">
								<div>
									<h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
									<span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded ${plan.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
										}`}>
										{plan.is_active ? 'Active' : 'Inactive'}
									</span>
								</div>
								<div className="text-right">
									<p className="text-2xl font-black text-slate-900">₹{plan.amount / 100}</p>
									<p className="text-xs text-slate-400 capitalize">{plan.interval}</p>
								</div>
							</div>

							<div className="space-y-3 mt-4 flex-1">
								<div className="text-xs">
									<span className="text-slate-400 block mb-1">Razorpay Plan ID</span>
									<code className="bg-slate-50 p-1.5 rounded block border border-slate-100 text-slate-600 break-all">
										{plan.razorpay_plan_id || 'Not Linked'}
									</code>
								</div>
							</div>

							<div className="mt-6 pt-4 border-t border-slate-50 flex gap-3">
								<Link
									href={'/dashboard/plans/edit/' + plan.id}
									className="flex-1 text-center text-sm font-medium py-2 border border-slate-200 rounded hover:bg-slate-50 transition"
								>
									Edit
								</Link>
								<Link
									href={'/dashboard/plans/' + plan.id}
									className="flex-1 text-sm text-center font-medium py-2 border border-slate-200 rounded hover:bg-slate-50 transition"
								>
									View
								</Link>
								<DeletePlanButton planId={plan.id} />
							</div>
						</div>
					))}

					{plans.length === 0 && (
						<div className="col-span-full bg-white border-2 border-dashed border-slate-200 rounded-xl p-12 text-center">
							<p className="text-slate-500">No plans created yet.</p>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
