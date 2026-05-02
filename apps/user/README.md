# User App

Customer-facing application where users sign in, browse subscription plans, manage their profile, and handle payments via Razorpay.

- **URL:** `http://localhost:3001`
- **Auth:** Google OAuth via Supabase
- **Role required:** none — any authenticated user can access protected routes

---

## Getting Started

```bash
# From the repo root
npm run dev

# Or just this app
cd apps/user
npm run dev
```

Copy `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

---

## Routes

| Route            | Description                                          |
| ---------------- | ---------------------------------------------------- |
| `/`              | Landing page                                         |
| `/login`         | Google OAuth sign-in                                 |
| `/auth/callback` | OAuth redirect handler — exchanges code for session  |
| `/dashboard`     | Plan selection — lists all active plans with pricing |
| `/profile`       | View profile — name, avatar, email, member since     |
| `/profile/edit`  | Edit profile — update full name and avatar URL       |

---

## Auth Flow

1. User clicks "Sign in with Google" on `/login`
2. Supabase redirects to Google, then back to `/auth/callback`
3. `route.ts` exchanges the auth code for a session and sets cookies
4. User is redirected to `/dashboard`

The `middleware.ts` protects `/dashboard`, `/profile`, `/orders`, `/payments`, and `/plans`. Unauthenticated requests are redirected to `/login`. Authenticated users visiting `/login` are redirected to `/dashboard`.

---

## Profile Editing

The profile edit flow uses a server/client split:

- `profile/edit/page.tsx` — server component, fetches current profile data
- `profile/edit/EditProfileForm.tsx` — client component, handles form state and live avatar preview
- `profile/edit/actions.ts` — server action, validates with `updateProfileSchema` from `@workspace/validations`, then upserts to Supabase

---

## Key Dependencies

| Package                  | Purpose                         |
| ------------------------ | ------------------------------- |
| `next`                   | Framework                       |
| `@workspace/supabase`    | Supabase server/browser clients |
| `@workspace/validations` | Zod schema for profile updates  |
| `@workspace/ui`          | Shared UI components            |
| `tailwindcss`            | Styling                         |
