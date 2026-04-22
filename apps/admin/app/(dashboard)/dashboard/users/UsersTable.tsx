import Link from 'next/link'
import { getUsersPaginated } from '../../../../lib/users/service'
import UsersSearchInput from './UsersSearchInput'

interface UsersTableProps {
	search?: string
	page?: number
}

export default async function UsersTable({ search = '', page = 1 }: UsersTableProps) {
	const result = await getUsersPaginated({ search, page })

	if (!result.success) {
		return (
			<div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-600">
				<p className="font-semibold">Error loading users</p>
				<p className="text-sm">{result.error}</p>
			</div>
		)
	}

	const { data: profiles, count, totalPages, currentPage } = result

	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

			<div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
				<div>
					<h3 className="text-lg font-semibold text-gray-800">User Directory</h3>
					<p className="text-xs text-gray-500">
						{count} registered {count === 1 ? 'user' : 'users'}
						{search ? ` matching "${search}"` : ''}
					</p>
				</div>
				<UsersSearchInput defaultValue={search} />
			</div>

			<div className="overflow-x-auto">
				<table className="w-full text-left border-collapse">
					<thead>
						<tr className="bg-gray-50/50 border-b border-gray-200">
							<th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">User Profile</th>
							<th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Role</th>
							<th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
							<th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Joined Date</th>
							<th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100">
						{profiles.map((profile) => (
							<tr key={profile.id} className="hover:bg-slate-50/50 transition-colors group">
								<td className="px-6 py-4">
									<div className="flex items-center gap-4">
										<div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold ring-2 ring-white shadow-sm">
											{profile.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || '??'}
										</div>
										<div>
											<div className="text-sm font-semibold text-gray-900">{profile.full_name || 'Anonymous'}</div>
											<div className="text-xs text-gray-500 font-medium">{profile.email}</div>
										</div>
									</div>
								</td>
								<td className="px-6 py-4">
									<span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold tracking-tight ${profile.role === 'admin'
										? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
										: 'bg-slate-100 text-slate-700 border border-slate-200'
										}`}>
										{profile.role?.toUpperCase() || 'USER'}
									</span>
								</td>
								<td className="px-6 py-4">
									<div className="flex items-center gap-2">
										<div className={`w-2 h-2 rounded-full ${profile.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`} />
										<span className="text-sm font-medium text-gray-700">
											{profile.is_active ? 'Active' : 'Inactive'}
										</span>
									</div>
								</td>
								<td className="px-6 py-4 text-sm text-gray-500 tabular-nums">
									{new Date(profile.created_at).toLocaleDateString('en-IN', {
										month: 'short',
										day: 'numeric',
										year: 'numeric',
									})}
								</td>
								<td className="px-6 py-4 text-right">
									<Link
										href={`/dashboard/users/${profile.id}`}
										className="text-slate-400 hover:text-blue-600 font-semibold text-xs uppercase tracking-tighter transition-colors"
									>
										Manage
									</Link>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{profiles.length === 0 && (
				<div className="p-20 text-center">
					<p className="text-gray-400 italic">
						{search ? `No users found matching "${search}".` : 'No users found in the system.'}
					</p>
				</div>
			)}

			{totalPages > 1 && (
				<div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
					<p className="text-xs text-gray-500">
						Page {currentPage} of {totalPages}
					</p>
					<div className="flex items-center gap-2">
						<PaginationLink href={buildHref(search, currentPage - 1)} disabled={currentPage <= 1} label="← Prev" />
						{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
							<PaginationLink key={p} href={buildHref(search, p)} active={p === currentPage} label={String(p)} />
						))}
						<PaginationLink href={buildHref(search, currentPage + 1)} disabled={currentPage >= totalPages} label="Next →" />
					</div>
				</div>
			)}
		</div>
	)
}

function buildHref(search: string, page: number) {
	const params = new URLSearchParams()
	params.set('tab', 'users')
	if (search) params.set('search', search)
	if (page > 1) params.set('page', String(page))
	return `/dashboard?${params.toString()}`
}

function PaginationLink({
	href,
	label,
	active = false,
	disabled = false,
}: {
	href: string
	label: string
	active?: boolean
	disabled?: boolean
}) {
	if (disabled) {
		return (
			<span className="px-3 py-1.5 text-xs rounded-md text-gray-300 cursor-not-allowed select-none">
				{label}
			</span>
		)
	}
	return (
		<Link
			href={href}
			className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${active
				? 'bg-blue-600 text-white'
				: 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
				}`}
		>
			{label}
		</Link>
	)
}
