import { createClient } from '@myapp/supabase/server';
import Link from 'next/link';
import DeletePlanButton from '../../../../components/DeletePlan';
interface Plan {
	id: string
	name: string
	amount: number
	interval: string
	is_active: boolean
	razorpay_plan_id: string | null
}
export default async function Page({
	params
}: {
	params: { id: string }
}) {
	const { id } = await params
	const supabase = await createClient()
	const { data: plans, error } = await supabase
		.from('Plan')
		.select('*')
		.order('created_at', { ascending: false })
		.eq('id', id)


	if (error) {
		return <div className="p-8 text-red-500">Error loading plans: {error.message}</div>
	}

	return (
		<div className="min-h-screen bg-slate-50 p-8">
			<div className="max-w-5xl mx-auto">
				<div className="flex justify-between items-center mb-8">
					<div>
						<h1 className="text-3xl font-bold text-slate-900">Subscription Plans</h1>
						<p className="text-slate-500">Manage pricing tiers</p>
					</div>
					<Link
						href="/plans/add"
						className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition shadow-sm"
					>
						+ Create Another Plan
					</Link>
				</div>

				{!plans || plans.length === 0 ? (
					<div className="bg-white border border-dashed border-slate-300 rounded-xl py-20 text-center">
						<p className="text-slate-500">No plans found.</p>
					</div>
				) : (
					<div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
						<table className="w-full text-left border-collapse">
							<thead>
								<tr className="bg-slate-50 border-b border-slate-200">
									<th className="p-4 text-sm font-semibold text-slate-600">Plan Name</th>
									<th className="p-4 text-sm font-semibold text-slate-600">Price</th>
									<th className="p-4 text-sm font-semibold text-slate-600">Interval</th>
									<th className="p-4 text-sm font-semibold text-slate-600">Status</th>
									<th className="p-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
								</tr>
							</thead>
							<tbody>
								{plans.map((plan: Plan) => (
									<tr key={plan.id} className="border-t border-slate-100 hover:bg-slate-50 transition">
										<td className="p-4">
											<div className="font-medium text-slate-900">{plan.name}</div>
											<div className="text-xs text-slate-400 font-mono">{plan.razorpay_plan_id || '---'}</div>
										</td>
										<td className="p-4 text-slate-700">₹{plan.amount / 100}</td>
										<td className="p-4 text-slate-700 capitalize">{plan.interval}</td>
										<td className="p-4">
											<span className={`px-2 py-1 rounded-full text-xs font-medium ${plan.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
												}`}>
												{plan.is_active ? 'Active' : 'Inactive'}
											</span>
										</td>
										<td className="p-4 text-right space-x-4">
											<Link
												href={`/plans/edit/${plan.id}`}
												className="text-blue-600 hover:text-blue-800 text-sm font-medium"
											>
												Edit
											</Link>
											{/* We use a small Client Component for the Delete button since it needs an onClick handler */}
											<DeletePlanButton planId={plan.id} />
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	)
}


