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

## Latest Updates (April 2026)

### Critical Fixes
- **Login page:** Password visibility toggle (eye icon), loading spinner, error banners, removed all `console.log`
- **ToggleUserActive.tsx:** Fixed dead `return null` bug — button now renders correctly
- **next.config.js:** Fixed typo `@repo/validation` → `@repo/validations`, converted to ES module syntax for Next.js 16
- **not-authorized page:** Professional styled page with lock icon and navigation links
- **plans/[id]:** Refactored from raw Supabase queries to service layer (`getPlanById`)
- **NavCard.tsx:** Replaced `any` with proper `NavCardProps` TypeScript interface
- **Root page (`/`):** Converted to server component — redirects authenticated users to `/dashboard`
- **Build fixes:** Fixed Zod validation syntax for newer version, fixed `JSX.Element` namespace error

### TanStack Query Integration
- **Installed `@tanstack/react-query` + `@tanstack/react-query-devtools`**
- **Created `lib/query-client.ts`** — singleton QueryClient with 30s stale time, 5min GC, 3x retry, refetch on focus
- **Created domain-specific hooks** in `lib/{users,plans,orders,subscriptions}/hooks.ts`:
  - `useUsers` — paginated with placeholder data (smooth pagination)
  - `useUser` — individual profile with background refresh
  - `useToggleUserActive` — mutation with automatic cache invalidation
  - `usePlans` / `usePlan` — cached plan list + detail
  - `useCreatePlan` / `useUpdatePlan` / `useDeletePlan` — mutations with list invalidation
  - `useOrders` / `useSubscriptions` — domain-specific queries
- **Updated components** to use hooks: `ToggleUserActive.tsx`, `DeletePlan.tsx`
- **Wrapped app** in `QueryProvider` (layout.tsx) for React Query context
- **Query key factories** per domain for consistent cache management

### Documentation
- Added comprehensive JSDoc to all pages, components, middleware, and service files
- Each file includes ASCII architecture flow diagrams showing the call chain
- Inline section comments (`// ─── Section ───`) for visual grouping

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

## TanStack Query (React Query) — Client State Layer

On top of the Server Component / Server Action architecture, **TanStack Query** adds a client-side caching and synchronization layer for interactive UI components.

### Why TanStack Query?

| Feature | Without React Query | With React Query |
|---------|--------------------|------------------|
| **Live dashboard** | Manual `setInterval` + fetch | `refetchInterval` with stale-while-revalidate |
| **Mutation → UI refresh** | `router.refresh()` or full reload | Automatic cache invalidation + background refetch |
| **Multiple tabs** | Stale data across tabs | `refetchOnWindowFocus` keeps all tabs in sync |
| **Offline resilience** | Failed mutations lost | Automatic retry with exponential backoff |
| **Pagination/search** | Lift state to URL, full reload | Client-side cache, instant UI |

### Where We Use It

```
Client Component (e.g. ToggleUserActive, DeletePlan)
        ↓
  TanStack Query Hook (lib/*/hooks.ts::useMutation / useQuery)
        ↓
  Server Action (lib/*/actions.ts)   ← still validates, still 'use server'
        ↓
  Service → Repository → Supabase
```

**Rule:** Server Components (`page.tsx`, `*Table.tsx`) still fetch directly via service layer on the server. TanStack Query is used **only** in interactive Client Components for mutations and real-time data.

### Query Key Conventions

Every domain has a centralized key factory in its `hooks.ts`:

| Domain | Key Pattern | Example |
|--------|-------------|---------|
| Dashboard | `['dashboard', 'stats']` | `queryKey: ['dashboard', 'stats']` |
| Users | `['users', 'list', search, page]` | `queryKey: usersKeys.list('admin', 1)` |
| Plans | `['plans', 'list']` | `queryKey: plansKeys.list()` |
| Orders | `['orders', 'byUser', userId]` | `queryKey: ordersKeys.byUser(id)` |
| Subscriptions | `['subscriptions', 'list']` | `queryKey: subscriptionsKeys.list()` |

**Invalidation pattern:** After a mutation (e.g. `toggleUserActive`), the hook calls `queryClient.invalidateQueries({ queryKey: usersKeys.all })` to refresh all dependent UI automatically.

### Configuration

`lib/query-client.ts` configures a singleton `QueryClient`:

- **Stale time:** 30s — reduces redundant fetches while keeping data fresh
- **GC time:** 5min — garbage collects unused cache
- **Retry:** 3x exponential backoff — handles transient network issues
- **Refetch on focus:** Enabled — dashboard metrics update when admin returns

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
