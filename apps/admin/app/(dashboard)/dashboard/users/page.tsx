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

import UsersTable from './UsersTable'

/**
 * UsersPage — reads search and page from URL query params and passes
 * them to UsersTable for server-side filtering and pagination.
 *
 * @param searchParams - URL query params: ?search=...&page=...
 */
export default async function UsersPage({
	searchParams,
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
	const resolved = await searchParams
	const search = (resolved.search as string) || ''
	const page = parseInt((resolved.page as string) || '1', 10)

	return (
		<div>
			<UsersTable search={search} page={page} />
		</div>
	)
}