'use client'

import { Trash2 } from 'lucide-react'
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { contrastText } from '@/lib/categories'
import { formatHourRange } from '@/lib/date'
import { cn } from '@/lib/utils'
import { useChartTheme } from '@/hooks/use-chart-theme'
import type { Category, Subcategory } from '@/types'

interface ActivityPickerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    hour: number | null
    categories: Category[]
    currentSubcategoryId?: string
    onSelect: (subcategory: Subcategory | null) => void
}

/**
 * Bottom sheet for choosing an activity for one hour.
 *
 * Reached by tapping an hour with no brush armed. It doubles as the discovery
 * path for the brush model — picking here also arms that activity, so the next
 * hours can simply be dragged.
 */
export function ActivityPicker({
    open,
    onOpenChange,
    hour,
    categories,
    currentSubcategoryId,
    onSelect,
}: ActivityPickerProps) {
    const theme = useChartTheme()

    return (
        <Drawer open={open} onOpenChange={onOpenChange}>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>{hour != null ? formatHourRange(hour) : 'Pick an activity'}</DrawerTitle>
                    <DrawerDescription>
                        Choosing here also arms this activity, so you can drag across the next hours.
                    </DrawerDescription>
                </DrawerHeader>

                <div className="space-y-5 overflow-y-auto px-4 pb-4">
                    {categories.map((category) =>
                        category.subcategories.length > 0 ? (
                            <div key={category.id}>
                                <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-wide">
                                    {category.label}
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    {category.subcategories.map((activity) => {
                                        const selected = currentSubcategoryId === activity.id
                                        const color = theme.color(activity.color)
                                        return (
                                            <button
                                                key={activity.id}
                                                type="button"
                                                onClick={() => onSelect(activity)}
                                                className={cn(
                                                    'flex min-h-12 items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-sm font-medium transition-all',
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
                                                    className="size-3.5 shrink-0 rounded-full ring-1 ring-black/10"
                                                    style={{ backgroundColor: color }}
                                                />
                                                <span className="truncate">{activity.name}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        ) : null
                    )}

                    {currentSubcategoryId && (
                        <Button
                            variant="outline"
                            className="text-destructive w-full"
                            onClick={() => onSelect(null)}
                        >
                            <Trash2 className="size-4" />
                            Clear this hour
                        </Button>
                    )}
                </div>
            </DrawerContent>
        </Drawer>
    )
}
