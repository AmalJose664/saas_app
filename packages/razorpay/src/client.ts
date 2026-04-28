import Razorpay from 'razorpay'

/**
 * Razorpay SDK client — server-side only.
 *
 * Instantiated once and reused across all server-side calls.
 * Never import this in client components or browser code.
 *
 * Requires:
 *   RAZORPAY_KEY_ID     — from Razorpay dashboard (test or live)
 *   RAZORPAY_KEY_SECRET — from Razorpay dashboard (test or live)
 */

let razorpayInstance: Razorpay | null = null

export function getRazorpay() {
	if (razorpayInstance) return razorpayInstance

	const keyId = process.env.RAZORPAY_KEY_ID
	const keySecret = process.env.RAZORPAY_KEY_SECRET

	if (!keyId) {
		throw new Error('Missing env: RAZORPAY_KEY_ID')
	}
	if (!keySecret) {
		throw new Error('Missing env: RAZORPAY_KEY_SECRET')
	}

	razorpayInstance = new Razorpay({
		key_id: keyId,
		key_secret: keySecret,
	})

	return razorpayInstance
}