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

if (!process.env.RAZORPAY_KEY_ID) {
	throw new Error('Missing env: RAZORPAY_KEY_ID')
}
if (!process.env.RAZORPAY_KEY_SECRET) {
	throw new Error('Missing env: RAZORPAY_KEY_SECRET')
}

export const razorpay = new Razorpay({
	key_id: process.env.RAZORPAY_KEY_ID,
	key_secret: process.env.RAZORPAY_KEY_SECRET,
})
