/**
 * @file app/(dashboard)/dashboard/layout.tsx
 * @description Dashboard layout — wraps every /dashboard/* route with a
 * persistent sidebar navigation and top header.
 *
 * This is a **Server Component** so it can read request headers to determine
 * the active route and highlight the correct NavItem.
 *
 * Architecture:
 * layout.tsx (Server Component)
 *   ├── Sidebar: NavItem[]  (persistent navigation)
 *   ├── Header: pathname display + Logout button
 *   └── children: page.tsx  (dynamic content)
 */

import Logout from '@repo/ui/Logout';
import { headers } from 'next/headers';
import Link from 'next/link';
import NavItem from '../../../components/NavItem';

/**
 * DashboardLayout — persistent shell for all dashboard routes.
 *
 * @param children — the page content rendered by the matched route
 */
export default async function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// Read the x-pathname header injected by middleware.ts so we know
	// which route is currently active for sidebar highlighting.
	const headerList = await headers();
	const pathname = headerList.get('x-pathname')?.toLowerCase();
	return (
		<div className="flex h-screen bg-background">
			<aside className="w-64 bg-slate-900 hidden md:flex flex-col border-r border-slate-800">
				<div className="p-6 text-gray-100 text-xl font-bold tracking-tight border-b border-slate-800 flex items-center gap-2">
					<div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-sm">S</div>
					Admin Portal
				</div>
				<nav className="flex-1 p-4 space-y-1">
					<NavItem href="/dashboard/" active={pathname?.endsWith("dashboard") || false} label="Overview" icon="📊" />
					<NavItem href="/dashboard/users/" active={pathname?.endsWith("users") || false} label="Customers" icon="👥" />
					<NavItem href="/dashboard/orders/" active={pathname?.endsWith("orders") || false} label="Orders" icon="📦" />
					<NavItem href="/dashboard/subscriptions/" active={pathname?.endsWith("subscriptions") || false} label="Subscriptions" icon="💳" />
					<NavItem href="/dashboard/plans" active={pathname?.endsWith("plans") || false} label="Manage Plans" icon="" />
				</nav>
			</aside>

			<div className="flex-1 flex flex-col overflow-hidden">
				<header className="h-16 py-2 bg-white border-b border-gray-200 flex items-center justify-between px-8">
					<h2 className="text-lg font-medium text-gray-700 capitalize">Dashboard</h2>
					<Logout />
				</header>

				<div className="px-4 py-4 ml-2">
					{children}
				</div>
			</div>
		</div>
	);

}

