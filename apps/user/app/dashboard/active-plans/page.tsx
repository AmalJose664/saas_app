/**
 * @file app/dashboard/subscription/page.tsx
 * @description Subscription management page Server Component.
 *
 * Fetches the user's active subscription and passes it to the
 * SubscriptionClient component to hydrate the TanStack Query cache.
 *
 * Protected by middleware — unauthenticated users are redirected to /login.
 */
import { getAuthUser } from '../../../lib/auth/server'
import { getSubscriptionsByUserId } from '../../../lib/subscriptions/service'
import { redirect } from 'next/navigation'
import SubscriptionClient from './SubscriptionClient'

export default async function SubscriptionPage() {
	const { user } = await getAuthUser()

	if (!user) {
		redirect('/login')
	}

	const result = await getSubscriptionsByUserId(user.id)

	return <SubscriptionClient user={user} initialResult={result} />
}
