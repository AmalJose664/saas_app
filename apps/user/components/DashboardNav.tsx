"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, CreditCard, Receipt, Package, User } from "lucide-react"

const navItems = [
	{ name: "Dashboard", href: "/dashboard", icon: Home },
	{ name: "Subscription", href: "/dashboard/subscription", icon: CreditCard },
	{ name: "Orders", href: "/dashboard/orders", icon: Package },
	{ name: "Payments", href: "/dashboard/payments", icon: Receipt },
	{ name: "Profile", href: "/profile", icon: User },
]

export default function DashboardNav() {
	const pathname = usePathname()

	return (
		<nav className="flex flex-col gap-2">
			{navItems.map((item) => {
				const Icon = item.icon
				// Exact match for dashboard, startsWith for others to highlight active states correctly
				const isActive = item.href === "/dashboard" 
					? pathname === "/dashboard"
					: pathname.startsWith(item.href)

				return (
					<Link
						key={item.href}
						href={item.href}
						className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
							isActive
								? "bg-blue-50 text-blue-700 font-semibold"
								: "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
						}`}
					>
						<Icon className={`w-5 h-5 ${isActive ? "text-blue-600" : "text-gray-400"}`} />
						{item.name}
					</Link>
				)
			})}
		</nav>
	)
}
