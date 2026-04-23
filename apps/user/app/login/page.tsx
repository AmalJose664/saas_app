/**
 * @file app/login/page.tsx
 * @description Login page — supports email/password and Google OAuth.
 *
 * This is a Client Component because it manages form state and calls
 * the Supabase browser client directly for auth flows.
 *
 * Auth flows:
 * - Email/password: signInWithPassword → redirect to /dashboard on success
 * - Google OAuth: signInWithOAuth → redirects to /auth/callback to exchange code
 *
 * Middleware redirects authenticated users away from this page to /dashboard.
 */
'use client'

import { useState } from 'react'
import { createClient } from '@myapp/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
	const supabase = createClient()
	const router = useRouter()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [message, setMessage] = useState('')

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setMessage('')

		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		})

		if (error) {
			setMessage(error.message)
		} else {
			setMessage("Success! Redirecting...")
			router.push("/dashboard")
		}
		setLoading(false)
	}

	const handleGoogleLogin = async () => {
		await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
			}
		})
	}

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
			<div className="p-8 bg-white shadow-xl rounded-2xl w-full max-w-md border border-gray-100">
				<h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
					Welcome Back
				</h1>
				<p className="text-gray-500 text-center mb-8 text-sm">
					Enter your credentials to access your account
				</p>

				<form onSubmit={handleLogin} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Email Address
						</label>
						<input
							type="email"
							placeholder="you@example.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Password
						</label>
						<input
							type="password"
							placeholder="••••••••"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
							required
						/>
					</div>

					{message && (
						<p className={`text-sm text-center ${message.includes("Success") ? "text-green-600" : "text-red-600"}`}>
							{message}
						</p>
					)}

					<button
						type="submit"
						disabled={loading}
						className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50"
					>
						{loading ? "Signing in..." : "Sign In"}
					</button>
				</form>

				<div className="relative my-8">
					<div className="absolute inset-0 flex items-center">
						<div className="w-full border-t border-gray-200"></div>
					</div>
					<div className="relative flex justify-center text-sm">
						<span className="px-2 bg-white text-gray-500">Or continue with</span>
					</div>
				</div>

				<button
					onClick={handleGoogleLogin}
					className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all shadow-sm"
				>
					<svg className="w-5 h-5" viewBox="0 0 24 24">
						<path
							d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
							fill="#4285F4"
						/>
						<path
							d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
							fill="#34A853"
						/>
						<path
							d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
							fill="#FBBC05"
						/>
						<path
							d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
							fill="#EA4335"
						/>
					</svg>
					Google
				</button>
			</div>
		</div>
	)
}