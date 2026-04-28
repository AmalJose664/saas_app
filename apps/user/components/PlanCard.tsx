'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createSubscriptionAction } from '../lib/subscriptions/actions'
import type { Plan } from '../lib/plans/service'

interface PlanCardProps {
	plan: Plan
}

const PlanCard = ({ plan }: PlanCardProps) => {
	const [loading, setLoading] = useState(false)

	const handleSubscribe = async () => {
		setLoading(true)
		try {
			const result = await createSubscriptionAction(plan.id)
			if (!result.success) {
				toast.error(result.error)
				return
			}
			// Redirect to Razorpay hosted checkout
			window.location.href = result.checkoutUrl
		} catch {
			toast.error('Something went wrong. Please try again.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 flex flex-col h-full">
			<div className="mb-6">
				<h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">
					{plan.name}
				</h2>
				<div className="mt-4 flex items-baseline">
					<span className="text-4xl font-extrabold text-gray-900">
						₹{Math.floor(plan.amount / 100)}
					</span>
					<span className="ml-1 text-gray-500 text-sm">
						/{plan.interval}
					</span>
				</div>
			</div>

			<ul className="space-y-4 mb-8 flex-grow text-gray-600">
				<li className="flex items-center gap-2">
					<CheckIcon />
					Access to all features
				</li>
				<li className="flex items-center gap-2">
					<CheckIcon />
					Priority Support
				</li>
			</ul>

			<button
				onClick={handleSubscribe}
				disabled={loading || !plan.is_active}
				className={`w-full py-3 px-4 rounded-lg font-semibold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed ${plan.name.toLowerCase().includes('pro')
						? 'bg-blue-600 text-white hover:bg-blue-700'
						: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
					}`}
			>
				{loading ? 'Redirecting...' : !plan.is_active ? 'Unavailable' : 'Get Started'}
			</button>
		</div>
	)
}

export default PlanCard

function CheckIcon() {
	return (
		<svg className="w-5 h-5 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
		</svg>
	)
}
