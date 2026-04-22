/**
 * @file StatCard.tsx
 * @description Reusable stat card for the dashboard overview.
 * Displays a metric title, large value, and an optional trend badge.
 *
 * @example
 * <StatCard
 *   title="Total Customers"
 *   value="1,234"
 *   color="text-blue-600"
 *   trend="+12%"
 * />
 */

/** Props for the StatCard component */
interface StatCardProps {
	/** Metric label (e.g., "Total Customers") */
	title: string;
	/** Display value (e.g., "1,234" or "₹45,000") */
	value: string;
	/** Tailwind text color class for the value (e.g., "text-blue-600") */
	color: string;
	/** Optional trend string (e.g., "+12%"). Currently hardcoded in parent. */
	trend?: string;
}

/**
 * StatCard — metric card used on the dashboard overview page.
 *
 * @param props — StatCardProps
 */
export default function StatCard({ title, value, color, trend }: StatCardProps) {
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