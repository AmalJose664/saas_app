# Admin App

Internal dashboard for managing the subscription platform. Only users with the `admin` role (set via a Supabase custom JWT claim) can access it.

- **URL:** `http://localhost:3000`
- **Auth:** Email/password via Supabase
- **Role required:** `admin` — enforced in `middleware.ts` by decoding the JWT

---

## Getting Started

```bash
# From the repo root
npm run dev

# Or just this app
cd apps/admin
npm run dev
```

Copy `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

---

## Routes

| Route | Description |
|-------|-------------|
| `/login` | Admin login page |
| `/not-authorized` | Shown when a non-admin user tries to access the dashboard |
| `/dashboard` | Overview — stat cards + recent orders |
| `/dashboard?tab=users` | Paginated user list with email search |
| `/dashboard?tab=subscriptions` | All subscriptions with plan and status |
| `/dashboard/users/[id]` | Individual user profile — subscription, orders, toggle active |
| `/dashboard/plans` | All subscription plans |
| `/dashboard/plans/add` | Create a new plan |
| `/dashboard/plans/edit/[id]` | Edit an existing plan |
| `/dashboard/plans/[id]` | View plan details |

---

## Architecture

Database access follows a three-layer pattern under `lib/`:

```
Server Component / Client Form
        ↓
  actions.ts    'use server' — validates FormData, calls service
        ↓
  service.ts    Business logic — paise conversion, result wrapping
        ↓
  repository.ts Raw Supabase queries — no logic
```

Each domain (plans, users, orders, subscriptions, dashboard) has its own folder under `lib/`. Components never import from `@myapp/supabase` directly — they go through the service layer.

---

## Auth & Middleware

`middleware.ts` runs on every request to `/dashboard/*`:

1. Checks for a valid Supabase session
2. Decodes the JWT and reads the `user_role` claim
3. Redirects to `/not-authorized` if the role is not `admin`
4. Redirects to `/login` if there is no session

The `user_role` claim is set by a Supabase database hook (`custom_access_token_hook`).

---

## Key Dependencies

| Package | Purpose |
|---------|---------|
| `next` | Framework |
| `@myapp/supabase` | Supabase server/browser clients |
| `@repo/database` | Generated DB types |
| `@repo/validations` | Zod schemas for plans |
| `@repo/ui` | Shared components (ConfirmModal, etc.) |
| `jwt-decode` | Reading role from JWT in middleware |
| `sonner` | Toast notifications |
