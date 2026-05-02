"use client"
import { createClient } from '@myapp/supabase/client'
import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
const Logout = () => {
	const supabase = createClient()
	const router = useRouter()



	const handleLogout = async () => {
		await supabase.auth.signOut()
		router.refresh()
		router.push('/login')
	}

	return (
		<button
			onClick={handleLogout}
			className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition"
		>
			<LogOut />
			Logout
		</button>
	)
}
export default Logout