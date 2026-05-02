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
 * Supabase Server Client (@workspace/supabase/server)
 *
 * Previously this page queried Supabase directly (bypassing the service layer).
 * That violated the architecture and duplicated logic. It now goes through
 * the standard getPlanById service, which handles error wrapping and type safety.
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import DeletePlanButton from '../../../../../components/DeletePlan';
import { getPlanById } from '../../../../../lib/plans/service';
import { ArrowLeft, Calendar, Pen, SquareKanban } from 'lucide-react';

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
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<div className="flex justify-between items-center mb-8">
					<div className="flex items-center space-x-4">
						<Link href="/dashboard/plans" className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition text-slate-500 shadow-sm">
							<ArrowLeft />
						</Link>
						<div>
							<h1 className="text-3xl font-bold text-slate-900">Plan Details</h1>
							<p className="text-slate-500">View and manage subscription tier</p>
						</div>
					</div>
					<Link
						href="/dashboard/plans/add"
						className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-md"
					>
						+ Create Another Plan
					</Link>
				</div>

				{/* Plan Detail Card */}
				<div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden flex flex-col md:flex-row">

					<div className="p-8 md:p-10 md:w-2/3 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-center relative">
						<div className="absolute top-0 right-0 p-8 opacity-5">
							<SquareKanban size={200} />
						</div>

						<div className="relative z-10">
							<div className="flex items-center space-x-3 mb-6">
								<span
									className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase shadow-sm ${plan.is_active
										? 'bg-green-100 text-green-700 border border-green-200'
										: 'bg-slate-100 text-slate-600 border border-slate-200'
										}`}
								>
									{plan.is_active ? 'Active Plan' : 'Inactive'}
								</span>
								<span className="text-xs text-slate-500 font-mono bg-slate-50 border border-slate-200 px-2 py-1 rounded-md shadow-sm">
									ID: {plan.razorpay_plan_id || 'Not synced'}
								</span>
							</div>

							<h2 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">{plan.name}</h2>

							<div className="flex items-baseline space-x-2 mt-6">
								<span className="text-5xl font-black text-slate-900 tracking-tighter">₹{plan.amount / 100}</span>
								<span className="text-xl text-slate-500 font-medium lowercase">/ {plan.interval}</span>
							</div>

							<div className="mt-10 pt-6 border-t border-slate-100 text-slate-500 flex items-center space-x-2">
								<Calendar />
								<span className="text-sm font-medium">Created on {new Date(plan.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
							</div>
						</div>
					</div>

					{/* Right Section: Actions */}
					<div className="p-8 md:p-10 md:w-1/3 bg-slate-50/80 flex flex-col justify-center">
						<h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 text-center md:text-left">Quick Actions</h3>
						<div className="space-y-4">
							<Link
								href={`/dashboard/plans/edit/${plan.id}`}
								className="w-full flex justify-center items-center px-4 py-3.5 bg-white border border-slate-200 text-slate-700 hover:text-blue-700 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md rounded-xl font-semibold transition-all shadow-sm"
							>
								<Pen size={16} className='mr-4' />
								Edit Plan
							</Link>
							<div className="w-full flex justify-center items-center bg-white border border-red-100 rounded-xl shadow-sm overflow-hidden hover:border-red-300 hover:shadow-md transition-all group">
								<div className="w-full [&>button]:w-full [&>button]:py-3.5 [&>button]:rounded-none [&>button]:font-semibold group-hover:[&>button]:bg-red-50">
									<DeletePlanButton planId={plan.id} />
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}


