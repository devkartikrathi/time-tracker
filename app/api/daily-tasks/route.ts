import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { fail, handleRouteError, ok, rateLimit } from '@/lib/api-response'
import { dateRangeQuerySchema, upsertDailyTaskSchema } from '@/lib/validation'
import { refreshProgress } from '@/lib/progress'
import { limitsFor } from '@/lib/plan'
import { addDayKey, todayKey } from '@/lib/date'
import type { Prisma } from '@/prisma/generated/prisma/client'
import type { HourSlots } from '@/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: Request) {
    try {
        const user = await requireUser()
        const url = new URL(req.url)

        const query = dateRangeQuerySchema.parse({
            date: url.searchParams.get('date') || undefined,
            startDate: url.searchParams.get('startDate') || undefined,
            endDate: url.searchParams.get('endDate') || undefined,
        })

        // Free accounts read a bounded window of history. The clamp happens
        // here rather than in the UI so the limit cannot be bypassed by
        // crafting a request.
        const limits = limitsFor(user.plan)
        const earliest = Number.isFinite(limits.historyDays)
            ? addDayKey(todayKey(), -limits.historyDays)
            : null

        const where = {
            userId: user.id,
            ...(query.date
                ? { date: earliest && query.date < earliest ? '__blocked__' : query.date }
                : query.startDate && query.endDate
                  ? {
                        date: {
                            gte: earliest && query.startDate < earliest ? earliest : query.startDate,
                            lte: query.endDate,
                        },
                    }
                  : earliest
                    ? { date: { gte: earliest } }
                    : {}),
        }

        const dailyTasks = await prisma.dailyTask.findMany({
            where,
            orderBy: { date: 'asc' },
        })

        return ok(dailyTasks)
    } catch (error) {
        return handleRouteError(error, 'GET /api/daily-tasks')
    }
}

/**
 * Upsert a day. This is the app's hot path — every cell tap lands here — so it
 * is a single atomic upsert rather than the previous find-then-update-or-create,
 * which could race two rapid taps into a unique-constraint error.
 */
export async function PUT(req: Request) {
    try {
        const user = await requireUser()

        if (!rateLimit(`daily-tasks:${user.id}`, 120)) {
            return fail('Slow down a moment', 429)
        }

        const body = upsertDailyTaskSchema.parse(await req.json())

        // Strip the denormalised subcategory before persisting so renaming an
        // activity is reflected everywhere instead of leaving stale copies.
        const hours = body.hours.map((hour) =>
            hour
                ? {
                      taskName: hour.taskName,
                      category: hour.category,
                      subcategoryId: hour.subcategoryId,
                  }
                : null
        ) satisfies HourSlots as unknown as Prisma.InputJsonValue

        const saved = await prisma.dailyTask.upsert({
            where: { userId_date: { userId: user.id, date: body.date } },
            update: {
                hours,
                wellBeingTags: body.wellBeingTags ?? [],
                ...(body.mood !== undefined ? { mood: body.mood } : {}),
                ...(body.note !== undefined ? { note: body.note } : {}),
            },
            create: {
                userId: user.id,
                date: body.date,
                hours,
                wellBeingTags: body.wellBeingTags ?? [],
                mood: body.mood ?? null,
                note: body.note ?? null,
            },
        })

        const progress = await refreshProgress(user.id)

        return ok({ dailyTask: saved, progress })
    } catch (error) {
        return handleRouteError(error, 'PUT /api/daily-tasks')
    }
}

/** Clears a whole day. Previously there was no delete at all — "remove" wrote
 *  a row of nulls and left an empty record behind forever. */
export async function DELETE(req: Request) {
    try {
        const user = await requireUser()
        const url = new URL(req.url)
        const date = url.searchParams.get('date')

        if (!date) return fail('A date is required', 400)

        await prisma.dailyTask.deleteMany({
            where: { userId: user.id, date },
        })

        const progress = await refreshProgress(user.id)
        return ok({ deleted: true, progress })
    } catch (error) {
        return handleRouteError(error, 'DELETE /api/daily-tasks')
    }
}
