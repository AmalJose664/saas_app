# @repo/validations

Shared Zod validation schemas used across `apps/admin` and `apps/user`.

## Schemas

### Plans (`src/plan.ts`)

```ts
import { createPlanSchema, updatePlanSchema } from '@repo/validations'
import type { CreatePlanInput, UpdatePlanInput } from '@repo/validations'
```

| Schema | Used for |
|--------|----------|
| `createPlanSchema` | Creating a new plan |
| `updatePlanSchema` | Updating an existing plan (all fields partial, `id` required) |

**Amount note:** schemas work in ₹ (e.g. `499`). The service layer converts
to paise (`×100`) before writing to the database.

### Profile (`src/profile.ts`)

```ts
import { updateProfileSchema } from '@repo/validations'
import type { UpdateProfileInput } from '@repo/validations'
```

Validates `full_name` and `avatar_url`. An empty string for `avatar_url` is
valid and means the user wants to clear their avatar.

## Adding a new schema

1. Create `src/<name>.ts` with your Zod schema and export the types
2. Re-export from `index.ts`
3. Add `@repo/validations` to the app's `package.json` dependencies if not already there
