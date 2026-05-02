/**
 * @file app/dashboard/loading.tsx
 * @description Suspense loading UI for all /dashboard/* routes.
 *
 * Next.js automatically shows this while the dashboard page is streaming.
 * Displays a premium skeleton UI matching the dashboard layout.
 */
export default function Loading() {
	return (
		<main className="max-w-7xl mx-auto px-6 py-12 animate-pulse">
			{/* Header Skeleton */}
			<div className="mb-8">
				<div className="h-8 bg-gray-200 rounded-md w-64 mb-3"></div>
				<div className="h-4 bg-gray-200 rounded-md w-96"></div>
			</div>

			{/* Summary Cards Skeleton */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
				{[...Array(3)].map((_, i) => (
					<div key={i} className="bg-white shadow-sm rounded-2xl p-6 border border-gray-100">
						<div className="h-3 bg-gray-200 rounded-md w-24 mb-4"></div>
						<div className="h-8 bg-gray-200 rounded-md w-20"></div>
					</div>
				))}
			</div>

			{/* Main Content/Table Skeleton */}
			<div className="bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden">
				{/* Table Header */}
				<div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex gap-4">
					<div className="h-4 bg-gray-200 rounded-md w-1/4"></div>
					<div className="h-4 bg-gray-200 rounded-md w-1/4"></div>
					<div className="h-4 bg-gray-200 rounded-md w-1/4 hidden md:block"></div>
					<div className="h-4 bg-gray-200 rounded-md w-1/4 hidden md:block"></div>
				</div>
				
				{/* Table Rows */}
				<div className="divide-y divide-gray-100">
					{[...Array(5)].map((_, i) => (
						<div key={i} className="px-6 py-5 flex items-center justify-between gap-4">
							<div className="flex flex-col gap-2 w-1/3 md:w-1/4">
								<div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
								<div className="h-3 bg-gray-100 rounded-md w-1/2"></div>
							</div>
							<div className="h-4 bg-gray-200 rounded-md w-1/4 hidden md:block"></div>
							<div className="h-4 bg-gray-200 rounded-md w-1/4 hidden md:block"></div>
							<div className="h-6 bg-gray-200 rounded-full w-24 flex-shrink-0"></div>
						</div>
					))}
				</div>
			</div>
		</main>
	)
}