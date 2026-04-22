/**
 * @file not-authorized/page.tsx
 * @description Access-denied page shown when a non-admin user attempts
 * to visit a protected /dashboard/* route.
 *
 * The middleware.ts intercepts the request, decodes the JWT, and if the
 * `user_role` claim is not `'admin'`, the user is redirected here.
 */

import Link from 'next/link';

/**
 * NotAuthorized — styled access-denied page.
 *
 * @returns JSX.Element
 */
export default function NotAuthorized() {
	return (
		<div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
			<div className="bg-white p-10 rounded-2xl shadow-lg border border-slate-200 max-w-md w-full text-center">
				{/* Shield / Lock icon */}
				<div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="32"
						height="32"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						className="text-red-500"
					>
						<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
						<path d="M7 11V7a5 5 0 0 1 10 0v4" />
					</svg>
				</div>

				<h1 className="text-2xl font-bold text-slate-900 mb-2">
					Access Denied
				</h1>
				<p className="text-slate-500 mb-8">
					You do not have admin privileges to access this area.
					If you believe this is an error, contact your system administrator.
				</p>

				<div className="flex flex-col gap-3">
					<Link
						href="/login"
						className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
					>
						Return to Login
					</Link>
					<Link
						href="/"
						className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition"
					>
						Go to Home
					</Link>
				</div>
			</div>
		</div>
	);
}