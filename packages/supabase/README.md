# @workspace/supabase

Supabase client factory for both server and browser environments.

## Exports

| Import path                  | Use in                                            |
| ---------------------------- | ------------------------------------------------- |
| `@workspace/supabase/server` | Server Components, Server Actions, Route Handlers |
| `@workspace/supabase/client` | `'use client'` components                         |

## Usage

**Server (default for most cases):**

```ts
import { createClient } from "@workspace/supabase/server"

const supabase = await createClient()
const { data } = await supabase.from("profiles").select("*")
```

**Browser (only when needed client-side):**

```ts
import { createClient } from "@workspace/supabase/client"

const supabase = createClient()
```

## Why two clients?

The server client reads and writes auth cookies via `next/headers` so the
user session is always in sync. The browser client uses `localStorage`-based
session storage for client-side use.

Importing `server.ts` in a `'use client'` component will throw at runtime
because `next/headers` is not available in the browser.
