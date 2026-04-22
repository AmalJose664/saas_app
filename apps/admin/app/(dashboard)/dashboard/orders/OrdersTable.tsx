import { createClient } from '@myapp/supabase/server';

export default async function OrdersTable({ limit }: { limit?: number }) {
	const supabase = await createClient();

	let query = supabase.from('orders').select('*, users(full_name, email)').order('created_at', { ascending: false });
	if (limit) query = query.limit(limit);

	const { data: orders } = await query;

	return (
		<div className="overflow-x-auto bg-white rounded-xl border border-gray-200">
			<table className="w-full text-left border-collapse">
				<thead>
					<tr className="bg-gray-50 border-b border-gray-200">
						<th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
						<th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
						<th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
						<th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
						<th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-gray-100">
					{orders?.map((order) => (
						<tr key={order.id} className="hover:bg-gray-50 transition-colors">
							<td className="px-6 py-4 text-sm font-mono text-gray-600">#{order.id.slice(0, 8)}</td>
							<td className="px-6 py-4">
								<div className="text-sm font-medium text-gray-900">{order.users?.full_name}</div>
								<div className="text-xs text-gray-500">{order.users?.email}</div>
							</td>
							<td className="px-6 py-4 text-sm font-semibold text-gray-900">${order.amount}</td>
							<td className="px-6 py-4">
								<span className={`px-2.5 py-1 rounded-full text-xs font-medium ${order.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
									}`}>
									{order.status}
								</span>
							</td>
							<td className="px-6 py-4 text-sm text-gray-500">
								{new Date(order.created_at).toLocaleDateString()}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}