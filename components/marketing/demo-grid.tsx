'use client'

import { useMemo, useState } from 'react'
import { DayGrid } from '@/components/app/day-grid'
import { contrastText } from '@/lib/categories'
import { useChartTheme } from '@/hooks/use-chart-theme'
import { cn } from '@/lib/utils'
import type { HourSlots, Subcategory } from '@/types'

const DEMO_ACTIVITIES: Subcategory[] = [
    { id: 'sleep', name: 'Sleep', color: '#2a78d6', category: 'REST' },
    { id: 'work', name: 'Deep Work', color: '#1baf7a', category: 'WORK' },
    { id: 'people', name: 'People', color: '#e87ba4', category: 'OTHER' },
    { id: 'exercise', name: 'Exercise', color: '#eb6834', category: 'OTHER' },
]

const BY_ID = new Map(DEMO_ACTIVITIES.map((a) => [a.id, a]))

/** A plausible-looking day so the grid is never empty on first paint. */
function seedDay(): HourSlots {
    const hours: HourSlots = Array(24).fill(null)
    const put = (from: number, to: number, activity: Subcategory) => {
        for (let h = from; h < to; h++) {
            hours[h] = {
                taskName: activity.name,
                category: activity.category,
                subcategoryId: activity.id,
                subcategory: activity,
            }
        }
    }
    put(0, 7, DEMO_ACTIVITIES[0]!)
    put(7, 8, DEMO_ACTIVITIES[3]!)
    put(9, 12, DEMO_ACTIVITIES[1]!)
    put(13, 17, DEMO_ACTIVITIES[1]!)
    put(19, 21, DEMO_ACTIVITIES[2]!)
    put(23, 24, DEMO_ACTIVITIES[0]!)
    return hours
}

/**
 * A fully working grid on the marketing page.
 *
 * Letting someone paint their own hours before they have an account is the
 * single strongest thing this page can do — the interaction *is* the product,
 * and a screenshot cannot convey how fast it is.
 */
export function DemoGrid() {
    const theme = useChartTheme()
    const [hours, setHours] = useState<HourSlots>(seedDay)
    const [brush, setBrush] = useState<Subcategory | null | undefined>(DEMO_ACTIVITIES[1])

    const paint = (indices: number[], activity: Subcategory | null) => {
        setHours((prev) => {
            const next = [...prev]
            for (const index of indices) {
                next[index] = activity
                    ? {
                          taskName: activity.name,
                          category: activity.category,
                          subcategoryId: activity.id,
                          subcategory: activity,
                      }
                    : null
            }
            return next
        })
    }

    const filled = useMemo(() => hours.filter(Boolean).length, [hours])

    return (
        <div className="bg-card rounded-2xl border p-4 shadow-sm sm:p-6">
            <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium">Try it — drag across the hours</p>
                <span className="text-muted-foreground text-xs tabular-nums">{filled}/24</span>
            </div>

            <DayGrid
                hours={hours}
                brush={brush}
                subcategoriesById={BY_ID}
                onPaint={paint}
                onRequestPick={() => setBrush(DEMO_ACTIVITIES[1])}
            />

            <div className="mt-4 flex flex-wrap gap-2">
                {DEMO_ACTIVITIES.map((activity) => {
                    const selected = brush?.id === activity.id
                    const color = theme.color(activity.color)
                    return (
                        <button
                            key={activity.id}
                            type="button"
                            onClick={() => setBrush(activity)}
                            aria-pressed={selected}
                            className={cn(
                                'flex h-9 items-center gap-2 rounded-full border px-3 text-xs font-medium transition-all',
                                selected ? 'border-transparent shadow-sm' : 'hover:bg-accent'
                            )}
                            style={
                                selected
                                    ? { backgroundColor: color, color: contrastText(color) }
                                    : undefined
                            }
                        >
                            <span
                                aria-hidden
                                className="size-2.5 rounded-full"
                                style={{ backgroundColor: color }}
                            />
                            {activity.name}
                        </button>
                    )
                })}
                <button
                    type="button"
                    onClick={() => setBrush(null)}
                    aria-pressed={brush === null}
                    className={cn(
                        'flex h-9 items-center rounded-full border px-3 text-xs font-medium transition-all',
                        brush === null
                            ? 'bg-destructive text-destructive-foreground border-transparent'
                            : 'hover:bg-accent'
                    )}
                >
                    Erase
                </button>
            </div>
        </div>
    )
}
