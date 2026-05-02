/**
 * @file Admin Login Page
 * @description Client-side login page for the admin dashboard.
 * Handles email/password authentication with Supabase, validates admin role
 * via the profiles table, and redirects to /dashboard on success.
 *
 * UI Architecture:
 * ┌─────────────┐
 * │  LoginPage  │  (React Client Component - 'use client')
 * │   (this)    │
 * └──────┬──────┘
 *        │ calls
 * ┌──────▼──────┐
 * │  Supabase   │  (Auth + DB via @workspace/supabase)
 * │   Client    │
 * └──────┬──────┘
 *        │ on success
 * ┌──────▼──────┐
 * │  /dashboard │  (Next.js App Router redirect)
 * └─────────────┘
 *
 * @author Admin Team
 */

'use client';

import { useState } from 'react';
import { createClient } from '@workspace/supabase';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

/**
 * ------------------------------------------------------------------
 * Types
 * ------------------------------------------------------------------
 */

/** Shape of the login form state */
interface LoginFormState {
	/** Admin email address */
	email: string;
	/** Admin password */
	password: string;
	/** Whether the form is submitting */
	loading: boolean;
	/** Error or status message to display */
	message: string;
	/** Whether the password field is visible as plain text */
	showPassword: boolean;
}

/**
 * ------------------------------------------------------------------
 * LoginPage Component
 * ------------------------------------------------------------------
 *
 * @returns JSX.Element — rendered login form
 */
export default function LoginPage() {
	// ─── Local State ───────────────────────────────────────────────
	const [email, setEmail] = useState<LoginFormState['email']>('');
	const [password, setPassword] = useState<LoginFormState['password']>('');
	const [loading, setLoading] = useState<LoginFormState['loading']>(false);
	const [message, setMessage] = useState<LoginFormState['message']>('');
	const [showPassword, setShowPassword] = useState<LoginFormState['showPassword']>(false);

	// ─── Hooks ─────────────────────────────────────────────────────
	const supabase = createClient();
	const router = useRouter();

	// ─── Handlers ──────────────────────────────────────────────────

	/**
	 * Toggle password visibility between plain text and masked.
	 */
	const togglePasswordVisibility = () => {
		setShowPassword((prev) => !prev);
	};

	/**
	 * Main login handler.
	 *
	 * Flow:
	 * 1. Authenticate with Supabase Auth (email + password)
	 * 2. Fetch user role from `profiles` table
	 * 3. If role === 'admin' → redirect to /dashboard
	 * 4. If role !== 'admin' → sign out, show unauthorized message
	 *
	 * @param e — React form submission event
	 */
	const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		setMessage('');

		// ── Step 1: Authenticate via Supabase Auth ─────────────────
		const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (authError || !authData.user) {
			setLoading(false);
			setMessage(authError?.message || 'Login failed. Please check your credentials.');
			return;
		}

		// ── Step 2: Verify admin role in profiles table ────────────
		const { data: profileData, error: profileError } = await supabase
			.from('profiles')
			.select('role')
			.eq('id', authData.user.id)
			.single();

		if (profileError) {
			setLoading(false);
			setMessage('Could not fetch user role. Please try again.');
			return;
		}

		// ── Step 3: Role check & redirect ──────────────────────────
		if (profileData?.role === 'admin') {
			setLoading(false);
			router.push('/dashboard');
		} else {
			// Non-admin user: sign out immediately and reject
			await supabase.auth.signOut();
			setMessage('Unauthorized: You do not have admin privileges.');
			setLoading(false);
		}
	};

	// ─── Render ──────────────────────────────────────────────────
	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-4">
			<div className="w-full max-w-md">
				{/* ── Header ───────────────────────────────────────── */}
				<div className="text-center mb-8">
					<div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/20">
						<span className="text-white text-xl font-bold">S</span>
					</div>
					<h1 className="text-2xl font-bold text-slate-900 mb-1">
						Admin Portal
					</h1>
					<p className="text-slate-500 text-sm">
						Sign in to manage your subscription platform
					</p>
				</div>

				{/* ── Login Form ─────────────────────────────────────── */}
				<div className="p-8 bg-white shadow-xl rounded-2xl border border-slate-100">
					<form onSubmit={handleLogin} className="space-y-5">
						{/* Email Field */}
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-slate-700 mb-1.5"
							>
								Email Address
							</label>
							<input
								id="email"
								type="email"
								placeholder="admin@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-400"
								required
								autoComplete="email"
							/>
						</div>

						{/* Password Field with Eye Toggle */}
						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-slate-700 mb-1.5"
							>
								Password
							</label>
							<div className="relative">
								<input
									id="password"
									type={showPassword ? 'text' : 'password'}
									placeholder="••••••••"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="w-full px-4 py-2.5 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-slate-900 placeholder:text-slate-400"
									required
									autoComplete="current-password"
								/>
								{/* Eye toggle button */}
								<button
									type="button"
									onClick={togglePasswordVisibility}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500/30"
									tabIndex={-1}
									aria-label={showPassword ? 'Hide password' : 'Show password'}
								>
									{showPassword ? (
										<Eye />
									) : (
										<EyeOff />
									)}
								</button>
							</div>
						</div>

						{/* Error / Status Message */}
						{message && (
							<div
								className={`p-3 rounded-lg text-sm ${message.includes('Success') || message.includes('signed')
									? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
									: 'bg-red-50 text-red-700 border border-red-200'
									}`}
								role="alert"
							>
								{message}
							</div>
						)}

						{/* Submit Button */}
						<button
							type="submit"
							disabled={loading}
							className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{loading ? (
								<span className="flex items-center justify-center gap-2">
									<svg
										className="animate-spin h-4 w-4 text-white"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										/>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										/>
									</svg>
									Signing in...
								</span>
							) : (
								'Sign In'
							)}
						</button>
					</form>
				</div>

				{/* ── Footer ─────────────────────────────────────────── */}
				<p className="text-center text-slate-400 text-xs mt-6">
					Secure admin access. Unauthorized entry is prohibited.
				</p>
			</div>
		</div>
	);
}