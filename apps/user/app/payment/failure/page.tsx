/**
 * @file app/payment/failure/page.tsx
 * @description Payment failure page displayed when Razorpay subscription payment fails
 */

'use client'

import Link from 'next/link'
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function FailureContent() {
	const searchParams = useSearchParams()
	const reason = searchParams.get('reason')

	const getErrorMessage = () => {
		switch (reason) {
			case 'missing_parameters':
				return 'Payment verification failed due to missing information.'
			case 'authentication_failed':
				return 'Unable to verify your identity. Please log in again.'
			case 'subscription_not_found':
				return 'Subscription details could not be found in our system.'
			case 'server_error':
				return 'An unexpected error occurred while processing your payment.'
			default:
				return 'Your payment could not be completed. Please try again.'
		}
	}

	const getErrorTitle = () => {
		switch (reason) {
			case 'authentication_failed':
				return 'Authentication Required'
			case 'subscription_not_found':
				return 'Subscription Not Found'
			case 'server_error':
				return 'Server Error'
			default:
				return 'Payment Failed'
		}
	}

	return (
		<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
			<div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
				<div className="mb-6 flex justify-center">
					<XCircle className="w-12 h-12 text-red-500" />
				</div>

				<h1 className="text-3xl font-bold text-gray-900 mb-4">
					{getErrorTitle()}
				</h1>

				<p className="text-gray-600 mb-8">
					{getErrorMessage()}
				</p>

				<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
					<p className="text-sm text-yellow-800">
						<strong>Note:</strong> If money was deducted from your account, it will be refunded within 5-7 business days.
					</p>
				</div>

				<div className="space-y-4">
					<Link
						href="/dashboard"
						className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
					>
						<RefreshCw className="w-5 h-5" />
						Try Again
					</Link>

					<Link
						href="/dashboard"
						className="flex items-center justify-center gap-2 w-full bg-gray-100 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
					>
						<ArrowLeft className="w-5 h-5" />
						Back to Dashboard
					</Link>
				</div>

				<div className="mt-8 pt-6 border-t border-gray-200">
					<p className="text-sm text-gray-500">
						Need help? Contact our support team at{' '}
						<a href="mailto:support@example.com" className="text-blue-600 hover:underline">
							support@example.com
						</a>
					</p>
				</div>
			</div>
		</div>
	)
}

export default function PaymentFailurePage() {
	return (
		<Suspense fallback={
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Loading...</p>
				</div>
			</div>
		}>
			<FailureContent />
		</Suspense>
	)
}
