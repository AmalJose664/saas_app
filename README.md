# Simple Subscription Platform

A SaaS subscription platform built with Next.js, Supabase, Razorpay, and Resend.

## Apps

| App | Port | Description |
|-----|------|-------------|
| `apps/admin` | 3000 | Admin dashboard — manage plans, users, orders, subscriptions |
| `apps/user` | 3001 | Customer-facing app — auth, plan selection, profile |

## Packages

| Package | Description |
|---------|-------------|
| `packages/supabase` | Supabase server + browser clients |
| `packages/database` | Generated TypeScript types from Supabase schema |
| `packages/validations` | Zod schemas shared across apps |
| `packages/ui` | Shared React components |
| `packages/tailwind-config` | Shared Tailwind CSS config |
| `packages/typescript-config` | Shared tsconfig presets |

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

# 3. Start all apps
npm run dev
```

Each app also has its own `.env.local` — see `.env.example` for required keys.

## Architecture (Admin App)

The admin app uses a layered architecture under `apps/admin/lib/`:

```
Server Component / Client Component
        ↓
  Server Action (lib/*/actions.ts)   ← validates input, runs on server
        ↓
  Service       (lib/*/service.ts)   ← business logic, paise conversion
        ↓
  Repository    (lib/*/repository.ts) ← raw Supabase queries only
```

- **Repository** — only place Supabase is called. No logic.
- **Service** — owns business rules (e.g. ₹ → paise). Returns `{ success, data } | { success, error }`.
- **Actions** — `'use server'` functions called from client forms via `useActionState`.

See `apps/admin/lib/` for the full implementation.
