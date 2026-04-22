'use client'
import { createClient } from '@myapp/supabase/client'
import { useRouter } from 'next/navigation'
import Orders from './Orders'

export default function Dashboard() {
	const supabase = createClient()
	const router = useRouter()



	const handleLogout = async () => {
		await supabase.auth.signOut()
		router.refresh()
		router.push('/login')
	}

	return (
		<div className="flex h-screen bg-gray-100">
			<aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col">
				<div className="p-6 text-2xl font-bold border-b border-slate-800">
					Admin Panel
				</div>
				<nav className="flex-1 p-4 space-y-2">
					<a href="#" className="block py-2.5 px-4 rounded bg-slate-800">Dashboard</a>
					<a href="#" className="block py-2.5 px-4 rounded hover:bg-slate-800 transition">Users</a>
					<a href="#" className="block py-2.5 px-4 rounded hover:bg-slate-800 transition">Settings</a>
				</nav>
			</aside>

			<div className="flex-1 flex flex-col overflow-hidden">
				<header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
					<h2 className="text-xl font-semibold text-gray-800">Overview</h2>

					<button
						onClick={handleLogout}
						className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition"
					>
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
						Logout
					</button>
				</header>

				<main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-8">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
						<StatCard title="Total Users" value="1,234" color="text-blue-600" />
						<StatCard title="Active Admins" value="12" color="text-green-600" />
						<StatCard title="Pending Reports" value="5" color="text-amber-600" />
					</div>

					<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
						<h3 className="text-lg font-semibold mb-4 text-gray-800">Recent Activity</h3>
						<div className="text-gray-500 italic">No recent logs found.</div>
					</div>
					<Orders />
				</main>
			</div>
		</div>
	)
}

function StatCard({ title, value, color }: { title: string, value: string, color: string }) {
	return (
		<div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
			<p className="text-sm font-medium text-gray-500 uppercase">{title}</p>
			<p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
		</div>
	)
}