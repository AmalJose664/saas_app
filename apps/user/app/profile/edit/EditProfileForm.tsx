'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfile } from './actions'

interface Props {
	userId: string
	initialFullName: string
	initialAvatarUrl: string
}

export default function EditProfileForm({ userId, initialFullName, initialAvatarUrl }: Props) {
	const router = useRouter()
	const [fullName, setFullName] = useState(initialFullName)
	const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl)
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState('')

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setSaving(true)
		setError('')

		const result = await updateProfile({ userId, fullName, avatarUrl })
		console.log(result, " < <<")
		if (result?.error) {
			setError(result.error)
			setSaving(false)
		} else {
			setSaving(false)
			router.push('/profile')
		}
	}

	const avatarLetter = fullName?.charAt(0).toUpperCase() || '?'

	return (
		<div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-8 border border-gray-100">
			<div className="flex flex-col items-center mb-8">
				{avatarUrl ? (
					<img
						src={avatarUrl}
						alt="Avatar preview"
						className="w-20 h-20 rounded-full object-cover border-2 border-blue-100 mb-4"
						onError={(e) => {
							; (e.currentTarget as HTMLImageElement).style.display = 'none'
							document.getElementById('avatar-fallback')!.style.display = 'flex'
						}}
					/>
				) : null}
				<div
					id="avatar-fallback"
					className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full items-center justify-center text-3xl font-bold mb-4"
					style={{ display: avatarUrl ? 'none' : 'flex' }}
				>
					{avatarLetter}
				</div>
				<p className="text-sm text-gray-400">Preview updates as you type</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-5">
				<div>
					<label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
						Full Name
					</label>
					<input
						type="text"
						value={fullName}
						onChange={(e) => setFullName(e.target.value)}
						placeholder="John Doe"
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
					/>
				</div>

				<div>
					<label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
						Avatar Image URL
					</label>
					<input
						type="url"
						value={avatarUrl}
						onChange={(e) => setAvatarUrl(e.target.value)}
						placeholder="https://example.com/avatar.jpg"
						className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
					/>
					<p className="text-xs text-gray-400 mt-1">Paste any public image URL</p>
				</div>

				{error && (
					<p className="text-sm text-center text-red-600">{error}</p>
				)}

				<div className="flex gap-3 pt-1">
					<button
						type="button"
						onClick={() => router.push('/profile')}
						className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={saving}
						className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all disabled:opacity-50"
					>
						{saving ? 'Saving...' : 'Save Changes'}
					</button>
				</div>
			</form>
		</div>
	)
}
