import { ImageResponse } from 'next/og'
import { requireUser, UnauthorizedError } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CATEGORY_META, categoryColor, resolveColor } from '@/lib/categories'
import { daysInMonth } from '@/lib/date'
import type { HourSlots } from '@/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Renders the user's month as a shareable card.
 *
 * This is the app's organic growth surface: a month grid is visually
 * distinctive and personal enough that people post it, and every post carries
 * the product name. Sized 1080x1350 — Instagram's 4:5 portrait, the largest
 * feed format, which also crops acceptably to square.
 */
export async function GET(req: Request) {
    try {
        const user = await requireUser()
        const url = new URL(req.url)
        const monthParam = url.searchParams.get('month') // YYYY-MM

        if (!monthParam || !/^\d{4}-\d{2}$/.test(monthParam)) {
            return new Response('A month in YYYY-MM format is required', { status: 400 })
        }

        const [year, month] = monthParam.split('-').map(Number)
        const anchor = new Date(year!, month! - 1, 1)
        const dayCount = daysInMonth(anchor)

        const [rows, subcategories] = await Promise.all([
            prisma.dailyTask.findMany({
                where: {
                    userId: user.id,
                    date: { gte: `${monthParam}-01`, lte: `${monthParam}-31` },
                },
            }),
            prisma.subcategory.findMany({ where: { userId: user.id } }),
        ])

        const colorById = new Map(subcategories.map((s) => [s.id, s.color]))
        const byDate = new Map(rows.map((r) => [r.date, (r.hours as HourSlots) ?? []]))

        let loggedHours = 0
        const totals = { REST: 0, WORK: 0, OTHER: 0 }
        for (const hours of byDate.values()) {
            for (const hour of hours) {
                if (!hour) continue
                loggedHours += 1
                totals[hour.category] += 1
            }
        }

        const monthLabel = anchor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
        const daysLogged = Array.from(byDate.values()).filter((h) => h.some(Boolean)).length

        const cellSize = 36
        const gap = 3

        return new ImageResponse(
            (
                <div
                    style={{
                        width: 1080,
                        height: 1350,
                        display: 'flex',
                        flexDirection: 'column',
                        background: '#111113',
                        padding: 64,
                        color: '#fafafa',
                        fontFamily: 'sans-serif',
                    }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', marginBottom: 40 }}>
                        <div style={{ fontSize: 30, color: '#a1a1aa', letterSpacing: 1 }}>
                            MY {monthLabel.toUpperCase()}
                        </div>
                        <div style={{ fontSize: 76, fontWeight: 700, marginTop: 8 }}>
                            {loggedHours} hours tracked
                        </div>
                        <div style={{ fontSize: 30, color: '#a1a1aa', marginTop: 8 }}>
                            across {daysLogged} {daysLogged === 1 ? 'day' : 'days'}
                        </div>
                    </div>

                    {/* Day rows: one row per day, one cell per hour */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
                        {Array.from({ length: dayCount }, (_, dayIndex) => {
                            const day = dayIndex + 1
                            const key = `${monthParam}-${String(day).padStart(2, '0')}`
                            const hours = byDate.get(key) ?? []
                            return (
                                <div key={key} style={{ display: 'flex', gap }}>
                                    {Array.from({ length: 24 }, (_, hourIndex) => {
                                        const slot = hours[hourIndex]
                                        // The card is always dark, so stored
                                        // light-mode colours are mapped to
                                        // their dark twins — the light values
                                        // fail contrast on this background.
                                        const stored = slot
                                            ? colorById.get(slot.subcategoryId)
                                            : undefined
                                        const color = slot
                                            ? stored
                                                ? resolveColor(stored, true)
                                                : categoryColor(slot.category, true)
                                            : '#1f1f23'
                                        return (
                                            <div
                                                key={hourIndex}
                                                style={{
                                                    width: cellSize,
                                                    height: cellSize,
                                                    borderRadius: 6,
                                                    background: color,
                                                }}
                                            />
                                        )
                                    })}
                                </div>
                            )
                        })}
                    </div>

                    <div style={{ display: 'flex', flex: 1 }} />

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderTop: '1px solid #27272a',
                            paddingTop: 32,
                        }}
                    >
                        <div style={{ display: 'flex', gap: 36 }}>
                            {(['REST', 'WORK', 'OTHER'] as const).map((category) => (
                                <div key={category} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div
                                        style={{
                                            width: 20,
                                            height: 20,
                                            borderRadius: 5,
                                            background: categoryColor(category, true),
                                        }}
                                    />
                                    <div style={{ fontSize: 28, color: '#d4d4d8' }}>
                                        {CATEGORY_META[category].label} {totals[category]}h
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ fontSize: 28, color: '#71717a', fontWeight: 600 }}>chronos</div>
                    </div>
                </div>
            ),
            { width: 1080, height: 1350 }
        )
    } catch (error) {
        // A signed-out request must read as 401, not as a server fault.
        if (error instanceof UnauthorizedError) {
            return new Response('You need to be signed in', { status: 401 })
        }
        console.error('[GET /api/share/month]', error)
        return new Response('Could not build your card', { status: 500 })
    }
}
