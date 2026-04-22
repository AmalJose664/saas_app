"use client"
import { useState, useEffect } from 'react'
import { createClient } from '@myapp/supabase'
import { useRouter } from 'next/navigation'

const EditPlan = ({ id }: { id: string }) => {
	const supabase = createClient()
	const router = useRouter()

	const [loading, setLoading] = useState(false)
	const [fetching, setFetching] = useState(true)
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
					.from('Plan')
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
				alert('Could not find this plan.')
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

		try {
			const { data, error } = await supabase
				.from('Plan')
				.update({
					name: formData.name,
					amount: Math.round(parseFloat(formData.amount) * 100),
					interval: formData.interval,
					razorpay_plan_id: formData.razorpayPlanId || null,
					is_active: formData.isActive,
				})
				.eq('id', id)
				.select() // <--- Add this to get the updated row back

			if (error) throw error

			if (!data || data.length === 0) {
				alert('No record found with this ID to update.')
				return
			}

			alert('Plan updated successfully!')
			router.push('/plans')
			router.refresh()
		} catch (error: any) {
			console.error('Update Error:', error)
			alert(error.message)
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