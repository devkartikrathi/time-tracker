'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { DayGrid } from '@/components/app/day-grid'
import { DaySummary } from '@/components/app/day-summary'
import { MoodPicker } from '@/components/app/mood-picker'
import { ActivityPalette } from '@/components/app/activity-palette'
import { ActivityPicker } from '@/components/app/activity-picker'
import { WellBeingPicker } from '@/components/app/wellbeing-picker'
import { ManageActivities } from '@/components/app/manage-activities'
import {
    useCategories,
    useDayEditor,
    useMonthDays,
    useSubcategories,
} from '@/hooks/use-tracker'
import {
    addDayKey,
    friendlyDate,
    fromDayKey,
    isFuture,
    todayKey,
    type DayKey,
} from '@/lib/date'
import { totalsForDay } from '@/lib/stats'
import type { Subcategory } from '@/types'

export default function TodayPage() {
    const [date, setDate] = useState<DayKey>(todayKey())
    const [brush, setBrush] = useState<Subcategory | null | undefined>(undefined)
    const [pickerHour, setPickerHour] = useState<number | null>(null)
    const [manageOpen, setManageOpen] = useState(false)

    const anchor = useMemo(() => fromDayKey(date), [date])
    const { data: days = [], isLoading } = useMonthDays(anchor)
    const { data: subcategories = [] } = useSubcategories()
    const categories = useCategories()
    const { dayFor, paintHours, setMood, setTags } = useDayEditor(anchor, days)

    const day = dayFor(date)
    const totals = totalsForDay(day)

    const subcategoriesById = useMemo(
        () => new Map(subcategories.map((s) => [s.id, s])),
        [subcategories]
    )

    const isToday = date === todayKey()
    const currentHour = isToday ? new Date().getHours() : undefined
    const canGoForward = !isFuture(addDayKey(date, 1))

    const handlePickerSelect = (subcategory: Subcategory | null) => {
        if (pickerHour != null) {
            paintHours(date, [pickerHour], subcategory)
        }
        // Arming the picked activity turns the next hours into a single drag.
        if (subcategory) setBrush(subcategory)
        setPickerHour(null)
    }

    return (
        <>
            <div className="space-y-5">
                <header className="flex items-center justify-between gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Previous day"
                        onClick={() => setDate(addDayKey(date, -1))}
                    >
                        <ChevronLeft className="size-5" />
                    </Button>

                    <div className="min-w-0 text-center">
                        <h1 className="truncate text-lg font-semibold tracking-tight">
                            {friendlyDate(date)}
                        </h1>
                        <p className="text-muted-foreground text-xs">
                            {fromDayKey(date).toLocaleDateString(undefined, {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </p>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Next day"
                        disabled={!canGoForward}
                        onClick={() => setDate(addDayKey(date, 1))}
                    >
                        <ChevronRight className="size-5" />
                    </Button>
                </header>

                {!isToday && (
                    <div className="flex justify-center">
                        <Button variant="outline" size="sm" onClick={() => setDate(todayKey())}>
                            Back to today
                        </Button>
                    </div>
                )}

                <DaySummary totals={totals} />

                {isLoading ? (
                    <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 sm:gap-2 lg:grid-cols-8">
                        {Array.from({ length: 24 }, (_, i) => (
                            <Skeleton key={i} className="h-16 rounded-lg sm:h-20" />
                        ))}
                    </div>
                ) : (
                    <DayGrid
                        hours={day.hours}
                        brush={brush}
                        subcategoriesById={subcategoriesById}
                        currentHour={currentHour}
                        onPaint={(indices, subcategory) => paintHours(date, indices, subcategory)}
                        onRequestPick={setPickerHour}
                    />
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                    <MoodPicker value={day.mood} onChange={(mood) => setMood(date, mood)} />
                    <WellBeingPicker
                        value={day.wellBeingTags}
                        onChange={(tags) => setTags(date, tags)}
                    />
                </div>
            </div>

            {/* Brush bar sits above the tab bar, within thumb reach. */}
            <div className="fixed inset-x-0 bottom-14 z-30 mb-[env(safe-area-inset-bottom)] md:bottom-0 md:mb-0">
                <div className="mx-auto max-w-5xl">
                    <ActivityPalette
                        categories={categories}
                        brush={brush}
                        onBrushChange={setBrush}
                        onManage={() => setManageOpen(true)}
                    />
                </div>
            </div>

            <ActivityPicker
                open={pickerHour != null}
                onOpenChange={(open) => !open && setPickerHour(null)}
                hour={pickerHour}
                categories={categories}
                currentSubcategoryId={
                    pickerHour != null ? day.hours[pickerHour]?.subcategoryId : undefined
                }
                onSelect={handlePickerSelect}
            />

            <ManageActivities open={manageOpen} onOpenChange={setManageOpen} />
        </>
    )
}
