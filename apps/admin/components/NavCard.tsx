/**
 * @file NavCard.tsx
 * @description Navigation card component for the admin home page (/).
 * Renders a clickable card that links to a dashboard section.
 *
 * UI Architecture:
 * NavCard (this component)
 *   ↓ renders
 * Next.js <Link> (client-side navigation)
 *   ↓ navigates to
 * Dashboard route (e.g., /dashboard/users)
 *
 * @example
 * <NavCard
 *   title="Users"
 *   description="Manage user profiles..."
 *   href="/dashboard/users"
 *   color="bg-blue-50"
 *   borderColor="border-blue-200"
 *   textColor="text-blue-700"
 * />
 */

import Link from 'next/link';

/** Props for the NavCard component */
interface NavCardProps {
	/** Card heading displayed in bold */
	title: string;
	/** Short description of the linked section */
	description: string;
	/** Next.js route to navigate to on click */
	href: string;
	/** Tailwind background color class (e.g., 'bg-blue-50') */
	color: string;
	/** Tailwind border color class (e.g., 'border-blue-200') */
	borderColor: string;
	/** Tailwind text color class (e.g., 'text-blue-700') */
	textColor: string;
}

/**
 * NavCard — clickable navigation card for the admin landing page.
 *
 * @param props — NavCardProps
 * @returns JSX.Element
 */
export default function NavCard({ title, description, href, color, borderColor, textColor }: NavCardProps) {
	return (
		<Link
			href={href}
			className={`block p-6 rounded-xl border ${borderColor} ${color} transition-all hover:-translate-y-1 hover:shadow-md`}
		>
			<h3 className={`text-lg font-bold mb-2 ${textColor}`}>{title}</h3>
			<p className="text-slate-600 text-sm">
				{description}
			</p>
			<div className={`mt-4 text-sm font-semibold ${textColor} flex items-center`}>
				Manage {title} <span className="ml-1">→</span>
			</div>
		</Link>
	);
}