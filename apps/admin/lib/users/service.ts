import {
	dbGetUsersPaginated,
	dbGetUserById,
	dbGetUsersCount,
	dbUpdateUser,
} from './repository'
import type { TablesUpdate, Tables } from '@repo/database'

/**
 * Users Service
 *
 * Business logic for user/profile management. Responsibilities:
 * - Pagination calculation (page → from/to range)
 * - Appending updated_at on every update
 * - Wrapping results in { success, data } | { success, error }
 *
 * USERS_PAGE_SIZE controls how many rows are returned per page.
 */

// ─── Domain types ─────────────────────────────────────────────────────────────

/** A single user profile row as returned from the DB */
export type UserProfile = Tables<'profiles'>

/** Return type of getUsersPaginated */
export type PaginatedUsersResult =
	| {
		success: true
		data: UserProfile[]
		count: number
		totalPages: number
		currentPage: number
	}
	| { success: false; error: string }

/** Return type of getUserById */
export type GetUserByIdResult =
	| { success: true; data: UserProfile }
	| { success: false; error: string }

export const USERS_PAGE_SIZE = 10

export async function getUsersPaginated(opts: { search: string; page: number }): Promise<PaginatedUsersResult> {
	const currentPage = Math.max(1, opts.page)
	const from = (currentPage - 1) * USERS_PAGE_SIZE
	const to = from + USERS_PAGE_SIZE - 1

	const { data, error, count } = await dbGetUsersPaginated({
		search: opts.search,
		from,
		to,
	})

	if (error) return { success: false as const, error: error.message }

	return {
		success: true as const,
		data: data ?? [],
		count: count ?? 0,
		totalPages: Math.ceil((count ?? 0) / USERS_PAGE_SIZE),
		currentPage,
	}
}

export async function getUserById(id: string): Promise<GetUserByIdResult> {
	const { data, error } = await dbGetUserById(id)
	if (error) return { success: false as const, error: error.message }
	return { success: true as const, data }
}

export async function getUsersCount() {
	const { count, error } = await dbGetUsersCount()
	if (error) return { success: false as const, error: error.message }
	return { success: true as const, count: count ?? 0 }
}

export async function updateUser(id: string, data: TablesUpdate<'profiles'>) {
	const { data: updated, error } = await dbUpdateUser(id, {
		...data,
		updated_at: new Date().toISOString(),
	})
	if (error) return { success: false as const, error: error.message }
	return { success: true as const, data: updated }
}
