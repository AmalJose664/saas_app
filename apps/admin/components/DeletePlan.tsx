/**
 * @file DeletePlan.tsx
 * @description Client-side delete button for subscription plans.
 *
 * Architecture Flow:
 * UI (DeletePlanButton)
 *   ↓ onClick
 * ConfirmationModal (@workspace/ui/ConfirmModel)
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
import { useDeletePlan } from '../lib/plans/hooks';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@workspace/ui/components/dialog"
import { Button } from '@workspace/ui/components/button';
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
			<Dialog>
				<DialogTrigger asChild>
					<Button variant="destructive" disabled={isPending}>
						{isPending ? "Deleting" : "Delete"}
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="text-xl">
							Are you absolutely sure?
						</DialogTitle>
						<DialogDescription>
							This action cannot be undone. This will permanently delete your subscription.
						</DialogDescription>
					</DialogHeader>
					<div className="flex items-center gap-4">
						<DialogClose className='border px-3 py-2 rounded-md'>
							Cancel
						</DialogClose>
						<Button variant="destructive" onClick={handleDelete}>
							Delete
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</>
	)
}
