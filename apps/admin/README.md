# Admin App

Internal dashboard for managing the subscription platform. Only users with the `admin` role (set via a Supabase custom JWT claim) can access it.

- **URL:** `http://localhost:3001` (configured in `package.json`)
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
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

---

## Routes

| Route | Description | Type |
|-------|-------------|------|
| `/` | Landing page with nav cards (redirects to `/dashboard` if logged in) | Server |
| `/login` | Admin login with password visibility toggle | Client |
| `/not-authorized` | Access denied page with helpful messaging | Server |
| `/dashboard` | Overview — stat cards + recent orders | Server |
| `/dashboard/users` | Paginated user list with email search | Server + Client |
| `/dashboard/orders` | All orders with customer info | Server |
| `/dashboard/subscriptions` | All subscriptions with plan details | Server |
| `/dashboard/users/[id]` | Individual user profile — subscription, orders, toggle active | Server |
| `/dashboard/plans` | All subscription plans (grid layout) | Server |
| `/dashboard/plans/add` | Create a new plan (form) | Client |
| `/dashboard/plans/edit/[id]` | Edit an existing plan | Server + Client |
| `/dashboard/plans/[id]` | View single plan details | Server |

---

## Architecture

### Three-Layer Pattern (Every Domain)

The app follows a strict **UI → Service → Repository → Supabase** architecture.

```
Server Component / Client Form
        ↓
  ┌──────────────────────────────┐
  │  actions.ts   'use server'   │  ← validates FormData with Zod
  │         ↓                      │     calls service
  │  service.ts   Business logic │  ← paise conversion, result wrapping
  │         ↓                      │     { success: true, data } | { success: false, error }
  │  repository.ts Raw Supabase    │  ← no logic, just queries
  │         ↓                      │
  │  Supabase Server Client        │
  └──────────────────────────────┘
```

### Domain Folders

Each feature area has its own folder under `lib/`:

```
lib/
├── dashboard/
│   └── service.ts          (aggregates stats from users, orders, revenue)
├── plans/
│   ├── actions.ts          (create, update, delete — with Zod validation)
│   ├── service.ts          (₹ → paise conversion, result wrapping)
│   └── repository.ts       (raw Supabase queries for 'plan' table)
├── users/
│   ├── actions.ts          (toggleUserActiveAction)
│   ├── service.ts          (pagination, updated_at on write)
│   └── repository.ts       (paginated search with ILIKE)
├── orders/
│   ├── service.ts          (revenue aggregation, ₹ formatting)
│   └── repository.ts       (joins profiles for customer info)
└── subscriptions/
    ├── service.ts          (read-only, joins plan + profile)
    └── repository.ts       (raw Supabase queries)
```

### Client vs Server Components

| Layer | Where | Role |
|-------|-------|------|
| `middleware.ts` | Edge | Auth + role check before any page loads |
| Server Component | `page.tsx` | Fetch data, pass to children |
| Client Component | `*Table.tsx` | Interactive UI (search, pagination, forms) |
| Server Action | `actions.ts` | `'use server'` — mutations, validation |
| Service | `service.ts` | Business logic, error wrapping |
| Repository | `repository.ts` | Raw Supabase, no logic |

---

## Auth & Middleware

`middleware.ts` runs on every request matched by its `config.matcher`:

```
Request → middleware.ts
  ├─ Session exists?
  │   ├─ Yes → decode JWT → user_role === 'admin'?
  │   │        ├─ Yes → allow → inject x-pathname header for active nav
  │   │        └─ No  → redirect /not-authorized
  │   └─ No  → redirect /login
  └─ /login + session exists?
      └─ Yes → redirect /dashboard
```

**Note:** Next.js 16 shows a deprecation warning for `middleware.ts`. Future versions will use `proxy.ts` instead. This file works for now.

---

## Key Dependencies

| Package | Purpose |
|---------|---------|
| `next` | Framework (v16.2.0 with Turbopack) |
| `@myapp/supabase` | Supabase server/browser clients |
| `@repo/database` | Generated Supabase DB types (TablesInsert, TablesUpdate) |
| `@repo/validations` | Zod schemas for forms (plans, profiles) |
| `@repo/ui` | Shared components (ConfirmModal, Logout) |
| `jwt-decode` | Reading `user_role` from JWT in middleware |
| `sonner` | Toast notifications |

---

## File Documentation Convention

Every file includes a **JSDoc header** with:

- `@file` path relative to `apps/admin/`
- `@description` of what the file does
- ASCII **architecture flow diagram** showing the call chain
- `@param` docs for every exported function
- Inline comments (`// ─── Section ───`) for visual grouping

Example from a Server Component:

```typescript
/**
 * @file app/(dashboard)/dashboard/plans/page.tsx
 * @description Plans management page...
 *
 * Architecture:
 * ManagePlans (Server Component)
 *   ↓ calls
 * Plans Service → Plans Repository → Supabase
 */
```

This convention ensures any developer can understand the data flow at a glance.
