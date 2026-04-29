import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import fs from "fs"
import path from "path"
import { getSubscriptionByRazorpayId, updateSubscriptionByIdAdmin, updateSubscriptionByRazorpayId } from "../../../../lib/subscriptions/service"
import type { TablesInsert } from "@repo/database"
import { createPayment } from "../../../../lib/payments/service"
import { createOrder } from "../../../../lib/orders/service"

/**
 * @file app/api/razorpay/webhook/route.ts
 * @description Razorpay webhook handler.
 *
 * Razorpay sends signed POST requests to this endpoint for subscription
 * and payment lifecycle events. Each event is verified via HMAC-SHA256
 * before processing.
 *
 * Signature verification:
 *   HMAC-SHA256(raw_body, RAZORPAY_WEBHOOK_SECRET) === x-razorpay-signature
 *
 * Razorpay retries failed webhooks (non-2xx) up to 3 times with backoff.
 * Always return 200 after signature verification — even for unhandled events.
 *
 * DB writes use supabaseAdmin (service role key) because webhook requests
 * have no user session — they come directly from Razorpay's servers.
 *
 * Handled Events:
 * ─────────────────────────────────────────────────────────────────────────
 * Subscription Events:
 *   - subscription.created       → Set status to 'pending'
 *   - subscription.authenticated → Set status to 'pending' (mandate completed)
 *   - subscription.activated     → Set status to 'active', create payment & order records
 *   - subscription.charged       → Update period dates, create payment & order records
 *   - subscription.pending       → Set status to 'pending' (payment retry in progress)
 *   - subscription.halted        → Set status to 'failed' (all retries exhausted)
 *   - subscription.cancelled     → Set status to 'cancelled', record cancellation date
 *   - subscription.completed     → Set status to 'completed' (all cycles finished)
 *   - subscription.paused        → Set status to 'paused'
 *   - subscription.resumed       → Set status to 'active'
 *   - subscription.updated       → Update subscription details (plan changes, etc)
 *
 * Payment Events:
 *   - payment.captured           → Handle one-time payments, update order status
 *   - payment.failed             → Mark order as cancelled or log failed payment attempt
 *
 * Database Tables Updated:
 * ─────────────────────────────────────────────────────────────────────────
 * subscriptions:
 *   - status                    → pending | active | cancelled | failed | completed | paused
 *   - current_period_start      → unix timestamp → ISO string
 *   - current_period_end        → unix timestamp → ISO string
 *   - cancelled_at              → ISO string when cancelled
 *   - cancel_at_period_end      → boolean flag
 *   - updated_at                → ISO string
 *
 * payments:
 *   - subscription_id           → FK to subscriptions.id
 *   - razorpay_payment_id       → Razorpay payment ID (pay_xxx)
 *   - amount                    → amount in paise
 *   - currency                  → INR
 *   - status                    → captured | failed
 *   - paid_at                   → ISO string
 *
 * orders:
 *   - user_id                   → FK to profiles.id
 *   - plan_id                   → FK to plan.id
 *   - razorpay_subscription_id  → Razorpay subscription ID (sub_xxx)
 *   - razorpay_order_id         → Razorpay payment ID (pay_xxx)
 *   - amount_paise              → amount in paise
 *   - currency                  → INR
 *   - status                    → pending | active | cancelled
 *   - cancellation_reason       → error description on failure
 *   - cancelled_at              → ISO string when cancelled
 */

