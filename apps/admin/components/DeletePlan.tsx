
"use client"
import { useState } from 'react';
import { createClient } from '@myapp/supabase';
import { useRouter } from 'next/navigation';
import ConfirmationModal from '@repo/ui/ConfirmModel';

export default function DeletePlanButton({ planId }: { planId: string }) {
	const supabase = createClient();
	const router = useRouter();

	const [isOpen, setIsOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		setIsDeleting(true);
		const { error } = await supabase.from('Plan').delete().eq('id', planId);

		if (error) {
			alert(error.message);
			setIsDeleting(false);
			setIsOpen(false);
		} else {
			router.refresh();
		}
	};

	return (
		<>
			<button
				onClick={() => setIsOpen(true)}
				className="text-sm font-medium py-2 px-3 text-red-600 hover:bg-red-50 rounded transition"
			>
				Delete
			</button>

			<ConfirmationModal
				isOpen={isOpen}
				title="Delete Plan?"
				subtext="This action is permanent and will remove this plan from your dashboard. Continue?"
				confirmText="Delete"
				cancelText="Go Back"
				variant="danger"
				isLoading={isDeleting}
				onCancel={() => setIsOpen(false)}
				onConfirm={handleDelete}
			/>
		</>
	);
}