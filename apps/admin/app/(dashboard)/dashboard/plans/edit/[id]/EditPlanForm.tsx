/**
 * @file app/(dashboard)/dashboard/plans/edit/[id]/EditPlanForm.tsx
 * @description Client-side form for editing an existing subscription plan.
 * Uses the useUpdatePlan hook (TanStack Query) which calls the server action internally.
 * Receives pre-populated default values from the server component wrapper.
 *
 * Architecture:
 * EditPlanForm (Client Component — 'use client')
 *   ↓ onSubmit → FormData
 * useUpdatePlan hook (lib/plans/hooks.ts)
 *   ↓ calls
 * Server Action (lib/plans/actions.ts::updatePlanAction)
 *   ↓ validates (Zod)
 *   ↓ calls
 * Plans Service (lib/plans/service.ts::updatePlan)
 *   ↓ converts ₹ → paise (×100)
 *   ↓ calls
 * Plans Repository (lib/plans/repository.ts::dbUpdatePlan)
 *   ↓ calls
 * Supabase Server Client
 *
 * On success → hook invalidates cache + navigates to /dashboard/plans
 */

'use client';

import { useRouter } from 'next/navigation';
import { useUpdatePlan, PlanActionError } from '../../../../../../lib/plans/hooks';
import { useState } from 'react'
import { CircleMinus, Plus } from 'lucide-react';

/** Shape of the pre-populated default values passed from the server */
interface DefaultValues {
	/** Plan name */
	name: string;
	/** Plan amount in ₹ (displayed in the form, converted to paise on save) */
	amount: string;
	/** Billing interval (daily, weekly, monthly, yearly) */
	interval: string;
	/** Optional Razorpay plan ID */
	razorpay_plan_id: string;
	/** Whether the plan is visible to customers */
	is_active: boolean;
	features: string[] | null
}

/** Props passed from the EditPlanPage server component */
interface EditPlanFormProps {
	/** Supabase plan ID (UUID) */
	id: string;
	/** Pre-populated form values fetched from the database */
	defaultValues: DefaultValues;
}

/**
 * EditPlanForm — client-side form for updating a subscription plan.
 *
 * @param id — plan UUID
 * @param defaultValues — pre-populated values from the server
 */
export default function EditPlanForm({ id, defaultValues }: EditPlanFormProps) {
	const router = useRouter();
	const { mutate, isPending, error } = useUpdatePlan();
	const [features, setFeatures] = useState(defaultValues.features || [])

	const fieldErrors = error instanceof PlanActionError ? (error.fieldErrors ?? {}) : {};
	const globalError = error && !(error instanceof PlanActionError && error.fieldErrors)
		? error.message
		: null;

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		mutate(formData);
	};

	return (
		<div className="min-h-screen bg-slate-50 p-8">
			<div className="max-w-2xl mx-auto">
				<button
					type="button"
					onClick={() => router.back()}
					className="text-sm text-slate-500 hover:text-slate-800 mb-4 flex items-center gap-1"
				>
					← Back
				</button>

				<div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
					<h1 className="text-2xl font-bold text-slate-900 mb-6">Edit Subscription Plan</h1>

					{globalError && (
						<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
							{globalError}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-6">
						<input type="hidden" name="id" value={id} />

						<div>
							<label className="block text-sm font-medium text-slate-700 mb-1">Plan Name</label>
							<input
								name="name"
								type="text"
								required
								defaultValue={defaultValues.name}
								placeholder="e.g. Pro Monthly"
								className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
							/>
							{fieldErrors.name && <p className="text-xs text-red-500 mt-1">{fieldErrors.name}</p>}
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-slate-700 mb-1">Amount (in ₹)</label>
								<input
									name="amount"
									type="number"
									required
									min="1"
									step="0.01"
									defaultValue={defaultValues.amount}
									placeholder="499"
									className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
								/>
								{fieldErrors.amount && <p className="text-xs text-red-500 mt-1">{fieldErrors.amount}</p>}
							</div>
							<div>
								<label className="block text-sm font-medium text-slate-700 mb-1">Interval</label>
								<select
									name="interval"
									defaultValue={defaultValues.interval}
									className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
								>
									<option value="daily">Daily</option>
									<option value="weekly">Weekly</option>
									<option value="monthly">Monthly</option>
									<option value="yearly">Yearly</option>
								</select>
								{fieldErrors.interval && <p className="text-xs text-red-500 mt-1">{fieldErrors.interval}</p>}
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-slate-700 mb-1">Razorpay Plan ID (Optional)</label>
							<input
								name="razorpay_plan_id"
								type="text"
								defaultValue={defaultValues.razorpay_plan_id}
								placeholder="plan_K9v..."
								className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
							/>
							{fieldErrors.razorpay_plan_id && <p className="text-xs text-red-500 mt-1">{fieldErrors.razorpay_plan_id}</p>}
						</div>

						<div className="flex items-center gap-3">
							<input
								type="checkbox"
								id="is_active"
								name="is_active"
								defaultChecked={defaultValues.is_active}
								className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
							/>
							<label htmlFor="is_active" className="text-sm font-medium text-slate-700">
								Set as Active (Visible to users)
							</label>
						</div>
						<div>
							<div className='flex items-center justify-between pb-2'>
								<label className="block text-sm font-medium text-slate-700 mb-1">Features (Optional)</label>
								<button className='flex border w-fit rounded-md py-2 px-3 shadow-md items-center gap-4' type='button' onClick={() => setFeatures(prev => [...prev, ""])}>
									<span className='text-xs'>Add Features</span>
									<Plus size={16} />
								</button>
							</div>
							<div className='mt-4'>
								{features?.map((f, i) => (
									<div key={i} className='flex items-center justify-between gap-4 mb-2'>
										<input
											name="features[]"
											type="text"
											defaultValue={f}
											className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
										/>
										<button className='border w-fit rounded-md py-2 px-3 shadow-md' type='button'
											onClick={() => setFeatures(prev => prev.filter((str, indx) => indx !== i))}>
											<CircleMinus size={16} />
										</button>
									</div>
								))}
							</div>
						</div>

						<hr className="border-slate-100" />

						<button
							type="submit"
							disabled={isPending}
							className={`w-full py-3 px-4 rounded-lg font-bold text-white transition ${isPending ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
								}`}
						>
							{isPending ? 'Updating...' : 'Update Plan'}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
