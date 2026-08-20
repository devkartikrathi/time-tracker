import { z } from 'zod'
import { WELL_BEING_TAGS } from '@/types'

/**
 * Request schemas. The previous API routes destructured request bodies with no
 * validation at all, so a malformed `hours` array or an oversized note went
 * straight into Postgres.
 */

export const categorySchema = z.enum(['REST', 'WORK', 'OTHER'])
export const goalPeriodSchema = z.enum(['DAILY', 'WEEKLY', 'MONTHLY'])

export const dayKeySchema = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
    .refine((value) => !Number.isNaN(new Date(`${value}T00:00:00`).getTime()), 'Invalid calendar date')

export const hexColorSchema = z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Must be a hex colour like #10b981')

export const wellBeingTagSchema = z.enum(WELL_BEING_TAGS)

const hourDataSchema = z.object({
    taskName: z.string().min(1).max(80),
    category: categorySchema,
    subcategoryId: z.string().min(1).max(60),
    // The client denormalises the subcategory for rendering; it is stripped
    // before persisting so a renamed activity is never stale in stored rows.
    subcategory: z.unknown().optional(),
})

export const hoursArraySchema = z
    .array(hourDataSchema.nullable())
    .length(24, 'hours must contain exactly 24 slots')

export const upsertDailyTaskSchema = z.object({
    date: dayKeySchema,
    hours: hoursArraySchema,
    wellBeingTags: z.array(wellBeingTagSchema).max(WELL_BEING_TAGS.length).optional().default([]),
    mood: z.number().int().min(1).max(5).nullable().optional(),
    note: z.string().max(500).nullable().optional(),
})

export const dateRangeQuerySchema = z.object({
    date: dayKeySchema.optional(),
    startDate: dayKeySchema.optional(),
    endDate: dayKeySchema.optional(),
})

export const createSubcategorySchema = z.object({
    name: z.string().min(1, 'Name is required').max(40).trim(),
    color: hexColorSchema,
    category: categorySchema,
    icon: z.string().max(40).optional().nullable(),
})

export const updateSubcategorySchema = createSubcategorySchema.partial().extend({
    sortOrder: z.number().int().min(0).max(999).optional(),
    isArchived: z.boolean().optional(),
})

export const createGoalSchema = z.object({
    name: z.string().min(1, 'Name is required').max(60).trim(),
    targetHours: z.number().min(0.5).max(24),
    period: goalPeriodSchema.default('DAILY'),
    category: categorySchema,
    subcategoryId: z.string().min(1, 'Pick an activity'),
})

export const updateGoalSchema = createGoalSchema.partial().extend({
    isActive: z.boolean().optional(),
})

export const onboardingSchema = z.object({
    occupation: z.string().min(1).max(60).trim(),
    age: z.coerce.number().int().min(13).max(120),
    focus: z.string().min(1).max(120).trim(),
    timezone: z.string().max(64).optional(),
    subcategoryIds: z.array(z.string()).optional(),
})

export const updateUserSchema = z.object({
    timezone: z.string().max(64).optional(),
    weekStartsOn: z.number().int().min(0).max(6).optional(),
    reminderHour: z.number().int().min(0).max(23).nullable().optional(),
    occupation: z.string().max(60).optional(),
    focus: z.string().max(120).optional(),
})

export const pushSubscriptionSchema = z.object({
    endpoint: z.string().url().max(500),
    keys: z.object({
        p256dh: z.string().min(1).max(200),
        auth: z.string().min(1).max(200),
    }),
})

/** Flattens a ZodError into `{ field: message }` for form display. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
    const out: Record<string, string> = {}
    for (const issue of error.issues) {
        const key = issue.path.join('.') || '_'
        if (!out[key]) out[key] = issue.message
    }
    return out
}
