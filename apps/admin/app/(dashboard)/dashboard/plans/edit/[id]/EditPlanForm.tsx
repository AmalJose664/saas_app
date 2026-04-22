'use client'

import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { updatePlanAction } from '../../../../../../lib/plans/actions'
import type { ActionResult } from '../../../../../../lib/plans/actions'

interface DefaultValues {
	name: string
	amount: string
	interval: string
	razorpay_plan_id: string
	is_active: boolean
}

interface Props {
	id: string
	defaultValues: DefaultValues
}

const initialState: ActionResult = { success: true }

export default function EditPlanForm({ id, defaultValues }: Props) {
	const router = useRouter()
	const [state, formAction, isPending] = useActionState(updatePlanAction, initialState)

	const fieldErrors = !state.success ? (state.fieldErrors ?? {}) : {}

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

					{!state.success && state.error && !state.fieldErrors && (
						<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
							{state.error}
						</div>
					)}

					<form action={formAction} className="space-y-6">
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
							<input type="hidden" name="is_active" value="false" />
							<input
								type="checkbox"
								id="is_active"
								name="is_active"
								value="true"
								defaultChecked={defaultValues.is_active}
								className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
							/>
							<label htmlFor="is_active" className="text-sm font-medium text-slate-700">
								Set as Active (Visible to users)
							</label>
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
	)
}
