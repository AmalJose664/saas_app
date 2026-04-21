'use client'

import { createClient } from '@myapp/supabase'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
	const supabase = createClient()
	const router = useRouter()
	const [user, setUser] = useState<any>(null)

	useEffect(() => {
		const getUser = async () => {
			const { data: { user } } = await supabase.auth.getUser()
			if (!user) router.push('/login')
			setUser(user)
		}
		getUser()
	}, [])

	const handleLogout = async () => {
		await supabase.auth.signOut()
		router.push('/login')
	}

	return (
		<div>
			<h1>Welcome, {user?.email}</h1>
			<button onClick={handleLogout}>Logout</button>
		</div>
	)
}