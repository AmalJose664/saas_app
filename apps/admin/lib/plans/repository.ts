import { createClient } from '@workspace/supabase/server'
import type { TablesInsert, TablesUpdate } from '@workspace/database'

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

export async function dbCreatePlan(data: TablesInsert<'plan'>) {
	const supabase = await createClient()
	return supabase
		.from('plan')
		.insert([data])
		.select()
		.single()
}

export async function dbUpdatePlan(id: string, data: TablesUpdate<'plan'>) {
	const supabase = await createClient()
	return supabase
		.from('plan')
		.update(data)
		.eq('id', id)
		.select()
		.single()
}

export async function dbDeletePlan(id: string) {
	const supabase = await createClient()
	return supabase
		.from('plan')
		.delete()
		.eq('id', id)
}
