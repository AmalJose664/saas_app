/**
 * @file app/dashboard/subscriptions/page.tsx
 * @description Subscriptions list page Server Component.
 *
 * Fetches all subscriptions associated with the user and passes them to the
 * SubscriptionsClient component to hydrate the TanStack Query cache.
 *
 * Protected by middleware — unauthenticated users are redirected to /login.
 */
import { getAuthUser } from '../../../lib/auth/server'
import { getSubscriptionsByUserId } from '../../../lib/subscriptions/service'
import { redirect } from 'next/navigation'
import SubscriptionsClient from './SubscriptionsClient'

export default async function SubscriptionsPage() {
	const { user } = await getAuthUser()

	if (!user) {
		redirect('/login')
	}

	const result = await getSubscriptionsByUserId(user.id)

	return <SubscriptionsClient user={user} initialResult={result} />
}
