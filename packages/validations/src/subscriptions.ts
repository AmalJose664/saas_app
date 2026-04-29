import { z } from 'zod';

const STATUS = ['cancelled', 'active', 'pending', 'failed', 'completed'] as const;

export const SubscriptionStatusSchema = z.enum(STATUS);

export const SubscriptionSchema = z.object({
	id: z.string().uuid(),
	user_id: z.string().uuid(),
	plan_id: z.string().uuid(),
	status: SubscriptionStatusSchema.default('pending'),

	// Razorpay Specifics
	razorpay_subscription_id: z.string().nullable().optional(),

	// Subscription Lifecycle
	current_period_start: z.coerce.date().nullable().optional(),
	current_period_end: z.coerce.date().nullable().optional(),
	cancel_at_period_end: z.boolean().default(false),
	cancelled_at: z.coerce.date().nullable().optional(),

	// Metadata/Audit
	created_at: z.coerce.date().default(() => new Date()),
	updated_at: z.coerce.date().default(() => new Date()),
});

// For creating a new subscription
export const createSubscriptionSchema = SubscriptionSchema.omit({
	id: true,
	created_at: true,
	updated_at: true,
});

// For updates (requires ID)
export const updateSubscriptionSchema = SubscriptionSchema.partial().extend({
	id: z.string().uuid('Invalid subscription ID'),
});

// Corrected TypeScript Types
export type SubscriptionValues = z.infer<typeof SubscriptionSchema>;
export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;