import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { fail, handleRouteError } from '@/lib/api-response'
import { limitsFor } from '@/lib/plan'
import { formatHourLong } from '@/lib/date'
import type { HourSlots } from '@/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/** Escapes a value for CSV — quotes, commas and newlines all need handling. */
function csvCell(value: unknown): string {
    const str = value == null ? '' : String(value)
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
}

export async function GET(req: Request) {
    try {
        const user = await requireUser()
        const limits = limitsFor(user.plan)

        if (!limits.export) {
            return fail('Exporting your data is a Pro feature', 403, { upgradeRequired: true })
        }

        const format = new URL(req.url).searchParams.get('format') === 'json' ? 'json' : 'csv'

        const [rows, subcategories] = await Promise.all([
            prisma.dailyTask.findMany({ where: { userId: user.id }, orderBy: { date: 'asc' } }),
            prisma.subcategory.findMany({ where: { userId: user.id } }),
        ])
        const byId = new Map(subcategories.map((s) => [s.id, s]))
        const stamp = new Date().toISOString().slice(0, 10)

        if (format === 'json') {
            const payload = {
                exportedAt: new Date().toISOString(),
                account: { email: user.email },
                activities: subcategories.map((s) => ({
                    id: s.id,
                    name: s.name,
                    category: s.category,
                    color: s.color,
                })),
                days: rows.map((row) => ({
                    date: row.date,
                    mood: row.mood,
                    note: row.note,
                    wellBeingTags: row.wellBeingTags,
                    hours: row.hours,
                })),
            }
            return new Response(JSON.stringify(payload, null, 2), {
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Disposition': `attachment; filename="chronos-export-${stamp}.json"`,
                },
            })
        }

        const lines = ['date,hour,hour_label,category,activity,mood,well_being_tags']
        for (const row of rows) {
            const hours = (row.hours as HourSlots) ?? []
            hours.forEach((hour, index) => {
                if (!hour) return
                lines.push(
                    [
                        row.date,
                        index,
                        formatHourLong(index),
                        hour.category,
                        byId.get(hour.subcategoryId)?.name ?? hour.taskName,
                        row.mood ?? '',
                        (row.wellBeingTags ?? []).join(' '),
                    ]
                        .map(csvCell)
                        .join(',')
                )
            })
        }

        return new Response(lines.join('\n'), {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="chronos-export-${stamp}.csv"`,
            },
        })
    } catch (error) {
        return handleRouteError(error, 'GET /api/export')
    }
}
