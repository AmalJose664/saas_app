import { createClient } from '@myapp/supabase/server'

/**
 * Plans Repository
 *
 * Raw Supabase access for the `plan` table.
 * All functions return the raw Supabase response and are called only
 * by lib/plans/service.ts.
 */

export async function dbGetAllPlans() {
	const supabase = await createClient()
	return supabase
		.from('plan')
		.select('*')
		.order('created_at', { ascending: false })
}

export async function dbGetPlanById(id: string) {
	const supabase = await createClient()
	return supabase
		.from('plan')
		.select('*')
		.eq('id', id)
		.single()
}
