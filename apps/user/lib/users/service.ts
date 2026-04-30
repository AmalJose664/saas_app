import {
	dbGetUsersPaginated,
	dbGetUserById,
	dbGetUsersCount,
	dbUpdateUser,
	dbUpdateUserAdmin,
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

/** Return type of getUserById */
export type GetUserByIdResult =
	| { success: true; data: UserProfile }
	| { success: false; error: string }

/** Return type of updateUser */
export type UpdateUserResult =
	| { success: true; data: UserProfile }
	| { success: false; error: string }

// ─── Service functions ────────────────────────────────────────────────────────

export const USERS_PAGE_SIZE = 10

export async function getUsersPaginated(opts: { search: string; page: number }) {
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
	if (error) return { success: false, error: error.message }
	if (!data) return { success: false, error: 'User not found' }
	return { success: true, data }
}

export async function getUsersCount() {
	const { count, error } = await dbGetUsersCount()
	if (error) return { success: false as const, error: error.message }
	return { success: true as const, count: count ?? 0 }
}

export async function updateUser(id: string, data: TablesUpdate<'profiles'>): Promise<UpdateUserResult> {
	const { data: updated, error } = await dbUpdateUser(id, {
		...data,
		updated_at: new Date().toISOString(),
	})
	if (error) return { success: false, error: error.message }
	if (!updated) return { success: false, error: 'Update returned no data' }
	return { success: true, data: updated }
}

// ─── Admin / service-role (Webhook handlers) ──────────────────────────────────

/**
 * updateUserRoleAdmin — updates a user's role using the service role key.
 * Called from webhook handlers to promote/demote users based on subscription
 *
 * role: 'pro'  → subscription is active
 * role: 'user' → subscription cancelled, failed, completed, or expired
 */
export async function updateUserRoleAdmin(id: string, role: 'pro' | 'user'): Promise<UpdateUserResult> {
	const { data: updated, error } = await dbUpdateUserAdmin(id, {
		role,
		updated_at: new Date().toISOString(),
	})
	if (error) return { success: false, error: error.message }
	if (!updated) return { success: false, error: 'Update returned no data' }
	return { success: true, data: updated }
}
