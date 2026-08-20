import type { CategoryType, DailyTask, Goal, HourSlots, Subcategory, WellBeingTag } from '@/types'
import { CATEGORY_ORDER } from '@/lib/categories'
import { addDayKey, type DayKey } from '@/lib/date'

export interface CategoryTotals {
    REST: number
    WORK: number
    OTHER: number
}

export const EMPTY_TOTALS: CategoryTotals = { REST: 0, WORK: 0, OTHER: 0 }

export function filledHours(hours: HourSlots): number {
    return hours.reduce<number>((n, h) => (h ? n + 1 : n), 0)
}

export function totalsForDay(task: DailyTask | undefined): CategoryTotals {
    const totals: CategoryTotals = { ...EMPTY_TOTALS }
    if (!task) return totals
    for (const hour of task.hours) {
        if (hour) totals[hour.category] += 1
    }
    return totals
}

export function totalsForRange(tasks: DailyTask[]): CategoryTotals {
    return tasks.reduce<CategoryTotals>((acc, task) => {
        const t = totalsForDay(task)
        acc.REST += t.REST
        acc.WORK += t.WORK
        acc.OTHER += t.OTHER
        return acc
    }, { ...EMPTY_TOTALS })
}

/** Hours per subcategory id across the given days. */
export function hoursBySubcategory(tasks: DailyTask[]): Map<string, number> {
    const map = new Map<string, number>()
    for (const task of tasks) {
        for (const hour of task.hours) {
            if (!hour) continue
            map.set(hour.subcategoryId, (map.get(hour.subcategoryId) ?? 0) + 1)
        }
    }
    return map
}

export interface SubcategoryBreakdown {
    id: string
    name: string
    color: string
    category: CategoryType
    hours: number
    percent: number
}

export function breakdownBySubcategory(
    tasks: DailyTask[],
    subcategories: Subcategory[]
): SubcategoryBreakdown[] {
    const totals = hoursBySubcategory(tasks)
    const grand = Array.from(totals.values()).reduce((a, b) => a + b, 0)
    const byId = new Map(subcategories.map((s) => [s.id, s]))

    return Array.from(totals.entries())
        .map(([id, hours]) => {
            const sub = byId.get(id)
            return {
                id,
                name: sub?.name ?? 'Deleted activity',
                color: sub?.color ?? '#a1a1aa',
                category: sub?.category ?? ('OTHER' as CategoryType),
                hours,
                percent: grand > 0 ? (hours / grand) * 100 : 0,
            }
        })
        .sort((a, b) => b.hours - a.hours)
}

export interface DailySeriesPoint {
    date: DayKey
    REST: number
    WORK: number
    OTHER: number
    total: number
    mood: number | null
}

export function dailySeries(tasks: DailyTask[], keys: DayKey[]): DailySeriesPoint[] {
    const byDate = new Map(tasks.map((t) => [t.date, t]))
    return keys.map((date) => {
        const task = byDate.get(date)
        const t = totalsForDay(task)
        return {
            date,
            REST: t.REST,
            WORK: t.WORK,
            OTHER: t.OTHER,
            total: t.REST + t.WORK + t.OTHER,
            mood: task?.mood ?? null,
        }
    })
}

/** Counts of each well-being tag across the range, for the balance wheel. */
export function wellBeingCounts(tasks: DailyTask[]): Record<WellBeingTag, number> {
    const counts = {} as Record<WellBeingTag, number>
    for (const task of tasks) {
        for (const tag of task.wellBeingTags ?? []) {
            counts[tag] = (counts[tag] ?? 0) + 1
        }
    }
    return counts
}

export interface GoalProgress {
    goal: Goal
    logged: number
    target: number
    percent: number
    met: boolean
    /** Days counted toward this goal's period. */
    periodDays: number
}

/**
 * Progress for a goal over its own period, anchored on `today`.
 * DAILY compares today's hours to the target; WEEKLY/MONTHLY sum the period
 * and scale the target by the number of days elapsed so a Monday reading is
 * not reported as "14% of the week" when the user is exactly on pace.
 */
export function goalProgress(goal: Goal, tasks: DailyTask[], today: DayKey): GoalProgress {
    const periodDays = goal.period === 'DAILY' ? 1 : goal.period === 'WEEKLY' ? 7 : 30
    const windowKeys = new Set(
        Array.from({ length: periodDays }, (_, i) => addDayKey(today, -i))
    )

    let logged = 0
    for (const task of tasks) {
        if (!windowKeys.has(task.date)) continue
        for (const hour of task.hours) {
            if (hour?.subcategoryId === goal.subcategoryId) logged += 1
        }
    }

    const target = goal.targetHours * periodDays
    return {
        goal,
        logged,
        target,
        percent: target > 0 ? Math.min(100, (logged / target) * 100) : 0,
        met: logged >= target,
        periodDays,
    }
}

/**
 * The hour-of-day profile: for each of the 24 hours, how often each category
 * was logged across the range. Drives the "your typical day" chart.
 */
export function hourProfile(tasks: DailyTask[]): Array<{ hour: number } & CategoryTotals> {
    const profile = Array.from({ length: 24 }, (_, hour) => ({ hour, ...EMPTY_TOTALS }))
    for (const task of tasks) {
        task.hours.forEach((hour, index) => {
            if (hour && profile[index]) profile[index]![hour.category] += 1
        })
    }
    return profile
}

/** Share of logged time per category, as percentages summing to 100. */
export function categoryShare(totals: CategoryTotals): Array<{ category: CategoryType; hours: number; percent: number }> {
    const grand = totals.REST + totals.WORK + totals.OTHER
    return CATEGORY_ORDER.map((category) => ({
        category,
        hours: totals[category],
        percent: grand > 0 ? (totals[category] / grand) * 100 : 0,
    }))
}

/**
 * Longest run of consecutive filled hours in a day, ignoring wraparound.
 * Used to detect marathon work blocks without a break.
 */
export function longestRun(hours: HourSlots, category?: CategoryType): number {
    let best = 0
    let run = 0
    for (const hour of hours) {
        const match = hour && (!category || hour.category === category)
        run = match ? run + 1 : 0
        if (run > best) best = run
    }
    return best
}

export function averageOf(values: number[]): number {
    if (values.length === 0) return 0
    return values.reduce((a, b) => a + b, 0) / values.length
}
