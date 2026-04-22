import { notFound } from 'next/navigation'
import { getPlanById } from '../../../../../../lib/plans/service'
import EditPlanForm from './EditPlanForm'

export default async function EditPlanPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params
	const result = await getPlanById(id)

	if (!result.success || !result.data) {
		notFound()
	}

	const plan = result.data

	return (
		<div className="min-h-screen flex flex-col">
			<EditPlanForm
				id={plan.id}
				defaultValues={{
					name: plan.name,
					// Convert paise → ₹ for the input
					amount: (plan.amount / 100).toString(),
					interval: plan.interval,
					razorpay_plan_id: plan.razorpay_plan_id ?? '',
					is_active: plan.is_active,
				}}
			/>
		</div>
	)
}
