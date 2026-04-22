/**
 * @file app/(dashboard)/dashboard/plans/[id]/page.tsx
 * @description Plan detail page — shows a single subscription plan in a table
 * with Edit and Delete actions.
 *
 * Architecture (correctly follows the 3-layer pattern):
 * Server Component (this)
 *   ↓ calls
 * Service (lib/plans/service.ts::getPlanById)
 *   ↓ calls
 * Repository (lib/plans/repository.ts::dbGetPlanById)
 *   ↓ calls
 * Supabase Server Client (@myapp/supabase/server)
 *
 * Previously this page queried Supabase directly (bypassing the service layer).
 * That violated the architecture and duplicated logic. It now goes through
 * the standard getPlanById service, which handles error wrapping and type safety.
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import DeletePlanButton from '../../../../../components/DeletePlan';
import { getPlanById } from '../../../../../lib/plans/service';

/**
 * PlanDetailPage — server component that fetches one plan by ID.
 *
 * @param params — Next.js route params containing the plan UUID
 */
export default async function PlanDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;

	// ─── Fetch through the service layer ──────────────────────────
	const result = await getPlanById(id);

	if (!result.success) {
		return (
			<div className="p-8 bg-red-50 border border-red-200 rounded-lg text-red-600">
				<p className="font-semibold">Error loading plan</p>
				<p className="text-sm">{result.error}</p>
			</div>
		);
	}

	const plan = result.data;

	// If the service returns success but no data, treat as 404
	if (!plan) {
		notFound();
	}

	// ─── Render ──────────────────────────────────────────────────
	return (
		<div className="min-h-screen bg-slate-50 p-8">
			<div className="max-w-5xl mx-auto">
				{/* Header */}
				<div className="flex justify-between items-center mb-8">
					<div>
						<h1 className="text-3xl font-bold text-slate-900">Subscription Plans</h1>
						<p className="text-slate-500">Manage pricing tiers</p>
					</div>
					<Link
						href="/dashboard/plans/add"
						className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition shadow-sm"
					>
						+ Create Another Plan
					</Link>
				</div>

				{/* Single plan detail table */}
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
							<tr className="border-t border-slate-100 hover:bg-slate-50 transition">
								<td className="p-4">
									<div className="font-medium text-slate-900">{plan.name}</div>
									<div className="text-xs text-slate-400 font-mono">{plan.razorpay_plan_id || '---'}</div>
								</td>
								<td className="p-4 text-slate-700">₹{plan.amount / 100}</td>
								<td className="p-4 text-slate-700 capitalize">{plan.interval}</td>
								<td className="p-4">
									<span
										className={`px-2 py-1 rounded-full text-xs font-medium ${
											plan.is_active
												? 'bg-green-100 text-green-700'
												: 'bg-slate-100 text-slate-600'
										}`}
									>
										{plan.is_active ? 'Active' : 'Inactive'}
									</span>
								</td>
								<td className="p-4 text-right space-x-4">
									<Link
										href={`/dashboard/plans/edit/${plan.id}`}
										className="text-blue-600 hover:text-blue-800 text-sm font-medium"
									>
										Edit
									</Link>
									<DeletePlanButton planId={plan.id} />
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}


