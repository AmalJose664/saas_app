/**
 * @file app/page.tsx
 * @description Admin landing page (root route "/").
 *
 * This is a **Server Component** that checks for an authenticated session.
 * If the user is already logged in, they are redirected straight to
 * /dashboard so they never have to click through the landing page twice.
 *
 * Architecture:
 * Server Component (this)
 *   ↓ checks
 * Supabase Server Client (@workspace/supabase/server)
 *   ↓ if session exists
 * Next.js redirect() → /dashboard
 *   ↓ if no session
 * Render landing page with links to /login and /dashboard
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@workspace/supabase/server';
import NavCard from '../components/NavCard';

/**
 * AdminDashboardHome — server-side landing page with auth-aware redirect.
 *
 * @returns JSX.Element — either redirects or renders the landing page
 */
export default async function AdminDashboardHome() {
	// ─── Check for existing session ───────────────────────────────
	const supabase = await createClient();
	const { data: { session } } = await supabase.auth.getSession();

	// If already authenticated, skip the landing page entirely
	if (session) {
		redirect('/dashboard');
	}

	// ─── Render landing page for unauthenticated visitors ─────────
	return (
		<div className="min-h-screen bg-slate-50 p-8">
			<div className="max-w-5xl mx-auto">
				{/* Header + action links */}
				<div className="flex justify-between items-center mb-12">
					<div>
						<h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
						<p className="text-slate-600 mt-2">
							Subscription Service Management Portal
						</p>
					</div>
					<div className="flex gap-3 items-center">
						<Link
							href="/dashboard"
							className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition shadow-sm"
						>
							Dashboard
						</Link>
						<Link
							href="/login"
							className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-medium transition shadow-sm"
						>
							Login
						</Link>
					</div>
				</div>

				<h2 className="text-xl font-semibold text-slate-800 mb-6">Quick Management</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<NavCard
						title="Users"
						description="Manage user profiles, roles, and view individual histories."
						href="/dashboard/users"
						color="bg-blue-50"
						borderColor="border-blue-200"
						textColor="text-blue-700"
					/>

					<NavCard
						title="Subscriptions"
						description="Track active, canceled, and past-due subscriptions."
						href="/dashboard/subscriptions"
						color="bg-indigo-50"
						borderColor="border-indigo-200"
						textColor="text-indigo-700"
					/>

					<NavCard
						title="Orders"
						description="View payment history, invoices, and failed transactions."
						href="/dashboard/orders"
						color="bg-emerald-50"
						borderColor="border-emerald-200"
						textColor="text-emerald-700"
					/>

					<NavCard
						title="Plans"
						description="Create or edit pricing tiers, features, and active status."
						href="/dashboard/plans"
						color="bg-purple-50"
						borderColor="border-purple-200"
						textColor="text-purple-700"
					/>
				</div>
			</div>
		</div>
	);
}

