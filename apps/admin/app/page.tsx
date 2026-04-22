'use client'
import { createClient } from '@myapp/supabase'
import { useRouter } from 'next/navigation'

export default function Home() {
	const supabase = createClient()
	const router = useRouter()

	const handleLogout = async () => {
		await supabase.auth.signOut()
		router.refresh()
		router.push('/login')
	}

	return (
		<div className="min-h-screen bg-slate-50 p-8">
			<div className="max-w-5xl mx-auto flex justify-between items-center mb-12">
				<div>
					<h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
					<p className="text-slate-600 mt-2">
						Simple Subscription Service Tracking Page
					</p>
				</div>

				<button
					onClick={handleLogout}
					className="bg-white px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition"
				>
					Logout
				</button>
			</div>


		</div>
	);
}