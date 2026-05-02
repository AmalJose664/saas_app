import { supabaseAdmin } from '@workspace/supabase/admin'
import type { TablesInsert, TablesUpdate } from '@workspace/database'

/**
 * Orders Repository
 *
 * Raw Supabase access for the `orders` table.
 * Uses supabaseAdmin (service role) because orders may be written
 * from webhook handlers which have no user session.
 *
 * Called only by lib/orders/service.ts.
 */

// ─── Reads ────────────────────────────────────────────────────────────────────

export async function dbGetOrderById(id: string) {
	return supabaseAdmin
		.from('orders')
		.select('*')
		.eq('id', id)
		.single()
}

export async function dbGetOrderByRazorpayOrderId(razorpayOrderId: string) {
	return supabaseAdmin
		.from('orders')
		.select('*')
		.eq('razorpay_order_id', razorpayOrderId)
		.single()
}

export async function dbGetOrdersByUserId(userId: string) {
	return supabaseAdmin
		.from('orders')
		.select('*')
		.eq('user_id', userId)
		.order('created_at', { ascending: false })
}

// ─── Writes ───────────────────────────────────────────────────────────────────

export async function dbCreateOrder(data: TablesInsert<'orders'>) {
	return supabaseAdmin
		.from('orders')
		.insert([data])
		.select()
		.single()
}

export async function dbUpdateOrder(id: string, data: TablesUpdate<'orders'>) {
	return supabaseAdmin
		.from('orders')
		.update(data)
		.eq('id', id)
		.select()
		.single()
}

export async function dbUpdateOrderByRazorpayOrderId(razorpayOrderId: string, data: TablesUpdate<'orders'>) {
	return supabaseAdmin
		.from('orders')
		.update(data)
		.eq('razorpay_order_id', razorpayOrderId)
		.select()
		.single()
}
