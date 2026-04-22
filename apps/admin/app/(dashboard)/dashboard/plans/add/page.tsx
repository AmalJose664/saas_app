'use client'
import { useState } from 'react'
import { createClient } from '@myapp/supabase'
import { useRouter } from 'next/navigation'
import { createPlanSchema } from '@repo/validations'
import { toast } from 'sonner'

export default function AddPlan() {
	const supabase = createClient()
	const router = useRouter()

	const [loading, setLoading] = useState(false)
	const [errors, setErrors] = useState<Record<string, string>>({})
	const [formData, setFormData] = useState({
		name: '',
		amount: '',
		interval: 'monthly',
		razorpayPlanId: '',
		isActive: true
	})

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setErrors({})

		const parsed = createPlanSchema.safeParse({
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
			const { error } = await supabase
				.from('plan')
				.insert([
					{
						name: parsed.data.name,
						amount: Math.round(parsed.data.amount * 100),
						interval: parsed.data.interval,
						razorpay_plan_id: parsed.data.razorpay_plan_id ?? null,
						is_active: parsed.data.is_active,
					}
				])

			if (error) throw error

			toast.success('Plan created successfully!')
			router.push('/dashboard/plans/')
			router.refresh()
		} catch (error: any) {
			console.log(error)
			toast.error(error.message)
		} finally {
			setLoading(false)
		}
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
					<h1 className="text-2xl font-bold text-slate-900 mb-6">Create New Subscription Plan</h1>

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
							<p className="text-xs text-slate-400 mt-1 italic">Link this to your existing Razorpay dashboard plan.</p>
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
							{loading ? 'Creating...' : 'Save Plan'}
						</button>
					</form>
				</div>
			</div>
		</div>
	)
}