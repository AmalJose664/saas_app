/**
 * @file app/(auth)/login/page.tsx
 * @description Login page — supports email/password and Google OAuth.
 *
 * Auth flows:
 * - Email/password: loginAction (server action) → validates → signInWithPassword → redirect /dashboard
 * - Google OAuth: signInWithOAuth (browser client) → /auth/callback → /dashboard
 *
 * Middleware redirects authenticated users away from this page to /dashboard.
 */
'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@workspace/supabase'
import { loginAction } from '../../../lib/auth/actions'
import type { AuthResult } from '../../../lib/auth/actions'
import { Eye, EyeOff } from "lucide-react"

const initialState: AuthResult = { success: true }

export default function LoginPage() {
	const [state, formAction, isPending] = useActionState(loginAction, initialState)
	const [showPassword, setShowPassword] = useState(false)

	const fieldErrors = !state.success ? (state.fieldErrors ?? {}) : {}
	const globalError = !state.success && !state.fieldErrors ? state.error : null
	const handleGoogleLogin = async () => {
		const supabase = createClient()
		await supabase.auth.signInWithOAuth({
			provider: 'google',
			options: {
				redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
			},
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

				{globalError && (
					<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 text-center">
						{globalError}
					</div>
				)}

				<form action={formAction} className="space-y-4">
					<div>
						<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
							Email Address
						</label>
						<input
							id="email"
							name="email"
							type="email"
							placeholder="you@example.com"
							autoComplete="email"
							className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
						/>
						{fieldErrors.email && (
							<p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
						)}
					</div>

					<div>
						<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
							Password
						</label>
						<div className="relative">
							<input
								id="password"
								name="password"
								type={showPassword ? 'text' : 'password'}
								placeholder="••••••••"
								autoComplete="new-password"
								className="w-full px-4 py-2 pr-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900"
							/>
							<button
								type="button"
								onClick={() => setShowPassword((v) => !v)}
								className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
								tabIndex={-1}
								aria-label={showPassword ? 'Hide password' : 'Show password'}
							>
								{showPassword ? <EyeOff /> : <Eye />}
							</button>
						</div>
						{fieldErrors.password && (
							<p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
						)}
					</div>

					<button
						type="submit"
						disabled={isPending}
						className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50"
					>
						{isPending ? 'Signing in...' : 'Sign In'}
					</button>
				</form>

				<div className="relative my-6">
					<div className="absolute inset-0 flex items-center">
						<div className="w-full border-t border-gray-200" />
					</div>
					<div className="relative flex justify-center text-sm">
						<span className="px-2 bg-white text-gray-500">Or continue with</span>
					</div>
				</div>

				<button
					type="button"
					onClick={handleGoogleLogin}
					className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all shadow-sm"
				>
					<GoogleIcon />
					Google
				</button>

				<p className="text-center text-sm text-gray-500 mt-6">
					Don&apos;t have an account?{' '}
					<Link href="/signup" className="text-blue-600 hover:underline font-medium">
						Sign up
					</Link>
				</p>
			</div>
		</div>
	)
}

function GoogleIcon() {
	return (
		<svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
			<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
			<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
			<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
			<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
		</svg>
	)
}