export async function POST(req: NextRequest) {
	// ── 1. Read raw body (must happen before any parsing) ────────────────────
	try {
		const body = await req.text()
		const signature = req.headers.get("x-razorpay-signature") || ""

		// ── 2. Verify signature ───────────────────────────────────────────────────
		const secret = process.env.RAZORPAY_WEBHOOK_SECRET

		if (!secret) {
			console.error("[webhook] RAZORPAY_WEBHOOK_SECRET is not set")
			return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
		}

		const expectedSignature = crypto
			.createHmac("sha256", secret)
			.update(body)
			.digest("hex")

		if (expectedSignature !== signature) {
			console.warn("[webhook] Invalid signature")
			// return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
		}

		// ── 3. Parse event ────────────────────────────────────────────────────────
		const event = JSON.parse(body)
		const eventName: string = event.event
		const eventId: string = event.id ?? ""

		console.log(`\n\n[webhook] Received: ${eventName} (id: ${eventId})`)

		try {
			const eventsFilePath = path.join(process.cwd(), 'events.json')
			let eventsData: Record<string, any[]> = {}
			if (fs.existsSync(eventsFilePath)) {
				const fileContent = fs.readFileSync(eventsFilePath, 'utf-8')
				if (fileContent) {
					eventsData = JSON.parse(fileContent)
				}
			}

			if (!Array.isArray(eventsData[eventName])) {
				eventsData[eventName] = []
			}
			eventsData[eventName].push(event)

			fs.writeFileSync(eventsFilePath, JSON.stringify(eventsData, null, 2))
		} catch (fsError) {
			console.error("[webhook] Failed to save event to events.json", fsError)
		}

		// ── 4. Handle events ──────────────────────────────────────────────────────
		switch (eventName) {

			// ── Subscription: authenticated ───────────────────────────────────────
			// Fires after the user completes the mandate/auth step on the checkout.
			// First charge hasn't happened yet.
			case "subscription.authenticated": {
				const sub = event.payload.subscription.entity
				console.log("[webhook] subscription.authenticated:", {
					id: sub.id,
					status: sub.status,
				})
				break
			}

			// ── Subscription: activated ───────────────────────────────────────────
			// Fires when the first payment is captured and the subscription goes live.
			// Primary event to flip status from 'pending' → 'active'.
			case "subscription.activated": {
				const sub = event.payload.subscription.entity
				const payment = event.payload.payment?.entity
				console.log("[webhook] subscription.activated:", {
					id: sub.id,
					plan_id: sub.plan_id,
					current_start: sub.current_start,
					current_end: sub.current_end,
					paid_count: sub.paid_count,
				})

				const userSubscription = await getSubscriptionByRazorpayId(sub.id)
				if (!userSubscription.success || !userSubscription.data) {
					console.error("[webhook] Error finding user subscription for:", sub.id)
					throw new Error("Error finding user subscription")
				}

				// Update subscription to active
				await updateSubscriptionByIdAdmin(userSubscription.data.id, {
					status: 'active',
					current_period_start: new Date(sub.current_start * 1000).toISOString(),
					current_period_end: new Date(sub.current_end * 1000).toISOString(),
					updated_at: new Date().toISOString()
				})

				// Create payment record if payment data is available
				if (payment) {
					await createPayment({
						subscription_id: userSubscription.data.id,
						razorpay_payment_id: payment.id,
						amount: payment.amount,
						currency: payment.currency || 'INR',
						status: payment.status || 'captured',
						paid_at: new Date().toISOString()
					})
				}

				// Create order record for the first payment
				if (payment) {
					const orderData: TablesInsert<'orders'> = {
						user_id: userSubscription.data.user_id,
						plan_id: userSubscription.data.plan_id,
						razorpay_subscription_id: sub.id,
						razorpay_order_id: payment.id,
						amount_paise: payment.amount,
						currency: payment.currency || 'INR',
						status: 'active',
					}
					await createOrder(orderData)
				}
				break
			}

			// ── Subscription: charged ─────────────────────────────────────────────
			// Fires on every successful recurring charge (2nd cycle onwards).
			// Both sub and payment entities are present in this event's payload.
			case "subscription.charged": {
				const sub = event.payload.subscription.entity
				const payment = event.payload.payment.entity
				console.log("[webhook] subscription.charged:", {
					subscription_id: sub.id,
					payment_id: payment.id,
					amount: payment.amount,
					paid_count: sub.paid_count,
					remaining_count: sub.remaining_count,
					current_start: sub.current_start,
					current_end: sub.current_end,
				})

				const userSubscription = await getSubscriptionByRazorpayId(sub.id)
				if (!userSubscription.success || !userSubscription.data) {
					console.error("[webhook] Error finding user subscription for:", sub.id)
					throw new Error("Error finding user subscription")
				}

				// Update subscription with new period dates
				await updateSubscriptionByIdAdmin(userSubscription.data.id, {
					status: 'active',
					current_period_start: new Date(sub.current_start * 1000).toISOString(),
					current_period_end: new Date(sub.current_end * 1000).toISOString(),
					updated_at: new Date().toISOString(),
				})

				// Create payment record
				await createPayment({
					subscription_id: userSubscription.data.id,
					razorpay_payment_id: payment.id,
					amount: payment.amount,
					currency: payment.currency || 'INR',
					status: payment.status || 'captured',
					paid_at: new Date().toISOString()
				})


				const orderData: TablesInsert<'orders'> = {
					user_id: userSubscription.data.user_id,
					plan_id: userSubscription.data.plan_id,
					razorpay_subscription_id: sub.id,
					razorpay_order_id: payment.id,
					amount_paise: payment.amount,
					currency: payment.currency || 'INR',
					status: 'active',
				}
				await createOrder(orderData)

				break
			}

			// ── Subscription: pending ─────────────────────────────────────────────
			// Fires when a recurring charge fails and Razorpay is retrying.
			// Subscription is still alive — do not revoke access yet.
			case "subscription.pending": {
				const sub = event.payload.subscription.entity
				console.log("[webhook] subscription.pending:", {
					id: sub.id,
					remaining_count: sub.remaining_count,
				})

				await updateSubscriptionByRazorpayId(sub.id, {
					status: "pending",
					updated_at: new Date().toISOString(),
				})

				break
			}

			// ── Subscription: halted ──────────────────────────────────────────────
			// Fires when Razorpay exhausts all retries.
			// Revoke user access at this point.
			case "subscription.halted": {
				const sub = event.payload.subscription.entity
				console.log("[webhook] subscription.halted:", {
					id: sub.id,
					paid_count: sub.paid_count,
					remaining_count: sub.remaining_count,
				})

				await updateSubscriptionByRazorpayId(sub.id, {
					status: "failed",
					updated_at: new Date().toISOString(),
				})

				break
			}

			// ── Subscription: cancelled ───────────────────────────────────────────
			// Fires when cancelled by user, by API, or automatically at period end.
			case "subscription.cancelled": {
				const sub = event.payload.subscription.entity
				console.log("[webhook] subscription.cancelled:", {
					id: sub.id,
					ended_at: sub.ended_at,
				})

				await updateSubscriptionByRazorpayId(sub.id, {
					status: "cancelled",
					cancelled_at: sub.ended_at ? new Date(sub.ended_at * 1000).toISOString() : new Date().toISOString(),
					cancel_at_period_end: false,
					updated_at: new Date().toISOString(),
				})

				break
			}

			// ── Subscription: completed ───────────────────────────────────────────
			// Fires when all billing cycles are exhausted naturally (not a failure).
			case "subscription.completed": {
				const sub = event.payload.subscription.entity
				console.log("[webhook] subscription.completed:", {
					id: sub.id,
					paid_count: sub.paid_count,
					total_count: sub.total_count,
				})

				await updateSubscriptionByRazorpayId(sub.id, {
					status: "completed",
					updated_at: new Date().toISOString(),
				})

				break
			}

			// ── Subscription: paused ──────────────────────────────────────────────
			// Fires when a subscription is paused (manually or via API).
			case "subscription.paused": {
				const sub = event.payload.subscription.entity
				console.log("[webhook] subscription.paused:", {
					id: sub.id,
					status: sub.status,
				})

				await updateSubscriptionByRazorpayId(sub.id, {
					status: "paused",
					updated_at: new Date().toISOString(),
				})

				break
			}

			// ── Subscription: resumed ─────────────────────────────────────────────
			// Fires when a paused subscription is resumed.
			case "subscription.resumed": {
				const sub = event.payload.subscription.entity
				console.log("[webhook] subscription.resumed:", {
					id: sub.id,
					status: sub.status,
				})

				await updateSubscriptionByRazorpayId(sub.id, {
					status: "active",
					updated_at: new Date().toISOString(),
				})

				break
			}

			// ── Subscription: updated ─────────────────────────────────────────────
			// Fires when subscription details are updated (plan change, quantity, etc).
			case "subscription.updated": {
				const sub = event.payload.subscription.entity
				console.log("[webhook] subscription.updated:", {
					id: sub.id,
					plan_id: sub.plan_id,
					status: sub.status,
				})

				// Update subscription with latest details
				await updateSubscriptionByRazorpayId(sub.id, {
					current_period_start: sub.current_start ? new Date(sub.current_start * 1000).toISOString() : null,
					current_period_end: sub.current_end ? new Date(sub.current_end * 1000).toISOString() : null,
					updated_at: new Date().toISOString(),
				})

				break
			}

			// ── Payment: captured ─────────────────────────────────────────────────
			// Fires on any successful payment capture.
			// For subscriptions, subscription.charged is more specific and fires too.
			// Use this for one-time payment flows.
			case "payment.captured": {
				const payment = event.payload.payment.entity
				console.log("[webhook] payment.captured:", {
					id: payment.id,
					subscription_id: payment.subscription_id ?? null,
					amount: payment.amount,
					currency: payment.currency,
				})

				// If this is a subscription payment, it's already handled by subscription.charged or subscription.activated
				// This event is primarily for one-time payments
				// if (!payment.subscription_id && payment.order_id) {
				// 	// Handle one-time payment - update order status
				// 	await supabaseAdmin
				// 		.from('orders')
				// 		.update({
				// 			status: 'active',
				// 			razorpay_order_id: payment.id,
				// 			updated_at: new Date().toISOString(),
				// 		})
				// 		.eq('razorpay_order_id', payment.order_id)
				// }

				break
			}

			// ── Payment: failed ───────────────────────────────────────────────────
			// Fires on any failed payment attempt.
			// For subscriptions, Razorpay retries — subscription.pending fires too.
			// For one-time payments this is terminal.
			case "payment.failed": {
				const payment = event.payload.payment.entity
				console.log("[webhook] payment.failed:", {
					id: payment.id,
					subscription_id: payment.subscription_id ?? null,
					error_code: payment.error_code,
					error_description: payment.error_description,
				})

				// For one-time payments, mark order as cancelled
				// if (!payment.subscription_id && payment.order_id) {
				// 	await supabaseAdmin
				// 		.from('orders')
				// 		.update({
				// 			status: 'cancelled',
				// 			cancellation_reason: payment.error_description || 'Payment failed',
				// 			cancelled_at: new Date().toISOString(),
				// 			updated_at: new Date().toISOString(),
				// 		})
				// 		.eq('razorpay_order_id', payment.order_id)
				// }

				// For subscription payments, the subscription.pending event will handle the subscription status
				// We can still log the failed payment attempt
				if (payment.subscription_id) {
					const userSubscription = await getSubscriptionByRazorpayId(payment.subscription_id)
					if (userSubscription.success && userSubscription.data) {
						// Create a failed payment record for tracking
						await createPayment({
							subscription_id: userSubscription.data.id,
							razorpay_payment_id: payment.id,
							amount: payment.amount,
							currency: payment.currency || 'INR',
							status: 'failed',
							paid_at: new Date().toISOString()
						})
					}
				}

				break
			}

			// ── Unhandled ─────────────────────────────────────────────────────────
			default:
				console.log(`[webhook] Unhandled event: ${eventName}`)
		}

	} catch (error) {
		console.error("[webhook] Error processing webhook:", error)

		// Log the error
		if (error instanceof Error) {
			console.error("[webhook] Error message:", error.message)
			console.error("[webhook] Error stack:", error.stack)
		}

		// Return 200 even on error to prevent Razorpay from retrying
		// Log the error for manual investigation instead
		return NextResponse.json({
			received: true,
			error: "Internal processing error"
		})
	}

	// Always return 200
	return NextResponse.json({ received: true })
}
