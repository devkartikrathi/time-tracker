'use client'

import { CATEGORY_META, CATEGORY_ORDER } from '@/lib/categories'
import { useChartTheme } from '@/hooks/use-chart-theme'
import type { CategoryTotals } from '@/lib/stats'

interface DaySummaryProps {
    totals: CategoryTotals
}

/**
 * A single stacked bar for the day: how the 24 hours divide, with the unlogged
 * remainder shown explicitly rather than omitted. Seeing the gap is the point —
 * unaccounted time is usually the most interesting thing on the screen.
 */
export function DaySummary({ totals }: DaySummaryProps) {
    const theme = useChartTheme()
    const logged = totals.REST + totals.WORK + totals.OTHER
    const unlogged = Math.max(0, 24 - logged)

    return (
        <div className="space-y-2">
            <div
                className="bg-cell-empty flex h-2.5 w-full gap-[2px] overflow-hidden rounded-full"
                role="img"
                aria-label={`${logged} of 24 hours logged: ${CATEGORY_ORDER.map(
                    (c) => `${totals[c]} ${CATEGORY_META[c].label}`
                ).join(', ')}`}
            >
                {CATEGORY_ORDER.map((category) =>
                    totals[category] > 0 ? (
                        <div
                            key={category}
                            style={{
                                width: `${(totals[category] / 24) * 100}%`,
                                backgroundColor: theme.category(category),
                            }}
                        />
                    ) : null
                )}
            </div>

            <div className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                {CATEGORY_ORDER.map((category) => (
                    <span key={category} className="flex items-center gap-1.5">
                        <span
                            aria-hidden
                            className="size-2 rounded-full"
                            style={{ backgroundColor: theme.category(category) }}
                        />
                        <span className="text-foreground font-medium tabular-nums">
                            {totals[category]}h
                        </span>
                        {CATEGORY_META[category].label}
                    </span>
                ))}
                {unlogged > 0 && (
                    <span className="tabular-nums">{unlogged}h unlogged</span>
                )}
            </div>
        </div>
    )
}
