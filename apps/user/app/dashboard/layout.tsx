/**
 * @file app/dashboard/layout.tsx
 * @description Persistent shell for all /dashboard/* routes.
 *
 * Architecture:
 * DashboardLayout (Server Component)
 *   ├── Sidebar: App branding and DashboardNav
 *   └── Main Content: Topbar (Avatar & Logout) + {children}
 */
import { getAuthUser } from "../../lib/auth/server"
import Logout from "@workspace/ui/my-components/Logout"
import Link from "next/link";
import DashboardNav from "../../components/DashboardNav";

export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { user } = await getAuthUser();

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
			{/* Sidebar for Desktop */}
			<aside className="w-full md:w-64 bg-white border-r border-gray-100 flex-shrink-0 md:min-h-screen flex flex-col">
				<div className="px-6 py-6 border-b border-gray-100">
					<span className="text-xl font-bold text-blue-600 tracking-tight">SaaS App</span>
				</div>
				<div className="p-4 flex-grow">
					<DashboardNav />
				</div>
			</aside>

			{/* Main Content Area */}
			<div className="flex-1 flex flex-col min-h-screen overflow-hidden">
				{/* Topbar */}
				<header className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between md:justify-end items-center sticky top-0 z-10">
					<div className="md:hidden">
						<span className="text-lg font-bold text-gray-800">SaaS App</span>
					</div>
					<div className="flex items-center gap-4">
						<Link href={"/profile"} className="hover:opacity-80 transition-opacity">
							{user?.user_metadata?.avatar_url ? (
								<img className="w-10 h-10 rounded-full border-2 border-gray-100" src={user.user_metadata.avatar_url} alt="Avatar" />
							) : (
								<div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
									{(user?.email || "U").toUpperCase()[0]}
								</div>
							)}
						</Link>
						<Logout />
					</div>
				</header>

				{/* Page Content */}
				<main className="flex-1 overflow-y-auto">
					{children}
				</main>
			</div>
		</div>
	)
}
