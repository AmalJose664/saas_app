import Link from "next/link";

export default function NavCard({ title, description, href, color, borderColor, textColor }: any) {
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