"use client"

import { useState } from "react"
import { toast } from "sonner"
import { cancelSubscription } from "../lib/subscriptions/actions"
import { useRouter } from "next/navigation"
import ConfirmationModal from "@repo/ui/ConfirmModel"
import { createPortal } from "react-dom"


const CancelSubscriptionButton = ({ currentSubscriptionId, cancelAtCycleEnd, btnText }: {
	currentSubscriptionId: string | null,
	cancelAtCycleEnd?: boolean,
	btnText?: string
}) => {
	const [loading, setLoading] = useState(false)
	const router = useRouter()
	const [isOpen, setIsOpen] = useState(false);
	const handleClick = async () => {

		if (!currentSubscriptionId) {
			toast.error('No active subscription found')
			return
		}

		setLoading(true)

		try {
			const result = await cancelSubscription(currentSubscriptionId, !!cancelAtCycleEnd)
			if (!result.success) {
				toast.error(result.error)
				return
			}
			toast.success('Subscription cancelled successfully!')
			router.refresh()
		} catch (error) {
			console.log(error, " from btn")
			toast.error('Something went wrong. Please try again.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<>
			<button
				onClick={() => setIsOpen(true)}
				className="flex-1 py-3 shadow-md bg-gray-100 border px-3 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all"
			>
				{loading ? "Loading..." : btnText || "Cancel Subscription"}
			</button>
			{isOpen && createPortal(
				<div
					style={{
						position: 'fixed',
						inset: 0,
						zIndex: 9999,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						backgroundColor: 'rgba(0, 0, 0, 0.5)',
					}}
					onClick={() => setIsOpen(false)}
				>
					<div
						onClick={(e) => e.stopPropagation()}
						style={{ position: 'relative', zIndex: 10000, maxWidth: '480px', width: '100%' }}
					>
						<ConfirmationModal
							isOpen={isOpen}
							title={btnText || "Cancel Subscription"}
							subtext="This action is permanent and will remove this subscription from your account. Continue?"
							confirmText="Confirm"
							cancelText="Go Back"
							variant="danger"
							isLoading={loading}
							onCancel={() => setIsOpen(false)}
							onConfirm={handleClick}
						/>
					</div>
				</div>,
				document.body
			)}
		</>
	)
}
export default CancelSubscriptionButton