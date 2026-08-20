'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { cn, haptic } from '@/lib/utils'
import { contrastText } from '@/lib/categories'
import { useChartTheme } from '@/hooks/use-chart-theme'
import { formatHourShort } from '@/lib/date'
import type { HourSlots, Subcategory } from '@/types'

interface DayGridProps {
    hours: HourSlots
    /** Active brush. `null` means erase; `undefined` means no brush selected. */
    brush: Subcategory | null | undefined
    subcategoriesById: Map<string, Subcategory>
    onPaint: (hourIndices: number[], subcategory: Subcategory | null) => void
    /** Called when a cell is tapped with no brush selected. */
    onRequestPick: (hour: number) => void
    /** Marks the current hour so "now" is findable at a glance. */
    currentHour?: number
    disabled?: boolean
}

/**
 * The 24-hour logging surface.
 *
 * Interaction model: pick an activity once, then tap or drag across hours to
 * paint them. The previous version opened a modal dialog per hour and used
 * Ctrl/Cmd+click for multi-select — which no touch device can produce, making
 * bulk logging impossible on the phones most people use this on.
 *
 * Touch does not fire enter/leave events on elements the finger passes over,
 * so the drag is tracked by hit-testing `document.elementFromPoint` against
 * each cell's `data-hour` attribute.
 */
export function DayGrid({
    hours,
    brush,
    subcategoriesById,
    onPaint,
    onRequestPick,
    currentHour,
    disabled = false,
}: DayGridProps) {
    const theme = useChartTheme()
    const containerRef = useRef<HTMLDivElement>(null)
    const [painting, setPainting] = useState(false)
    const [preview, setPreview] = useState<Set<number>>(new Set())
    const paintedRef = useRef<Set<number>>(new Set())
    const brushActive = brush !== undefined

    const hourAtPoint = useCallback((clientX: number, clientY: number): number | null => {
        const element = document.elementFromPoint(clientX, clientY)
        const cell = element?.closest<HTMLElement>('[data-hour]')
        if (!cell || !containerRef.current?.contains(cell)) return null
        const value = Number(cell.dataset.hour)
        return Number.isInteger(value) ? value : null
    }, [])

    const commit = useCallback(() => {
        const indices = Array.from(paintedRef.current)
        if (indices.length > 0 && brushActive) {
            onPaint(indices, brush ?? null)
        }
        paintedRef.current = new Set()
        setPreview(new Set())
        setPainting(false)
    }, [brush, brushActive, onPaint])

    const addHour = useCallback((hour: number) => {
        if (paintedRef.current.has(hour)) return
        paintedRef.current.add(hour)
        setPreview(new Set(paintedRef.current))
        haptic(6)
    }, [])

    const handlePointerDown = useCallback(
        (event: React.PointerEvent) => {
            if (disabled) return
            const hour = hourAtPoint(event.clientX, event.clientY)
            if (hour == null) return

            if (!brushActive) {
                onRequestPick(hour)
                return
            }

            // Capture on the container so the drag keeps tracking even when the
            // finger leaves the grid bounds.
            containerRef.current?.setPointerCapture(event.pointerId)
            setPainting(true)
            paintedRef.current = new Set()
            addHour(hour)
        },
        [addHour, brushActive, disabled, hourAtPoint, onRequestPick]
    )

    const handlePointerMove = useCallback(
        (event: React.PointerEvent) => {
            if (!painting) return
            const hour = hourAtPoint(event.clientX, event.clientY)
            if (hour != null) addHour(hour)
        },
        [addHour, hourAtPoint, painting]
    )

    const handlePointerUp = useCallback(
        (event: React.PointerEvent) => {
            if (!painting) return
            containerRef.current?.releasePointerCapture?.(event.pointerId)
            commit()
        },
        [commit, painting]
    )

    // A pointer cancel (incoming call, system gesture) must still commit what
    // was painted rather than silently dropping the user's input.
    useEffect(() => {
        if (!painting) return
        const onCancel = () => commit()
        window.addEventListener('pointercancel', onCancel)
        return () => window.removeEventListener('pointercancel', onCancel)
    }, [commit, painting])

    return (
        <div
            ref={containerRef}
            role="grid"
            aria-label="Hours of the day"
            className={cn(
                'grid grid-cols-4 gap-1.5 sm:grid-cols-6 sm:gap-2 lg:grid-cols-8',
                // Only suppress native scrolling while a brush is armed, so the
                // page still scrolls normally when the user is just reading.
                brushActive && !disabled && 'touch-none-select-none'
            )}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
        >
            {Array.from({ length: 24 }, (_, hour) => {
                const slot = hours[hour]
                const subcategory = slot
                    ? (subcategoriesById.get(slot.subcategoryId) ?? slot.subcategory)
                    : undefined
                const inPreview = preview.has(hour)

                // While dragging, show the pending result immediately.
                const rawColor = inPreview
                    ? brush
                        ? brush.color
                        : undefined
                    : subcategory?.color
                const effectiveColor = rawColor ? theme.color(rawColor) : undefined

                const label = inPreview
                    ? (brush?.name ?? '')
                    : (subcategory?.name ?? slot?.taskName ?? '')

                const filled = Boolean(effectiveColor)
                const textColor = effectiveColor ? contrastText(effectiveColor) : undefined

                return (
                    <button
                        key={hour}
                        type="button"
                        data-hour={hour}
                        role="gridcell"
                        aria-label={`${formatHourShort(hour)} — ${label || 'not logged'}`}
                        disabled={disabled}
                        className={cn(
                            'relative flex h-16 flex-col items-start justify-between rounded-lg border p-2 text-left transition-all sm:h-20',
                            'focus-visible:ring-ring/60 outline-none focus-visible:ring-2',
                            filled
                                ? 'border-transparent shadow-sm'
                                : 'border-cell-empty-border bg-cell-empty hover:border-ring/40',
                            inPreview && 'scale-[0.97] ring-2 ring-brand',
                            currentHour === hour && !filled && 'border-brand/60 border-dashed',
                            disabled && 'opacity-60'
                        )}
                        style={
                            effectiveColor
                                ? { backgroundColor: effectiveColor, color: textColor }
                                : undefined
                        }
                    >
                        <span
                            className={cn(
                                'font-mono text-[10px] leading-none tabular-nums sm:text-[11px]',
                                filled ? 'opacity-80' : 'text-muted-foreground'
                            )}
                        >
                            {formatHourShort(hour)}
                        </span>

                        {label ? (
                            <span className="line-clamp-2 w-full text-[11px] font-medium leading-tight sm:text-xs">
                                {label}
                            </span>
                        ) : null}

                        {currentHour === hour && (
                            <span
                                aria-hidden
                                className="bg-brand absolute right-1.5 top-1.5 size-1.5 rounded-full"
                            />
                        )}
                    </button>
                )
            })}
        </div>
    )
}
