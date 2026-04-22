/**
 * @file app/(dashboard)/dashboard/users/page.tsx
 * @description Users list page — server component wrapper that renders
 * the UsersTable with default pagination (page 1, no search).
 *
 * Architecture:
 * Server Component (this)
 *   ↓ renders
 * UsersTable (async Server Component)
 *   ↓ calls
 * Users Service (lib/users/service.ts::getUsersPaginated)
 *   ↓ calls
 * Users Repository (lib/users/repository.ts::dbGetUsersPaginated)
 *   ↓ calls
 * Supabase Server Client
 */

import UsersTable from './UsersTable';

/**
 * UsersPage — server component wrapper for the user directory.
 *
 * @returns JSX.Element
 */
export default function UsersPage() {
	return (
		<div>
			<h2>
				Users
			</h2>
			<UsersTable />
		</div>
	);
}