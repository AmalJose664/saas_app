"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@myapp/supabase'
import { useRouter } from 'next/navigation'
import { updatePlanSchema } from '@repo/validations'
import { toast } from 'sonner'

const EditPlan = ({ id }: { id: string }) => {
	const supabase = createClient()
	const router = useRouter()

	const [loading, setLoading] = useState(false)
	const [fetching, setFetching] = useState(true)
	const [errors, setErrors] = useState<Record<string, string>>({})
	const [formData, setFormData] = useState({
		name: '',
		amount: '',
		interval: 'monthly',
		razorpayPlanId: '',
		isActive: true
	})

	useEffect(() => {
		const fetchPlan = async () => {
			try {
				const { data, error } = await supabase
					.from('plan')
					.select('*')
					.eq('id', id)
					.single()

				if (error) throw error

				if (data) {
					setFormData({
						name: data.name,
						// Convert cents back to main currency unit for the input field
						amount: (data.amount / 100).toString(),
						interval: data.interval,
						razorpayPlanId: data.razorpay_plan_id || '',
						isActive: data.is_active
					})
				}
			} catch (error: any) {
				console.error('Error fetching plan:', error)
				toast.error('Could not find this plan.')
				router.push('/')
			} finally {
				setFetching(false)
			}
		}

		fetchPlan()
	}, [id, supabase, router])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setErrors({})

		const parsed = updatePlanSchema.safeParse({
			id,
			name: formData.name,
			amount: parseFloat(formData.amount),
			interval: formData.interval,
			razorpay_plan_id: formData.razorpayPlanId || null,
			is_active: formData.isActive,
		})

		if (!parsed.success) {
			const fieldErrors: Record<string, string> = {}
			parsed.error.issues.forEach((err) => {
				const field = err.path[0] as string
				fieldErrors[field] = err.message
			})
			setErrors(fieldErrors)
			setLoading(false)
			return
		}

		try {
			const { data, error } = await supabase
				.from('plan')
				.update({
					name: parsed.data.name!,
					amount: Math.round(parsed.data.amount! * 100),
					interval: parsed.data.interval!,
					razorpay_plan_id: parsed.data.razorpay_plan_id ?? null,
					is_active: parsed.data.is_active!,
				})
				.eq('id', id)
				.select()

			if (error) throw error

			if (!data || data.length === 0) {
				toast.error('No record found with this ID to update.')
				return
			}

			toast.success('Plan updated successfully!')
			router.push('/dashboard/plans/')
			// router.refresh()
		} catch (error: any) {
			console.error('Update Error:', error)
			toast.error(error.message)
		} finally {
			setLoading(false)
		}
	}

	if (fetching) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<p className="text-slate-500 animate-pulse">Loading plan details...</p>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-slate-50 p-8">
			<div className="max-w-2xl mx-auto">
				<button
					onClick={() => router.back()}
					className="text-sm text-slate-500 hover:text-slate-800 mb-4 flex items-center gap-1"
				>
					← Back
				</button>

				<div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
					<h1 className="text-2xl font-bold text-slate-900 mb-6">Edit Subscription Plan</h1>

					<form onSubmit={handleSubmit} className="space-y-6">
						<div>
							<label className="block text-sm font-medium text-slate-700 mb-1">Plan Name</label>
							<input
								required
								type="text"
								placeholder="e.g. Pro Monthly"
								className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
								value={formData.name}
								onChange={(e) => setFormData({ ...formData, name: e.target.value })}
							/>
							{errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-slate-700 mb-1">Amount (in ₹)</label>
								<input
									required
									type="number"
									placeholder="499"
									className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
									value={formData.amount}
									onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
								/>
								{errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount}</p>}
							</div>
							<div>
								<label className="block text-sm font-medium text-slate-700 mb-1">Interval</label>
								<select
									className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
									value={formData.interval}
									onChange={(e) => setFormData({ ...formData, interval: e.target.value })}
								>
									<option value="daily">Daily</option>
									<option value="weekly">Weekly</option>
									<option value="monthly">Monthly</option>
									<option value="yearly">Yearly</option>
								</select>
								{errors.interval && <p className="text-xs text-red-500 mt-1">{errors.interval}</p>}
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-slate-700 mb-1">Razorpay Plan ID (Optional)</label>
							<input
								type="text"
								placeholder="plan_K9v..."
								className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
								value={formData.razorpayPlanId}
								onChange={(e) => setFormData({ ...formData, razorpayPlanId: e.target.value })}
							/>
							{errors.razorpay_plan_id && <p className="text-xs text-red-500 mt-1">{errors.razorpay_plan_id}</p>}
						</div>

						<div className="flex items-center gap-3">
							<input
								type="checkbox"
								id="isActive"
								className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
								checked={formData.isActive}
								onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
							/>
							<label htmlFor="isActive" className="text-sm font-medium text-slate-700">
								Set as Active (Visible to users)
							</label>
						</div>

						<hr className="border-slate-100" />

						<button
							type="submit"
							disabled={loading}
							className={`w-full py-3 px-4 rounded-lg font-bold text-white transition ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
								}`}
						>
							{loading ? 'Updating...' : 'Update Plan'}
						</button>
					</form>
				</div>
			</div>
		</div>
	)
}
export default EditPlan