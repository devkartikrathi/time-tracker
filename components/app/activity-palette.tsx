'use client'

import { Eraser, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { contrastText } from '@/lib/categories'
import { useChartTheme } from '@/hooks/use-chart-theme'
import type { Category, Subcategory } from '@/types'

interface ActivityPaletteProps {
    categories: Category[]
    /** `undefined` = nothing armed, `null` = eraser armed. */
    brush: Subcategory | null | undefined
    onBrushChange: (brush: Subcategory | null | undefined) => void
    onManage: () => void
}

/**
 * The brush bar.
 *
 * Kept as a single horizontally-scrolling row within thumb reach at the bottom
 * of the screen: choosing an activity is the most repeated action in the app,
 * so it must never be more than one tap away or require reaching the top of a
 * phone screen.
 */
export function ActivityPalette({
    categories,
    brush,
    onBrushChange,
    onManage,
}: ActivityPaletteProps) {
    const theme = useChartTheme()
    const activities = categories.flatMap((category) => category.subcategories)

    return (
        <div className="bg-background/95 supports-[backdrop-filter]:bg-background/80 border-t backdrop-blur">
            <div className="flex items-center gap-2 px-3 py-2.5">
                <div className="no-scrollbar flex flex-1 items-center gap-2 overflow-x-auto">
                    {activities.map((activity) => {
                        const selected = brush?.id === activity.id
                        const color = theme.color(activity.color)
                        return (
                            <button
                                key={activity.id}
                                type="button"
                                onClick={() => onBrushChange(selected ? undefined : activity)}
                                aria-pressed={selected}
                                className={cn(
                                    'flex h-10 shrink-0 items-center gap-2 rounded-full border px-3 text-sm font-medium transition-all',
                                    'focus-visible:ring-ring/60 outline-none focus-visible:ring-2',
                                    selected
                                        ? 'border-transparent shadow-sm'
                                        : 'bg-card hover:bg-accent'
                                )}
                                style={
                                    selected
                                        ? {
                                              backgroundColor: color,
                                              color: contrastText(color),
                                          }
                                        : undefined
                                }
                            >
                                <span
                                    aria-hidden
                                    className="size-3 shrink-0 rounded-full ring-1 ring-black/10"
                                    style={{ backgroundColor: color }}
                                />
                                {activity.name}
                            </button>
                        )
                    })}

                    <button
                        type="button"
                        onClick={() => onBrushChange(brush === null ? undefined : null)}
                        aria-pressed={brush === null}
                        className={cn(
                            'flex h-10 shrink-0 items-center gap-2 rounded-full border px-3 text-sm font-medium transition-all',
                            'focus-visible:ring-ring/60 outline-none focus-visible:ring-2',
                            brush === null
                                ? 'bg-destructive text-destructive-foreground border-transparent'
                                : 'bg-card hover:bg-accent'
                        )}
                    >
                        <Eraser className="size-3.5" />
                        Erase
                    </button>
                </div>

                <button
                    type="button"
                    onClick={onManage}
                    aria-label="Manage activities"
                    className="bg-card hover:bg-accent focus-visible:ring-ring/60 flex size-10 shrink-0 items-center justify-center rounded-full border outline-none focus-visible:ring-2"
                >
                    <Plus className="size-4" />
                </button>
            </div>

            <p className="text-muted-foreground px-4 pb-2 text-[11px] leading-tight">
                {brush === undefined
                    ? 'Pick an activity, then tap or drag across the hours.'
                    : brush === null
                      ? 'Eraser armed — drag across hours to clear them.'
                      : `${brush.name} armed — drag across hours to fill them.`}
            </p>
        </div>
    )
}
