import type { DailyTask } from '@/types'
import { filledHours } from '@/lib/stats'

export interface AchievementDef {
    key: string
    name: string
    description: string
    icon: string
    tier: 'bronze' | 'silver' | 'gold'
}

export const ACHIEVEMENTS: AchievementDef[] = [
    { key: 'first_day', name: 'First Light', description: 'Log your first hour', icon: 'sparkles', tier: 'bronze' },
    { key: 'perfect_day', name: 'Perfect Day', description: 'Log all 24 hours of a single day', icon: 'circle-check-big', tier: 'silver' },
    { key: 'streak_3', name: 'Getting Going', description: 'Log 3 days in a row', icon: 'flame', tier: 'bronze' },
    { key: 'streak_7', name: 'Full Week', description: 'Log 7 days in a row', icon: 'flame', tier: 'silver' },
    { key: 'streak_30', name: 'Monthly Habit', description: 'Log 30 days in a row', icon: 'flame', tier: 'gold' },
    { key: 'streak_100', name: 'Centurion', description: 'Log 100 days in a row', icon: 'trophy', tier: 'gold' },
    { key: 'days_10', name: 'Ten Days In', description: 'Log any 10 days', icon: 'calendar-check', tier: 'bronze' },
    { key: 'days_50', name: 'Half Century', description: 'Log any 50 days', icon: 'calendar-check', tier: 'silver' },
    { key: 'hours_100', name: 'Century of Hours', description: 'Log 100 hours in total', icon: 'hourglass', tier: 'bronze' },
    { key: 'hours_500', name: 'Time Lord', description: 'Log 500 hours in total', icon: 'hourglass', tier: 'gold' },
    { key: 'balanced_week', name: 'In Balance', description: 'A week with rest, work and life all above 10%', icon: 'scale', tier: 'silver' },
    { key: 'early_bird', name: 'Early Bird', description: 'Log an activity at 5am', icon: 'sunrise', tier: 'bronze' },
    { key: 'deep_focus', name: 'Deep Focus', description: 'Six unbroken hours of work', icon: 'target', tier: 'silver' },
    { key: 'mood_week', name: 'Self Aware', description: 'Record your mood 7 days running', icon: 'smile', tier: 'bronze' },
]

export const ACHIEVEMENTS_BY_KEY = new Map(ACHIEVEMENTS.map((a) => [a.key, a]))

export interface AchievementContext {
    tasks: DailyTask[]
    currentStreak: number
    longestStreak: number
}

/**
 * Returns the keys the user now qualifies for. Callers diff this against what
 * is already stored, so this stays a pure function of the data.
 */
export function evaluateAchievements({ tasks, longestStreak }: AchievementContext): string[] {
    const unlocked = new Set<string>()
    const loggedDays = tasks.filter((t) => filledHours(t.hours) > 0)
    const totalHours = loggedDays.reduce((n, t) => n + filledHours(t.hours), 0)

    if (totalHours >= 1) unlocked.add('first_day')
    if (loggedDays.some((t) => filledHours(t.hours) === 24)) unlocked.add('perfect_day')

    if (longestStreak >= 3) unlocked.add('streak_3')
    if (longestStreak >= 7) unlocked.add('streak_7')
    if (longestStreak >= 30) unlocked.add('streak_30')
    if (longestStreak >= 100) unlocked.add('streak_100')

    if (loggedDays.length >= 10) unlocked.add('days_10')
    if (loggedDays.length >= 50) unlocked.add('days_50')

    if (totalHours >= 100) unlocked.add('hours_100')
    if (totalHours >= 500) unlocked.add('hours_500')

    if (loggedDays.some((t) => t.hours[5])) unlocked.add('early_bird')

    // Six consecutive WORK hours in any single day.
    const hasDeepFocus = loggedDays.some((task) => {
        let run = 0
        for (const hour of task.hours) {
            run = hour?.category === 'WORK' ? run + 1 : 0
            if (run >= 6) return true
        }
        return false
    })
    if (hasDeepFocus) unlocked.add('deep_focus')

    // Any 7-day window where all three categories clear 10% of logged time.
    const sorted = [...loggedDays].sort((a, b) => a.date.localeCompare(b.date))
    for (let i = 0; i + 7 <= sorted.length; i++) {
        const window = sorted.slice(i, i + 7)
        const totals = { REST: 0, WORK: 0, OTHER: 0 }
        for (const task of window) {
            for (const hour of task.hours) if (hour) totals[hour.category] += 1
        }
        const sum = totals.REST + totals.WORK + totals.OTHER
        if (sum > 0 && Object.values(totals).every((v) => v / sum >= 0.1)) {
            unlocked.add('balanced_week')
            break
        }
    }

    // Seven consecutive calendar days each carrying a mood rating.
    const moodDates = sorted.filter((t) => t.mood != null).map((t) => t.date)
    let moodRun = 1
    for (let i = 1; i < moodDates.length; i++) {
        const prev = new Date(moodDates[i - 1]!)
        const curr = new Date(moodDates[i]!)
        const gap = (curr.getTime() - prev.getTime()) / 86_400_000
        moodRun = gap === 1 ? moodRun + 1 : 1
        if (moodRun >= 7) {
            unlocked.add('mood_week')
            break
        }
    }

    return Array.from(unlocked)
}
