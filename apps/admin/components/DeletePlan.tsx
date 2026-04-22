"use client"
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { createClient } from '@myapp/supabase';
import { useRouter } from 'next/navigation';
import ConfirmationModal from '@repo/ui/ConfirmModel';
import { toast } from 'sonner';

export default function DeletePlanButton({ planId }: { planId: string }) {
	const supabase = createClient();
	const router = useRouter();

	const [isOpen, setIsOpen] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const handleDelete = async () => {
		setIsDeleting(true);
		const { error } = await supabase.from('plan').delete().eq('id', planId);

		if (error) {
			toast.error(error.message);
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
						style={{
							position: 'relative',
							zIndex: 10000,
							maxWidth: '480px',
							width: '100%',
						}}
					>
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
					</div>
				</div>,
				document.body
			)}
		</>
	);
}