/**
 * @file app/payment/layout.tsx
 * @description Layout component for the payment pages.
 * Acts as a middleware layer to restrict direct access to the payment success/failure pages.
 * It checks for a short-lived `payment_session` cookie (set during the Razorpay callback).
 * If the cookie is missing, the user is redirected back to the dashboard.
 */
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function PaymentLayout({
	children,
}: {
	children: React.ReactNode
}) {
	const cookieStore = await cookies()
	const paymentSession = cookieStore.get('payment_session')

	// If there's no valid payment session cookie, redirect them away
	// to prevent direct access to the success/failure pages
	if (!paymentSession?.value) {
		redirect('/dashboard')
	}

	return <>{children}</>
}
