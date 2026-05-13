/**
 * @file app/dashboard/orders/page.tsx
 * @description Order history page Server Component.
 *
 * Fetches all orders associated with the user and passes them to the 
 * OrdersClient component to hydrate the TanStack Query cache.
 *
 * Protected by middleware — unauthenticated users are redirected to /login.
 */
import { getAuthUser } from '../../../lib/auth/server'
import { getOrdersByUserId } from '../../../lib/orders/service'
import { redirect } from 'next/navigation'
import OrdersClient from './OrdersClient'

export default async function OrdersPage() {
	const { user } = await getAuthUser()

	if (!user) {
		redirect('/login')
	}

	const result = await getOrdersByUserId(user.id)

	return <OrdersClient user={user} initialResult={result} />
}