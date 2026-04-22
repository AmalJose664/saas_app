'use client';
import { createClient } from '@myapp/supabase';
import { useRouter } from 'next/navigation';

export default function DeletePlanButton({ planId }: { planId: string }) {
	const supabase = createClient();
	const router = useRouter();

	const handleDelete = async () => {
		if (!confirm('Are you sure you want to delete this plan?')) return;

		const { error } = await supabase
			.from('Plan')
			.delete()
			.eq('id', planId);

		if (error) {
			alert(error.message);
		} else {
			router.refresh(); // This re-runs the Server Component to update the list!
		}
	};

	return (
		<button
			onClick={handleDelete}
			className="text-sm font-medium py-2 px-3 text-red-600 hover:bg-red-50 rounded transition"
		>
			Delete
		</button>
	);
}