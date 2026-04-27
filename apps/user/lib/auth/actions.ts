'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@myapp/supabase/server'
import { loginSchema, signupSchema } from '@repo/validations'

/**
 * Auth Server Actions
 *
 * Handles login and signup mutations from client form components.
 * Each action: validates FormData with Zod → calls Supabase Auth → redirects on success.
 *
 * AuthResult is returned to the client to show field-level or global errors.
 */

export type AuthResult =
	| { success: true }
	| { success: false; error: string; fieldErrors?: Record<string, string> }

// ─── Login ────────────────────────────────────────────────────────────────────

export async function loginAction(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
	const raw = {
		email: formData.get('email') as string,
		password: formData.get('password') as string,
	}

	const parsed = loginSchema.safeParse(raw)
	if (!parsed.success) {
		const fieldErrors: Record<string, string> = {}
		parsed.error.issues.forEach((e) => {
			fieldErrors[e.path[0] as string] = e.message
		})
		return { success: false, error: 'Validation failed', fieldErrors }
	}

	const supabase = await createClient()
	const { error } = await supabase.auth.signInWithPassword({
		email: parsed.data.email,
		password: parsed.data.password,
	})

	if (error) return { success: false, error: error.message }

	redirect('/dashboard')
}

// ─── Signup ───────────────────────────────────────────────────────────────────

export async function signupAction(_prev: AuthResult, formData: FormData): Promise<AuthResult> {
	const raw = {
		email: formData.get('email') as string,
		full_name: formData.get('full_name') as string,
		password: formData.get('password') as string,
	}

	const parsed = signupSchema.safeParse(raw)
	if (!parsed.success) {
		const fieldErrors: Record<string, string> = {}
		parsed.error.issues.forEach((e) => {
			fieldErrors[e.path[0] as string] = e.message
		})
		return { success: false, error: 'Validation failed', fieldErrors }
	}

	const supabase = await createClient()
	const { error } = await supabase.auth.signUp({
		email: parsed.data.email,
		password: parsed.data.password,
		options: {
			data: {
				full_name: parsed.data.full_name,
			},
		},
	})

	if (error) return { success: false, error: error.message }

	redirect('/dashboard')
}
