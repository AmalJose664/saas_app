'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createSubscriptionAction, upgradeSubscriptionAction } from '../lib/subscriptions/actions'
import type { Plan } from '../lib/plans/service'
import { Check } from 'lucide-react'

interface PlanCardProps {
	plan: Plan
	isCurrent?: boolean
	mode?: 'subscribe' | 'upgrade'
	currentSubscriptionId?: string
}

const PlanCard = ({ plan, isCurrent, mode = 'subscribe', currentSubscriptionId }: PlanCardProps) => {
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
			alert("Heading to " + result.checkoutUrl)
			window.location.href = result.checkoutUrl
		} catch {
			toast.error('Something went wrong. Please try again.')
		} finally {
			setLoading(false)
		}
	}

	const handleUpgrade = async () => {
		if (!currentSubscriptionId) {
			toast.error('No active subscription found')
			return
		}

		setLoading(true)
		try {
			const result = await upgradeSubscriptionAction(plan.id)
			if (!result.success) {
				toast.error(result.error)
				return
			}
			toast.success('Subscription upgraded successfully!')
			// Redirect to subscription page
			window.location.href = result.checkoutUrl
		} catch {
			toast.error('Something went wrong. Please try again.')
		} finally {
			setLoading(false)
		}
	}

	const handleClick = mode === 'upgrade' ? handleUpgrade : handleSubscribe

	// Button text based on mode and state
	const getButtonText = () => {
		if (loading) return mode === 'upgrade' ? 'Upgrading...' : 'Redirecting...'
		if (!plan.is_active) return 'Unavailable'
		if (isCurrent) return 'Current Plan'
		return mode === 'upgrade' ? 'Upgrade to This Plan' : 'Get Started'
	}

	return (
		<div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 flex flex-col h-full">
			<div className="mb-6">
				<div className='flex items-center justify-between'>
					<h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">
						{plan.name}
					</h2>
					{isCurrent && (
						<span className='text-xs uppercase bg-blue-500/30 border-blue-500 border rounded-full px-2 py-1'>
							current
						</span>
					)}
				</div>
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
				{true && ["6", "4", " 3"].map((f, i) => (
					<li key={i} className="flex items-center gap-2">
						<Check size={18} className='text-green-400' />
						{f}
					</li>
				))}
			</ul>

			<button
				onClick={handleClick}
				disabled={loading || !plan.is_active || isCurrent}
				className={`w-full py-3 px-4 rounded-lg font-semibold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed ${plan.name.toLowerCase().includes('pro')
					? 'bg-blue-600 text-white hover:bg-blue-700'
					: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
					}`}
			>
				{getButtonText()}
			</button>
		</div>
	)
}

export default PlanCard


