/**
 * @file app/dashboard/layout.tsx
 * @description Persistent shell for all /dashboard/* routes.
 *
 * Server Component. Fetches the authenticated user to display their
 * avatar in the top navigation bar.
 *
 * Architecture:
 * DashboardLayout (Server Component)
 *   ├── Navbar: app name, avatar link → /profile, Logout button
 *   └── {children}: matched page (e.g. dashboard/page.tsx)
 *
 * The avatar is sourced from user_metadata.avatar_url (set by Google OAuth).
 * The Logout button is a shared Client Component from @workspace/ui.
 *
 * @param children - the page content rendered by the matched route
 */
import { getAuthUser } from "../../lib/auth/server"
import Logout from "@workspace/ui/Logout"
import Link from "next/link";

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { user } = await getAuthUser();
	return (
		<div className="min-h-screen bg-gray-50">
			<nav className="bg-white border-b border-gray-100 px-6 py-4">
				<div className="max-w-7xl mx-auto flex justify-between items-center">
					<span className="text-xl font-bold text-gray-800">Simple Subscription Service</span>
					<div className="flex items-center gap-4">
						<div>
							<Link href={"/profile"}><img className='w-10 rounded-full' src={user?.user_metadata.avatar_url} alt="Avatar url" /></Link>
						</div>
						<Logout />
					</div>
				</div>
			</nav>

			{children}

		</div>
	)
}
