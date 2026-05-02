import { redirect } from "next/navigation";
import PlanCard from "../../../components/PlanCard";
import { getAllPlans } from "../../../lib/plans/service";
import { getCurrentSubscription } from "../../../lib/subscriptions/service";
import { getAuthUser } from "../../../lib/auth/server";

const page = async () => {
	const { user } = await getAuthUser()

	if (!user) {
		redirect('/login')
	}

	const result = await getAllPlans();
	const currentSubscription = await getCurrentSubscription(user.id)

	if (!result.success) {
		return (
			<div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-600">
				<p className="font-semibold">Error loading plans</p>
				<p className="text-sm">{result.error}</p>
			</div>
		)
	}

	const plans = result.data
	const hasActiveSubscription = currentSubscription.success && currentSubscription.data

	return (
		<main className="max-w-7xl mx-auto px-6 py-12">
			<div className="text-center mb-12">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">
					{hasActiveSubscription ? 'Upgrade / Change Plan' : 'Choose Your Plan'}
				</h1>
				<p className="text-gray-600">
					{hasActiveSubscription
						? 'Select a new plan to upgrade or change your subscription.'
						: 'Choose a plan that fits your needs to get started.'}
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
				{plans && plans.map((plan) => (
					<PlanCard
						key={plan.id}
						plan={plan}
						isCurrent={hasActiveSubscription ? currentSubscription.data?.plan_id === plan.id : false}
						mode={hasActiveSubscription ? 'upgrade' : 'subscribe'}
						currentSubscriptionId={hasActiveSubscription ? currentSubscription.data?.id : undefined}
					/>
				))}
			</div>
		</main>
	)
}

export default page