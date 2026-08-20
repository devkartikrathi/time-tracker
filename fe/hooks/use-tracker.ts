'use client'

import { useCallback, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, ApiError, type SaveDayResult } from '@/lib/api-client'
import { ACHIEVEMENTS_BY_KEY } from '@/lib/achievements'
import { monthBounds, toDayKey, type DayKey } from '@/lib/date'
import { haptic } from '@/lib/utils'
import type { Category, DailyTask, HourData, HourSlots, Subcategory } from '@/types'
import { CATEGORY_LIST } from '@/lib/categories'

export const queryKeys = {
    user: ['user'] as const,
    subcategories: ['subcategories'] as const,
    goals: ['goals'] as const,
    days: (start: string, end: string) => ['days', start, end] as const,
    insights: (ai: boolean) => ['insights', ai] as const,
}

const EMPTY_HOURS: HourSlots = Array(24).fill(null)

export function useUserBundle() {
    return useQuery({
        queryKey: queryKeys.user,
        queryFn: api.getUser,
        staleTime: 60_000,
    })
}

export function useSubcategories() {
    return useQuery({
        queryKey: queryKeys.subcategories,
        queryFn: api.getSubcategories,
        staleTime: 300_000,
    })
}

export function useGoals() {
    return useQuery({ queryKey: queryKeys.goals, queryFn: api.getGoals, staleTime: 120_000 })
}

/** Days for a month, keyed by the month's bounds so navigation caches per month. */
export function useMonthDays(anchor: Date) {
    const { startKey, endKey } = useMemo(() => monthBounds(anchor), [anchor])

    return useQuery({
        queryKey: queryKeys.days(startKey, endKey),
        queryFn: () => api.getDays({ startDate: startKey, endDate: endKey }),
        staleTime: 30_000,
        placeholderData: (previous) => previous,
    })
}

/** Categories with their subcategories nested, in display order. */
export function useCategories(): Category[] {
    const { data: subcategories = [] } = useSubcategories()

    return useMemo(
        () =>
            CATEGORY_LIST.map((meta) => ({
                id: meta.id,
                name: meta.name,
                label: meta.label,
                color: meta.color,
                subcategories: subcategories.filter((s) => s.category === meta.id),
            })),
        [subcategories]
    )
}

/**
 * Saves a day with an optimistic cache write.
 *
 * Painting an hour must feel instantaneous on a phone, so the grid is updated
 * before the request leaves. If the write fails the previous cache snapshot is
 * restored and the user is told, rather than the cell silently reverting.
 */
export function useSaveDay(anchor: Date) {
    const queryClient = useQueryClient()
    const { startKey, endKey } = useMemo(() => monthBounds(anchor), [anchor])
    const key = queryKeys.days(startKey, endKey)

    return useMutation({
        mutationFn: (day: {
            date: DayKey
            hours: HourSlots
            wellBeingTags?: string[]
            mood?: number | null
            note?: string | null
        }) => api.saveDay(day),

        onMutate: async (day) => {
            await queryClient.cancelQueries({ queryKey: key })
            const previous = queryClient.getQueryData<DailyTask[]>(key)

            queryClient.setQueryData<DailyTask[]>(key, (old = []) => {
                const index = old.findIndex((d) => d.date === day.date)
                const next: DailyTask = {
                    id: old[index]?.id ?? `optimistic-${day.date}`,
                    date: day.date,
                    hours: day.hours,
                    wellBeingTags:
                        (day.wellBeingTags as DailyTask['wellBeingTags']) ??
                        old[index]?.wellBeingTags ??
                        [],
                    mood: day.mood !== undefined ? day.mood : (old[index]?.mood ?? null),
                    note: day.note !== undefined ? day.note : (old[index]?.note ?? null),
                }
                if (index >= 0) {
                    const copy = [...old]
                    copy[index] = next
                    return copy
                }
                return [...old, next].sort((a, b) => a.date.localeCompare(b.date))
            })

            return { previous }
        },

        onError: (error, _day, context) => {
            if (context?.previous) queryClient.setQueryData(key, context.previous)
            const message =
                error instanceof ApiError ? error.message : 'Could not save — check your connection'
            toast.error(message)
        },

        onSuccess: (result: SaveDayResult) => {
            // Streak and achievement state changed server-side.
            queryClient.invalidateQueries({ queryKey: queryKeys.user })
            queryClient.invalidateQueries({ queryKey: ['insights'] })

            for (const unlocked of result.progress.newAchievements) {
                const def = ACHIEVEMENTS_BY_KEY.get(unlocked)
                if (!def) continue
                haptic([12, 40, 12])
                toast.success(`Achievement unlocked: ${def.name}`, {
                    description: def.description,
                    duration: 6000,
                })
            }
        },
    })
}

/** Editing helpers over a day's 24 slots. */
export function useDayEditor(anchor: Date, days: DailyTask[]) {
    const save = useSaveDay(anchor)

    const dayFor = useCallback(
        (date: DayKey): DailyTask => {
            const found = days.find((d) => d.date === date)
            return (
                found ?? {
                    id: `new-${date}`,
                    date,
                    hours: [...EMPTY_HOURS],
                    wellBeingTags: [],
                    mood: null,
                    note: null,
                }
            )
        },
        [days]
    )

    /** Paints a set of hours in one day with one activity, or clears them. */
    const paintHours = useCallback(
        (date: DayKey, hourIndices: number[], subcategory: Subcategory | null) => {
            const day = dayFor(date)
            const hours = [...day.hours]

            for (const index of hourIndices) {
                if (index < 0 || index > 23) continue
                hours[index] = subcategory
                    ? ({
                          taskName: subcategory.name,
                          category: subcategory.category,
                          subcategoryId: subcategory.id,
                          subcategory,
                      } satisfies HourData)
                    : null
            }

            save.mutate({ date, hours, wellBeingTags: day.wellBeingTags, mood: day.mood })
        },
        [dayFor, save]
    )

    const setMood = useCallback(
        (date: DayKey, mood: number | null) => {
            const day = dayFor(date)
            save.mutate({ date, hours: day.hours, wellBeingTags: day.wellBeingTags, mood })
        },
        [dayFor, save]
    )

    const setTags = useCallback(
        (date: DayKey, tags: string[]) => {
            const day = dayFor(date)
            save.mutate({ date, hours: day.hours, wellBeingTags: tags, mood: day.mood })
        },
        [dayFor, save]
    )

    const setNote = useCallback(
        (date: DayKey, note: string | null) => {
            const day = dayFor(date)
            save.mutate({
                date,
                hours: day.hours,
                wellBeingTags: day.wellBeingTags,
                mood: day.mood,
                note,
            })
        },
        [dayFor, save]
    )

    const clearDay = useCallback(
        (date: DayKey) => {
            save.mutate({ date, hours: [...EMPTY_HOURS], wellBeingTags: [], mood: null, note: null })
        },
        [save]
    )

    return { dayFor, paintHours, setMood, setTags, setNote, clearDay, isSaving: save.isPending }
}

export function todayAnchor() {
    return toDayKey(new Date())
}
