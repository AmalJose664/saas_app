# @repo/database

Auto-generated TypeScript types from the Supabase database schema.

## Usage

```ts
import type { Tables, TablesInsert, TablesUpdate, Enums } from '@repo/database'

// Row type — what a SELECT returns
type Plan = Tables<'plan'>

// Insert payload
type NewPlan = TablesInsert<'plan'>

// Partial update payload
type PlanUpdate = TablesUpdate<'plan'>

// Enum values
type OrderStatus = Enums<'order_status'> // 'pending' | 'active' | 'cancelled'
```

## Regenerating types

Run this after any schema change in Supabase:

```bash
npx supabase gen types typescript --project-id <your-project-id> \
  > packages/database/src/supabase.ts
```
