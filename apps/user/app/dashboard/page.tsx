'use client'

import { createClient } from '@myapp/supabase'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logout from '@repo/ui/Logout'

interface Plan {
	id: string
	name: string
	amount: number
	interval: string
	razorpay_plan_id: string | null
}

export default function DashboardPage() {
	const supabase = createClient()
	const router = useRouter()

	const [user, setUser] = useState<any>(null)
	const [plans, setPlans] = useState<Plan[]>([])
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const initializeDashboard = async () => {
			const { data: { user } } = await supabase.auth.getUser()
			if (!user) {
				router.push('/login')
				return
			}
			setUser(user)

			const { data: plansData, error } = await supabase
				.from('Plan')
				.select('*')
				.eq('is_active', true)
				.order('amount', { ascending: true })

			if (!error && plansData) {
				setPlans(plansData)
			}
			setLoading(false)
		}

		initializeDashboard()
	}, [router, supabase])

	const handleLogout = async () => {
		await supabase.auth.signOut()
		router.push('/login')
	}

	const handlePurchase = (planId: string) => {
		console.log("Initiating purchase for plan:", planId)
		alert("Redirecting to payment gateway...")
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gray-50">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<nav className="bg-white border-b border-gray-100 px-6 py-4">
				<div className="max-w-7xl mx-auto flex justify-between items-center">
					<span className="text-xl font-bold text-gray-800">Simple Subscription Service</span>
					<div className="flex items-center gap-4">
						<div>
							<Link href={"/profile"}><img className='w-10 rounded-full' src={user.user_metadata.avatar_url} alt="Avatar url" /></Link>
						</div>
						<Logout />
					</div>
				</div>
			</nav>

			<main className="max-w-7xl mx-auto px-6 py-12">
				<div className="text-center mb-12">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
					<p className="text-gray-600">Choose a plan that fits your needs to get started.</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{plans.map((plan) => (
						<div
							key={plan.id}
							className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 flex flex-col h-full"
						>
							<div className="mb-6">
								<h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">
									{plan.name}
								</h2>
								<div className="mt-4 flex items-baseline">
									<span className="text-4xl font-extrabold text-gray-900">
										₹{plan.amount}
									</span>
									<span className="ml-1 text-gray-500 text-sm">
										/{plan.interval}
									</span>
								</div>
							</div>

							<ul className="space-y-4 mb-8 flex-grow text-gray-600">
								<li className="flex items-center gap-2">
									<svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
									</svg>
									Access to all features
								</li>
								<li className="flex items-center gap-2">
									<svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
									</svg>
									Priority Support
								</li>
							</ul>

							<button
								onClick={() => handlePurchase(plan.id)}
								className={`w-full py-3 px-4 rounded-lg font-semibold shadow-md transition-all ${plan.name.toLowerCase().includes('pro')
									? "bg-blue-600 text-white hover:bg-blue-700"
									: "bg-gray-100 text-gray-800 hover:bg-gray-200"
									}`}
							>
								Get Started
							</button>
						</div>
					))}
				</div>
			</main>
		</div>
	)
}