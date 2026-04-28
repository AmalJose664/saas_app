import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(req: NextRequest) {
	console.log("Requests from razorpay")
	const body = await req.text()
	const signature = req.headers.get("x-razorpay-signature") || ""
	const eventId = req.headers.get("x-razorpay-event-id") || ""

	const secret = process.env.RAZORPAY_WEBHOOK_SECRET!

	//  signature
	const expectedSignature = crypto
		.createHmac("sha256", secret)
		.update(body)
		.digest("hex")

	if (expectedSignature !== signature) {
		return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
	}

	const event = JSON.parse(body)

	//  events
	switch (event.event) {
		case "payment.captured": {
			const payment = event.payload.payment.entity

			const orderId = payment.order_id
			const paymentId = payment.id

			//  update  DB
			console.log("Payment success:", { orderId, paymentId })

			break
		}

		case "payment.failed": {
			const payment = event.payload.payment.entity
			console.log("Payment failed:", payment.id)
			break
		}

		default:
			console.log("Unhandled event:", event.event)
	}

	return NextResponse.json({ received: true })
}