import { createClient } from '@supabase/supabase-js'

/**
 * Supabase Admin Client — server-side only, never use in client components.
 *
 * Uses the secret key (service role) which bypasses Row Level Security.
 * Intended for:
 *   - Webhook handlers (no user session available)
 *   - Background jobs / cron tasks
 *   - Any server operation that needs to act outside a user's session
 *
 * Requires:
 *   NEXT_PUBLIC_SUPABASE_URL  — your project URL
 *   SUPABASE_SECRET_KEY       — service role key from Supabase dashboard
 *                               (Settings → API → service_role)
 *
 *   Never expose this client or its key to the browser.
 */

export const supabaseAdmin = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SECRET_KEY!,
	{
		auth: {
			// Disable auto session management — this client acts as the service role,
			autoRefreshToken: false,
			persistSession: false,
		},
	}
)
