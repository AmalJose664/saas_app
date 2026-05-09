/**
 * @file app/payment/success/page.tsx
 * @description Payment success page displayed after successful Razorpay subscription payment
 */
"use client"
import Link from 'next/link'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function SuccessContent() {
	const searchParams = useSearchParams()
	const subscriptionId = searchParams.get('subscription_id')
	const viewSubscriptionLink = subscriptionId 
		? `/dashboard/subscriptions/${subscriptionId}` 
		: "/dashboard/subscriptions"

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
			<div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
				<div className="mb-6 flex justify-center">
					<CheckCircle className="w-12 h-12 text-blue-600" />
				</div>

				<h1 className="text-3xl font-bold text-gray-900 mb-4">
					Payment Successful!
				</h1>

				<p className="text-gray-600 mb-8">
					Your subscription has been activated successfully. You can now enjoy all the premium features.
				</p>

				<div className="space-y-4">
					<Link
						href="/dashboard"
						className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
					>
						Go to Dashboard
						<ArrowRight className="w-5 h-5" />
					</Link>

					<Link
						href={viewSubscriptionLink}
						className="block w-full bg-gray-100 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
					>
						View Subscription Details
					</Link>
				</div>

				<div className="mt-8 pt-6 border-t border-gray-200">
					<p className="text-sm text-gray-500">
						A confirmation email has been sent to your registered email address.
					</p>
				</div>
			</div>
		</div>
	)
}

export default function PaymentSuccessPage() {
	return (
		<Suspense fallback={
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Loading...</p>
				</div>
			</div>
		}>
			<SuccessContent />
		</Suspense>
	)
}
