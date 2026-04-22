import Link from "next/link";

export default function NavItem({ href, active, label, icon }: { href: string; active: boolean; label: string; icon: string }) {
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