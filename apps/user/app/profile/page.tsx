/**
 * @file app/profile/page.tsx
 * @description User profile view — read-only display of account details.
 *
 * Server Component. Fetches the authenticated user and their profile row
 * from the `profiles` table. Redirects to /login if no session exists.
 *
 * Displays: avatar, full name, username, email, member since date.
 * Links to /profile/edit for making changes.
 */
import { createClient } from '@myapp/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default async function ProfilePage() {
	const supabase = await createClient()

	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect('/login')
	}

	const { data: profile } = await supabase
		.from('profiles')
		.select('*')
		.eq('id', user.id)
		.single()

	const displayName = profile?.full_name || user.email || 'User'
	const avatarLetter = displayName.charAt(0).toUpperCase()

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col">
			{/* Header */}
			<nav className="bg-white border-b border-gray-100 px-6 py-4">
				<div className="max-w-4xl mx-auto flex justify-between items-center">
					<Link
						href="/dashboard"
						className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
					>
						← Back to Dashboard
					</Link>
					<h2 className="font-bold text-gray-800">My Profile</h2>
				</div>
			</nav>

			<div className="flex-grow flex items-center justify-center p-6">
				<div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-8 border border-gray-100">
					{/* Avatar & Name */}
					<div className="flex flex-col items-center mb-8">
						{profile?.avatar_url ? (
							<Image width={20} height={20}
								src={profile.avatar_url}
								alt="Profile avatar"
								className="w-20 h-20 rounded-full object-cover border-2 border-blue-100 mb-4"
							/>
						) : (
							<div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl font-bold mb-4">
								{avatarLetter}
							</div>
						)}
						<h2 className="text-2xl font-bold text-gray-800">
							{profile?.full_name || 'No name set'}
						</h2>
						{profile?.username && (
							<p className="text-blue-500 text-sm mt-1">@{profile.username}</p>
						)}
						<p className="text-gray-500 text-sm mt-1">{user.email}</p>
					</div>

					{/* Profile Details */}
					<div className="space-y-4">
						<div className="bg-gray-50 rounded-xl px-5 py-4">
							<p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
								Email Address
							</p>
							<p className="text-gray-800 font-medium">{user.email}</p>
						</div>

						<div className="bg-gray-50 rounded-xl px-5 py-4">
							<p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
								Full Name
							</p>
							<p className="text-gray-800 font-medium">
								{profile?.full_name || <span className="text-gray-400 italic">Not provided</span>}
							</p>
						</div>

						<div className="bg-gray-50 rounded-xl px-5 py-4">
							<p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
								Member Since
							</p>
							<p className="text-gray-800 font-medium">
								{new Date(user.created_at).toLocaleDateString('en-US', {
									year: 'numeric',
									month: 'long',
									day: 'numeric',
								})}
							</p>
						</div>
					</div>

					{/* Edit Link */}
					<div className="mt-6">
						<Link
							href="/profile/edit"
							className="block w-full text-center py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all"
						>
							Edit Profile
						</Link>
					</div>
				</div>
			</div>
		</div>
	)
}
