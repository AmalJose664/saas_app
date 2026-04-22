import { createClient } from '@myapp/supabase/server';

export default async function SubscriptionsTable() {
	const supabase = await createClient();
	const { data: subs } = await supabase.from('Subscriptions').select('*, users(full_name)');

	return (
		<div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
			<table className="w-full text-left">
				<thead className="bg-gray-50 border-b border-gray-200">
					<tr>
						<th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Subscriber</th>
						<th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Plan</th>
						<th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Next Billing</th>
						<th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-gray-100">
					{subs?.map((sub) => (
						<tr key={sub.id} className="hover:bg-gray-50 transition">
							<td className="px-6 py-4 font-medium text-gray-900">{sub.users?.full_name}</td>
							<td className="px-6 py-4 text-sm">
								<span className="text-blue-600 font-medium">{sub.plan_name}</span>
							</td>
							<td className="px-6 py-4 text-sm text-gray-500">{sub.next_billing_date}</td>
							<td className="px-6 py-4">
								<div className="flex items-center gap-2">
									<div className={`w-2 h-2 rounded-full ${sub.active ? 'bg-green-500' : 'bg-red-500'}`} />
									<span className="text-sm text-gray-700">{sub.active ? 'Active' : 'Canceled'}</span>
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}