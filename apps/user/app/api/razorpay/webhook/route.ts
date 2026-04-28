import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

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
 * Event payload shape (all events):
 *   event.event          — event name string
 *   event.payload        — contains entity objects depending on event type
 *   event.created_at     — unix timestamp
 *
 * Subscription entity fields used here:
 *   subscription.id                  — razorpay subscription ID (sub_xxx)
 *   subscription.plan_id             — razorpay plan ID (plan_xxx)
 *   subscription.status              — created | authenticated | active | pending | halted | cancelled | completed | expired
 *   subscription.current_start       — unix timestamp, current period start
 *   subscription.current_end         — unix timestamp, current period end
 *   subscription.charge_at           — unix timestamp, next charge date
 *   subscription.total_count         — total billing cycles
 *   subscription.paid_count          — cycles paid so far
 *   subscription.remaining_count     — cycles remaining
 *
 * Payment entity fields used here:
 *   payment.id                       — razorpay payment ID (pay_xxx)
 *   payment.subscription_id          — razorpay subscription ID this payment belongs to
 *   payment.amount                   — amount in paise
 *   payment.currency                 — INR
 *   payment.status                   — captured | failed
 *   payment.error_code               — present on failure
 *   payment.error_description        — present on failure
 */

export async function POST(req: NextRequest) {
	// ── 1. Read raw body (must be done before any parsing) ───────────────────
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
		console.warn("[webhook] Invalid signature — possible spoofed request")
		return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
	}

	// ── 3. Parse event ────────────────────────────────────────────────────────
	const event = JSON.parse(body)
	const eventName: string = event.event
	const eventId: string = event.id ?? ""

	console.log(`[webhook] Received: ${eventName} (id: ${eventId})`)

	// ── 4. Handle events ──────────────────────────────────────────────────────
	switch (eventName) {

		// ── Subscription: created ─────────────────────────────────────────────
		// Fires when a subscription object is created in Razorpay.
		case "subscription.created": {
			const sub = event.payload.subscription.entity
			console.log("[webhook] subscription.created:", {
				id: sub.id,
				plan_id: sub.plan_id,
				status: sub.status,
			})

			// TODO: call dbUpdateSubscription where razorpay_subscription_id = sub.id
			// set status = 'pending' (already set, but confirms the record is linked)
			// No-op for now — record was already created in createSubscriptionAction

			break
		}

		// ── Subscription: authenticated ───────────────────────────────────────
		// Fires after the user completes the mandate/auth step on the checkout page.
		// The first charge hasn't happened yet. Status moves to 'authenticated'.
		case "subscription.authenticated": {
			const sub = event.payload.subscription.entity
			console.log("[webhook] subscription.authenticated:", {
				id: sub.id,
				status: sub.status,
			})

			// TODO: call dbUpdateSubscription where razorpay_subscription_id = sub.id
			// set status = 'pending' (mandate confirmed, awaiting first charge)

			break
		}

		// ── Subscription: activated ───────────────────────────────────────────
		// Fires when the first payment is captured and the subscription goes live.
		// This is the primary event to flip status from 'pending' → 'active' in DB.
		case "subscription.activated": {
			const sub = event.payload.subscription.entity
			console.log("[webhook] subscription.activated:", {
				id: sub.id,
				plan_id: sub.plan_id,
				current_start: sub.current_start,
				current_end: sub.current_end,
				paid_count: sub.paid_count,
			})

			// TODO: call dbUpdateSubscription where razorpay_subscription_id = sub.id
			// set:
			//   status = 'active'
			//   current_period_start = new Date(sub.current_start * 1000).toISOString()
			//   current_period_end   = new Date(sub.current_end * 1000).toISOString()

			break
		}

		// ── Subscription: charged ─────────────────────────────────────────────
		// Fires on every successful recurring charge (2nd cycle onwards).
		// Use this to keep current_period_start / current_period_end up to date.
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

			// TODO: call dbUpdateSubscription where razorpay_subscription_id = sub.id
			// set:
			//   status = 'active'
			//   current_period_start = new Date(sub.current_start * 1000).toISOString()
			//   current_period_end   = new Date(sub.current_end * 1000).toISOString()
			// TODO: optionally create an order/invoice record in the orders table
			//   with payment_id, amount, subscription_id

			break
		}

		// ── Subscription: pending ─────────────────────────────────────────────
		// Fires when a recurring charge fails and Razorpay is retrying.
		// The subscription is still alive but payment is pending.
		case "subscription.pending": {
			const sub = event.payload.subscription.entity
			console.log("[webhook] subscription.pending:", {
				id: sub.id,
				remaining_count: sub.remaining_count,
			})

			// TODO: call dbUpdateSubscription where razorpay_subscription_id = sub.id
			// set status = 'pending'

			break
		}

		// ── Subscription: halted ──────────────────────────────────────────────
		// Fires when Razorpay exhausts all retries and halts the subscription.
		// The user's access should be revoked at this point.
		case "subscription.halted": {
			const sub = event.payload.subscription.entity
			console.log("[webhook] subscription.halted:", {
				id: sub.id,
				paid_count: sub.paid_count,
				remaining_count: sub.remaining_count,
			})

			// TODO: call dbUpdateSubscription where razorpay_subscription_id = sub.id
			// set status = 'failed'

			break
		}

		// ── Subscription: cancelled ───────────────────────────────────────────
		// Fires when the subscription is cancelled — either by the user,
		// by you via the API, or automatically at period end.
		case "subscription.cancelled": {
			const sub = event.payload.subscription.entity
			console.log("[webhook] subscription.cancelled:", {
				id: sub.id,
				ended_at: sub.ended_at,
			})

			// TODO: call dbUpdateSubscription where razorpay_subscription_id = sub.id
			// set:
			//   status = 'cancelled'
			//   cancelled_at = new Date(sub.ended_at * 1000).toISOString()  (if ended_at present)
			//   cancel_at_period_end = false  (it's already cancelled)

			break
		}

		// ── Subscription: completed ───────────────────────────────────────────
		// Fires when all billing cycles are exhausted (total_count reached).
		// Subscription ends naturally — not a failure.
		case "subscription.completed": {
			const sub = event.payload.subscription.entity
			console.log("[webhook] subscription.completed:", {
				id: sub.id,
				paid_count: sub.paid_count,
				total_count: sub.total_count,
			})

			// TODO: call dbUpdateSubscription where razorpay_subscription_id = sub.id
			// set status = 'cancelled'  (no 'completed' enum in DB — treat as ended)

			break
		}

		// ── Payment: captured ─────────────────────────────────────────────────
		// Fires when a payment is successfully captured.
		// For subscriptions, subscription.charged is more specific — but this
		// fires too and can be used as a fallback or for one-time payments.
		case "payment.captured": {
			const payment = event.payload.payment.entity
			console.log("[webhook] payment.captured:", {
				id: payment.id,
				subscription_id: payment.subscription_id ?? null,
				amount: payment.amount,
				currency: payment.currency,
			})

			// TODO: if payment.subscription_id is present, this is a subscription payment
			//   → optionally create an order record in the orders table
			// TODO: if payment.subscription_id is null, this is a one-time payment
			//   → handle one-time order flow here

			break
		}

		// ── Payment: failed ───────────────────────────────────────────────────
		// Fires when a payment attempt fails.
		// For subscriptions, Razorpay will retry — subscription.pending fires too.
		// For one-time payments, this is terminal.
		case "payment.failed": {
			const payment = event.payload.payment.entity
			console.log("[webhook] payment.failed:", {
				id: payment.id,
				subscription_id: payment.subscription_id ?? null,
				error_code: payment.error_code,
				error_description: payment.error_description,
			})

			// TODO: if payment.subscription_id is present — Razorpay handles retries,
			//   subscription.pending / subscription.halted will fire accordingly
			// TODO: if payment.subscription_id is null — mark the one-time order as failed

			break
		}

		// ── Unhandled ─────────────────────────────────────────────────────────
		default:
			console.log(`[webhook] Unhandled event: ${eventName}`)
	}

	// Always return 200 so Razorpay doesn't retry
	return NextResponse.json({ received: true })
}
