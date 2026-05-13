/**
 * @file lib/orders/actions.ts
 * @description Server Actions for orders domain.
 * 
 * Exposes server-side service functions as Next.js Server Actions.
 * These are primarily used as `queryFn` references for TanStack React Query 
 * in Client Components to enable seamless background refetching.
 */
'use server'

import { getOrdersByUserId } from './service'

export async function getOrdersByUserIdAction(userId: string) {
    return getOrdersByUserId(userId)
}
