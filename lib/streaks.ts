import { addDayKey, todayKey, type DayKey } from '@/lib/date'

/**
 * A day counts toward a streak once it has any logged hour. Requiring a fully
 * logged day would make the streak too easy to break, and a broken streak is
 * the single most common reason people abandon a habit tracker.
 */
export const MIN_HOURS_FOR_STREAK = 1

export interface StreakState {
    current: number
    longest: number
    lastLoggedDate: DayKey | null
    /** True when logging today would extend rather than restart the streak. */
    atRisk: boolean
}

/**
 * Recomputes streaks from the set of days that have any logged hours.
 *
 * Today not being logged yet does not break the streak — the day is still in
 * progress. The streak only breaks once a full day has been skipped.
 */
export function computeStreak(loggedDates: Iterable<DayKey>, today: DayKey = todayKey()): StreakState {
    const dates = Array.from(new Set(loggedDates)).filter((d) => d <= today).sort()

    if (dates.length === 0) {
        return { current: 0, longest: 0, lastLoggedDate: null, atRisk: false }
    }

    // Longest run anywhere in history.
    let longest = 1
    let run = 1
    for (let i = 1; i < dates.length; i++) {
        if (dates[i] === addDayKey(dates[i - 1]!, 1)) {
            run += 1
        } else {
            run = 1
        }
        if (run > longest) longest = run
    }

    const lastLoggedDate = dates[dates.length - 1]!
    const yesterday = addDayKey(today, -1)

    // Anchor on today if logged, otherwise yesterday. Anything older means the
    // streak has already lapsed.
    let anchor: DayKey
    if (lastLoggedDate === today) {
        anchor = today
    } else if (lastLoggedDate === yesterday) {
        anchor = yesterday
    } else {
        return { current: 0, longest, lastLoggedDate, atRisk: false }
    }

    const set = new Set(dates)
    let current = 0
    let cursor = anchor
    while (set.has(cursor)) {
        current += 1
        cursor = addDayKey(cursor, -1)
    }

    return {
        current,
        longest: Math.max(longest, current),
        lastLoggedDate,
        // Streak alive but today still blank — one missed day ends it.
        atRisk: lastLoggedDate === yesterday,
    }
}

/** Copy for the streak pill. */
export function streakLabel(state: StreakState): string {
    if (state.current === 0) return 'Start a streak'
    if (state.atRisk) return `${state.current} day streak at risk`
    return `${state.current} day streak`
}
