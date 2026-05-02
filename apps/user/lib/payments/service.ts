import type { Tables, TablesInsert } from '@workspace/database'
import {
	dbGetPaymentById,
	dbGetPaymentByRazorpayId,
	dbGetPaymentsBySubscriptionId,
	dbGetPaymentsByUserId,
	dbCreatePayment,
} from './repository'

/**
 * Payments Service
 *
 * Business logic for payment records. Responsibilities:
 * - Wrapping all results in { success, data } | { success, error }
 * - Preventing duplicate payment records (idempotency check)
 *
 * Payments are written from webhook handlers (subscription.activated,
 * subscription.charged) and read for billing history display.
 *
 * Called by webhook handlers and Server Components (billing history).
 */

// ─── Domain types ─────────────────────────────────────────────────────────────

export type Payment = Tables<'payments'>

export type ServiceResult<T> =
	| { success: true; data: T }
	| { success: false; error: string }

export type GetPaymentResult = ServiceResult<Payment | null>
export type GetPaymentsResult = ServiceResult<Payment[]>

// ─── Reads ────────────────────────────────────────────────────────────────────

export async function getPaymentById(id: string): Promise<GetPaymentResult> {
	const { data, error } = await dbGetPaymentById(id)
	if (error) return { success: false, error: error.message }
	return { success: true, data }
}

export async function getPaymentByRazorpayId(razorpayPaymentId: string): Promise<GetPaymentResult> {
	const { data, error } = await dbGetPaymentByRazorpayId(razorpayPaymentId)
	if (error) return { success: false, error: error.message }
	return { success: true, data }
}

export async function getPaymentsBySubscriptionId(subscriptionId: string): Promise<GetPaymentsResult> {
	const { data, error } = await dbGetPaymentsBySubscriptionId(subscriptionId)
	if (error) return { success: false, error: error.message }
	return { success: true, data: data ?? [] }
}

export async function getPaymentsByUserId(userId: string): Promise<GetPaymentsResult> {
	const { data, error } = await dbGetPaymentsByUserId(userId)
	if (error) return { success: false, error: error.message }
	return { success: true, data: data ?? [] }
}

// ─── Writes ───────────────────────────────────────────────────────────────────



/**
 * createPayment — inserts a new payment record.
 *
 * Includes an idempotency check: if a payment with the same
 * razorpay_payment_id already exists, returns the existing record
 * instead of inserting a duplicate. This handles Razorpay webhook retries.
 */
export async function createPayment(input: TablesInsert<'payments'>): Promise<GetPaymentResult> {
	// Idempotency check — Razorpay may retry webhooks
	const existing = await dbGetPaymentByRazorpayId(input.razorpay_payment_id as string)
	if (existing.data) {
		return { success: true, data: existing.data }
	}
	const { data, error } = await dbCreatePayment({
		subscription_id: input.subscription_id,
		razorpay_payment_id: input.razorpay_payment_id,
		razorpay_signature: input.razorpay_signature ?? null,
		amount: input.amount,
		currency: input.currency ?? 'INR',
		status: input.status,
		paid_at: input.paid_at ? new Date().toISOString() : null,
		...(input.failure_code && { failure_code: input.failure_code }),
		...(input.failure_reason && { failure_reason: input.failure_reason })
	})

	if (error) return { success: false, error: error.message }
	return { success: true, data }
}
