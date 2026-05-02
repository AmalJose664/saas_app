# Auth Helpers

Server-side authentication utilities for Next.js App Router.

## Usage

### Basic Usage (with null check)

```tsx
import { getAuthUser } from '@/lib/auth/server'
import { redirect } from 'next/navigation'

export default async function MyPage() {
  const { user, supabase } = await getAuthUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // user is authenticated, use it safely
  return <div>Hello {user.email}</div>
}
```

### Strict Usage (throws on no auth)

```tsx
import { requireAuth } from '@/lib/auth/server'

export default async function ProtectedPage() {
  const { user, supabase } = await requireAuth()
  
  // user is guaranteed to be non-null
  // if not authenticated, an error is thrown
  return <div>Hello {user.email}</div>
}
```

### With Additional Data Fetching

```tsx
import { getAuthUser } from '@/lib/auth/server'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const { user, supabase } = await getAuthUser()
  
  if (!user) redirect('/login')
  
  // Use the same supabase client for additional queries
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  return (
    <div>
      <h1>{profile?.full_name}</h1>
      <p>{user.email}</p>
    </div>
  )
}
```

## API

### `getAuthUser()`

Returns an object with:
- `user: User | null` - The authenticated user or null
- `supabase` - The Supabase client instance
- `error: Error | null` - Any error that occurred

### `requireAuth()`

Returns an object with:
- `user: User` - The authenticated user (guaranteed non-null)
- `supabase` - The Supabase client instance

Throws an error if no user is authenticated.

## Notes

- These helpers are for **Server Components and Server Actions only**
- They read the session from cookies (fast, no DB call)
- The middleware already protects routes, so these are mainly for data fetching
- For Client Components, use Supabase's `useUser()` hook instead
