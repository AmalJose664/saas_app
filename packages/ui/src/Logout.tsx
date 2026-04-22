"use client"
import { createClient } from '@myapp/supabase/client'
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
			className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
			Logout
		</button>
	)
}
export default Logout