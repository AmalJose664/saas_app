/**
 * @file app/dashboard/page.tsx
 * @description Dashboard page Server Component.
 * 
 * Fetches user plans and subscriptions data on the server and passes
 * them to the DashboardClient component to hydrate the TanStack Query cache.
 */
import { getAllPlans } from '../../lib/plans/service'
import { getAuthUser } from '../../lib/auth/server'
import { getSubscriptionsByUserId } from '../../lib/subscriptions/service'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
	const { user } = await getAuthUser()
	if (!user) return null;

	const [plansResult, subsResult] = await Promise.all([
		getAllPlans(),
		getSubscriptionsByUserId(user.id)
	])

	return (
		<DashboardClient
			user={user}
			initialPlansResult={plansResult}
			initialSubsResult={subsResult}
		/>
	)
}