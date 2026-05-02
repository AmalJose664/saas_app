import type { Tables, TablesUpdate } from '@workspace/database'
import {
	dbGetOrderById,
	dbGetOrderByRazorpayOrderId,
	dbGetOrdersByUserId,
	dbCreateOrder,
	dbUpdateOrder,
	dbUpdateOrderByRazorpayOrderId,
} from './repository'

/**
 * Orders Service
 *
 * Business logic for order records. Responsibilities:
 * - Wrapping all results in { success, data } | { success, error }
 * - Idempotency checks during creation
 *
 * Called by webhook handlers and Server Components.
 */

// ─── Domain types ─────────────────────────────────────────────────────────────

export type Order = Tables<'orders'>

export type ServiceResult<T> =
	| { success: true; data: T }
	| { success: false; error: string }

export type GetOrderResult = ServiceResult<Order | null>
export type GetOrdersResult = ServiceResult<Order[]>

// ─── Reads ────────────────────────────────────────────────────────────────────

export async function getOrderById(id: string): Promise<GetOrderResult> {
	const { data, error } = await dbGetOrderById(id)
	if (error) return { success: false, error: error.message }
	return { success: true, data }
}

export async function getOrderByRazorpayOrderId(razorpayOrderId: string): Promise<GetOrderResult> {
	const { data, error } = await dbGetOrderByRazorpayOrderId(razorpayOrderId)
	if (error) return { success: false, error: error.message }
	return { success: true, data }
}

export async function getOrdersByUserId(userId: string): Promise<GetOrdersResult> {
	const { data, error } = await dbGetOrdersByUserId(userId)
	if (error) return { success: false, error: error.message }
	return { success: true, data: data ?? [] }
}

// ─── Writes ───────────────────────────────────────────────────────────────────

export interface CreateOrderInput {
	user_id: string
	plan_id: string
	amount_paise: number
	currency?: string
	status?: Tables<'orders'>['status']
	razorpay_order_id?: string | null
	razorpay_subscription_id?: string | null
	razorpay_customer_id?: string | null
}

/**
 * createOrder — inserts a new order record.
 *
 * Includes an idempotency check: if an order with the same
 * razorpay_order_id already exists, returns the existing record
 * instead of inserting a duplicate.
 */
export async function createOrder(input: CreateOrderInput): Promise<GetOrderResult> {
	// Idempotency check if razorpay_order_id is provided
	if (input.razorpay_order_id) {
		const existing = await dbGetOrderByRazorpayOrderId(input.razorpay_order_id)
		if (existing.data) {
			return { success: true, data: existing.data }
		}
	}

	const { data, error } = await dbCreateOrder({
		user_id: input.user_id,
		plan_id: input.plan_id,
		amount_paise: input.amount_paise,
		currency: input.currency ?? 'INR',
		status: input.status ?? 'pending',
		razorpay_order_id: input.razorpay_order_id ?? null,
		razorpay_subscription_id: input.razorpay_subscription_id ?? null,
		razorpay_customer_id: input.razorpay_customer_id ?? null,
	})

	if (error) return { success: false, error: error.message }
	return { success: true, data }
}

export async function updateOrder(id: string, data: TablesUpdate<'orders'>): Promise<GetOrderResult> {
	const { data: updated, error } = await dbUpdateOrder(id, data)
	if (error) return { success: false, error: error.message }
	return { success: true, data: updated }
}

export async function updateOrderByRazorpayOrderId(razorpayOrderId: string, data: TablesUpdate<'orders'>): Promise<GetOrderResult> {
	const { data: updated, error } = await dbUpdateOrderByRazorpayOrderId(razorpayOrderId, data)
	if (error) return { success: false, error: error.message }
	return { success: true, data: updated }
}
