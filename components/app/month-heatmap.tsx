'use client'

import { useMemo } from 'react'
import { useChartTheme } from '@/hooks/use-chart-theme'
import { daysInMonth, toDayKey } from '@/lib/date'
import { cn } from '@/lib/utils'
import type { DailyTask, Subcategory } from '@/types'

interface MonthHeatmapProps {
    anchor: Date
    days: DailyTask[]
    subcategories: Subcategory[]
    onSelectDay: (date: string) => void
    selectedDate?: string
}

/**
 * The month at a glance: one row per day, one cell per hour.
 *
 * Sized in fractional units so all 24 hours fit the viewport width on a phone.
 * The previous version used fixed 24-32px cells inside a horizontal scroller,
 * which meant a phone user could never see a whole day without scrolling, and
 * could not see the month's shape at all — the entire point of this view.
 *
 * This is a read surface, not an input one. Tapping a row opens that day in the
 * editor, where the targets are thumb-sized.
 */
export function MonthHeatmap({
    anchor,
    days,
    subcategories,
    onSelectDay,
    selectedDate,
}: MonthHeatmapProps) {
    const theme = useChartTheme()
    const total = daysInMonth(anchor)
    const year = anchor.getFullYear()
    const month = anchor.getMonth()
    const todayStr = toDayKey(new Date())

    const colorById = useMemo(
        () => new Map(subcategories.map((s) => [s.id, s.color])),
        [subcategories]
    )
    const byDate = useMemo(() => new Map(days.map((d) => [d.date, d])), [days])

    return (
        <div className="space-y-1">
            {/* Hour ruler — only every 6th hour is labelled; 24 labels at this
                width would collide into an unreadable smear. */}
            <div
                className="text-muted-foreground grid items-center text-[9px] tabular-nums"
                style={{ gridTemplateColumns: '1.75rem repeat(24, minmax(0, 1fr))', gap: '2px' }}
                aria-hidden
            >
                <span />
                {Array.from({ length: 24 }, (_, hour) => (
                    <span key={hour} className="text-center">
                        {hour % 6 === 0 ? hour : ''}
                    </span>
                ))}
            </div>

            {Array.from({ length: total }, (_, index) => {
                const day = index + 1
                const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                const record = byDate.get(date)
                const isToday = date === todayStr
                const isSelected = date === selectedDate
                const weekday = new Date(year, month, day).getDay()
                const isWeekend = weekday === 0 || weekday === 6

                return (
                    <button
                        key={date}
                        type="button"
                        onClick={() => onSelectDay(date)}
                        aria-label={`${date}, ${record?.hours.filter(Boolean).length ?? 0} hours logged`}
                        className={cn(
                            'grid w-full items-center rounded transition-colors',
                            'focus-visible:ring-ring/60 outline-none focus-visible:ring-2',
                            isSelected && 'ring-brand ring-2',
                            'hover:bg-accent/40'
                        )}
                        style={{
                            gridTemplateColumns: '1.75rem repeat(24, minmax(0, 1fr))',
                            gap: '2px',
                        }}
                    >
                        <span
                            className={cn(
                                'text-right text-[10px] tabular-nums leading-none',
                                isToday
                                    ? 'text-brand font-bold'
                                    : isWeekend
                                      ? 'text-muted-foreground/60'
                                      : 'text-muted-foreground'
                            )}
                        >
                            {day}
                        </span>

                        {Array.from({ length: 24 }, (_, hour) => {
                            const slot = record?.hours[hour]
                            const stored = slot ? colorById.get(slot.subcategoryId) : undefined
                            const fill = stored
                                ? theme.color(stored)
                                : slot
                                  ? theme.category(slot.category)
                                  : undefined

                            return (
                                <span
                                    key={hour}
                                    className={cn(
                                        'h-3.5 rounded-[2px] sm:h-4',
                                        !fill && 'bg-cell-empty'
                                    )}
                                    style={fill ? { backgroundColor: fill } : undefined}
                                />
                            )
                        })}
                    </button>
                )
            })}
        </div>
    )
}
