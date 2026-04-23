/**
 * @file DeletePlan.tsx
 * @description Client-side delete button for subscription plans.
 *
 * Architecture Flow:
 * UI (DeletePlanButton)
 *   ↓ onClick
 * ConfirmationModal (@repo/ui/ConfirmModel)
 *   ↓ onConfirm
 * TanStack Query Hook (lib/plans/hooks.ts::useDeletePlan)
 *   ↓ calls
 * Server Action (lib/plans/actions.ts::deletePlanAction)
 *   ↓ calls
 * Service (lib/plans/service.ts::deletePlan)
 *   ↓ calls
 * Repository (lib/plans/repository.ts::dbDeletePlan)
 *   ↓ calls
 * Supabase Server Client
 *
 * The useDeletePlan hook handles toast notifications, cache invalidation,
 * and loading state automatically. On success, it invalidates the plans
 * list cache so the UI refreshes without a manual page reload.
 *
 * Uses React Portals to render the modal outside the normal DOM tree
 * so it can overlay the entire page with a backdrop.
 */

'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import ConfirmationModal from '@repo/ui/ConfirmModel';
import { useDeletePlan } from '../lib/plans/hooks';

/** Props for the DeletePlanButton component */
interface DeletePlanButtonProps {
	/** Supabase plan.id to delete */
	planId: string;
}

/**
 * DeletePlanButton — renders a delete button with confirmation modal.
 *
 * @param planId — the UUID of the plan to delete
 */
export default function DeletePlanButton({ planId }: DeletePlanButtonProps) {
	const [isOpen, setIsOpen] = useState(false);
	const { mutate, isPending } = useDeletePlan();

	const handleDelete = () => {
		mutate(planId, {
			onSuccess: () => setIsOpen(false),
		});
	};

	return (
		<>
			<button
				onClick={() => setIsOpen(true)}
				className="text-sm font-medium py-2 px-3 text-red-600 hover:bg-red-50 rounded transition"
			>
				Delete
			</button>

			{isOpen && createPortal(
				<div
					style={{
						position: 'fixed',
						inset: 0,
						zIndex: 9999,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						backgroundColor: 'rgba(0, 0, 0, 0.5)',
					}}
					onClick={() => setIsOpen(false)}
				>
					<div
						onClick={(e) => e.stopPropagation()}
						style={{ position: 'relative', zIndex: 10000, maxWidth: '480px', width: '100%' }}
					>
						<ConfirmationModal
							isOpen={isOpen}
							title="Delete Plan?"
							subtext="This action is permanent and will remove this plan from your dashboard. Continue?"
							confirmText="Delete"
							cancelText="Go Back"
							variant="danger"
							isLoading={isPending}
							onCancel={() => setIsOpen(false)}
							onConfirm={handleDelete}
						/>
					</div>
				</div>,
				document.body
			)}
		</>
	)
}
