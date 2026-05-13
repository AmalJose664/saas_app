/**
 * @file lib/plans/actions.ts
 * @description Server Actions for plans domain.
 * 
 * Exposes server-side service functions as Next.js Server Actions.
 * These are primarily used as `queryFn` references for TanStack React Query 
 * in Client Components to enable seamless background refetching.
 */
'use server'

import { getAllPlans } from './service'

export async function getAllPlansAction() {
    return getAllPlans()
}
