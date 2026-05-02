/**
 * @file not-authorized/page.tsx
 * @description Access-denied page shown when a non-admin user attempts
 * to visit a protected /dashboard/* route.
 *
 * The middleware.ts intercepts the request, decodes the JWT, and if the
 * `user_role` claim is not `'admin'`, the user is redirected here.
 */

import Logout from '@workspace/ui/Logout';
import { Lock } from 'lucide-react';

/**
 * NotAuthorized — styled access-denied page.
 *
 * @returns JSX.Element
 */
export default function NotAuthorized() {
	return (
		<div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
			<div className="bg-white p-10 rounded-2xl shadow-lg border border-slate-200 max-w-md w-full text-center">
				<div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
					<Lock className='text-red-500' />
				</div>

				<h1 className="text-2xl font-bold text-slate-900 mb-2">
					Access Denied
				</h1>
				<p className="text-slate-500 mb-8">
					You do not have admin privileges to access this area.
					If you believe this is an error, contact your system administrator.
				</p>

				<div className="flex flex-col gap-3">
					<Logout />
				</div>
			</div>
		</div>
	);
}