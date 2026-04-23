/**
 * @file app/dashboard/loading.tsx
 * @description Suspense loading UI for all /dashboard/* routes.
 *
 * Next.js automatically shows this while the dashboard page is streaming.
 * Displays a centered spinner matching the app's gray background.
 */
const loading = () => {
	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-50">
			<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
		</div>
	)
}
export default loading