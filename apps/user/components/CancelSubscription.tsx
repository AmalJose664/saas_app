/**
 * @file components/CancelSubscription.tsx
 * @description Button component with a confirmation dialog to cancel an active subscription.
 */
"use client"

import { useState } from "react"
import { toast } from "sonner"
import { cancelSubscription } from "../lib/subscriptions/actions"
import { useRouter } from "next/navigation"
import { Button } from "@workspace/ui/components/button"

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@workspace/ui/components/dialog"

const CancelSubscriptionButton = ({ currentSubscriptionId, btnText }: {
	currentSubscriptionId: string | null,
	btnText?: string
}) => {
	const [loading, setLoading] = useState(false)
	const router = useRouter()
	const [isOpen, setIsOpen] = useState(false);
	const handleClick = async (cancelAtCycleEnd: boolean) => {

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
			<Dialog>
				<DialogTrigger asChild>
					<Button variant="destructive" disabled={loading}>
						{loading ? "Loading..." : btnText || "Cancel Subscription"}
					</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="text-xl">
							Are you absolutely sure?
						</DialogTitle>
						<DialogDescription>
							This action cannot be undone. This will permanently delete your subscription.
						</DialogDescription>
					</DialogHeader>
					{loading ? (
						<div className="flex flex-col items-center justify-center py-8 space-y-4">
							<div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
							<p className="text-sm font-medium text-gray-600 animate-pulse">Processing cancellation...</p>
						</div>
					) : (

						<div className="flex items-center gap-4 flex-col">
							<Button variant="outline" disabled={loading} onClick={() => handleClick(false)}>
								Cancel Subscription now
							</Button>
							<Button variant="outline" disabled={loading} onClick={() => handleClick(true)}>
								Cancel Subscription at billing end
							</Button>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</>
	)
}
export default CancelSubscriptionButton