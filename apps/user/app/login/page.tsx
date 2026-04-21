'use client'

import { createClient } from '@myapp/supabase'

export default function LoginPage() {
	const supabase = createClient()

	const handleGoogleLogin = async () => {
		await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
			}
		})
	}

	return (
		<div>
			<h1>Welcome to MyApp</h1>
			<button onClick={handleGoogleLogin}>
				Sign in with Google
			</button>
		</div>
	)
}