import Logout from "@repo/ui/Logout";
import { headers } from "next/headers";
import Link from "next/link";

export default async function layout({
	children,
}: {
	children: React.ReactNode
}) {
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
					<h2 className="text-lg font-medium text-gray-700 capitalize">{pathname}</h2>
					<Logout />
				</header>

				<div className="px-4 py-4 ml-2">
					{children}
				</div>
			</div>
		</div>
	);

}

function NavItem({ href, active, label, icon }: { href: string; active: boolean; label: string; icon: string }) {
	return (
		<Link
			href={href}
			className={`flex items-center gap-3 py-2.5 px-4 rounded-lg transition-all duration-200 ${active
				? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
				: 'hover:bg-slate-800 hover:text-white'
				}`}
		>
			<span>{icon}</span>
			<span className="font-medium text-sm text-gray-100">{label}</span>
		</Link>
	);
}