/**
 * @file app/(dashboard)/dashboard/plans/edit/[id]/page.tsx
 * @description Server component that fetches a plan by ID and renders
 * the EditPlanForm with pre-populated default values.
 *
 * Architecture:
 * EditPlanPage (Server Component)
 *   ↓ calls
 * Plans Service (lib/plans/service.ts::getPlanById)
 *   ↓ calls
 * Plans Repository (lib/plans/repository.ts::dbGetPlanById)
 *   ↓ calls
 * Supabase Server Client
 *   ↓ returns data
 * EditPlanForm (Client Component)
 *   ↓ form action
 * Server Action (lib/plans/actions.ts::updatePlanAction)
 */

import { notFound } from 'next/navigation';
import { getPlanById } from '../../../../../../lib/plans/service';
import EditPlanForm from './EditPlanForm';

/**
 * EditPlanPage — fetches plan data and renders the edit form.
 *
 * @param params — Next.js route params containing the plan UUID
 */
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
