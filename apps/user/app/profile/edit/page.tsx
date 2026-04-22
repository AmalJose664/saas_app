import { createClient } from '@myapp/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import EditProfileForm from './EditProfileForm'

export default async function EditProfilePage() {
	const supabase = await createClient()

	const {
		data: { user },
	} = await supabase.auth.getUser()

	if (!user) {
		redirect('/login')
	}

	const { data: profile } = await supabase
		.from('Profiles')
		.select('*')
		.eq('id', user.id)
		.single()

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col">
			<nav className="bg-white border-b border-gray-100 px-6 py-4">
				<div className="max-w-4xl mx-auto flex justify-between items-center">
					<Link
						href="/profile"
						className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
					>
						← Back to Profile
					</Link>
					<h1 className="font-bold text-gray-800">Edit Profile</h1>
				</div>
			</nav>

			<div className="flex-grow flex items-center justify-center p-6">
				<EditProfileForm
					userId={user.id}
					initialFullName={profile?.full_name || ''}
					initialAvatarUrl={profile?.avatar_url || ''}
				/>
			</div>
		</div>
	)
}
