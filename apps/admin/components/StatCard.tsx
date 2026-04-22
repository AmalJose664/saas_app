export default function StatCard({ title, value, color, trend }: { title: string, value: string, color: string, trend?: string }) {
	return (
		<div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-blue-200 transition-all">
			<div className="flex justify-between items-start">
				<div>
					<p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</p>
					<p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
				</div>
				{trend && (
					<span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded">
						{trend}
					</span>
				)}
			</div>
		</div>
	)
}