import { prisma } from '@/lib/prisma'
import { computeStreak } from '@/lib/streaks'
import { evaluateAchievements } from '@/lib/achievements'
import { filledHours } from '@/lib/stats'
import type { DailyTask, HourSlots } from '@/types'

export interface ProgressUpdate {
    currentStreak: number
    longestStreak: number
    newAchievements: string[]
}

/**
 * Recomputes streak state and unlocks any newly-earned achievements after a
 * day is written.
 *
 * Reads only `date`, `hours` and `mood` — enough for every rule — so this stays
 * a single narrow query even for users with years of history.
 */
export async function refreshProgress(userId: string): Promise<ProgressUpdate> {
    const rows = await prisma.dailyTask.findMany({
        where: { userId },
        select: { date: true, hours: true, mood: true, wellBeingTags: true },
        orderBy: { date: 'asc' },
    })

    const tasks: DailyTask[] = rows.map((row) => ({
        id: row.date,
        date: row.date,
        hours: (row.hours as HourSlots) ?? [],
        mood: row.mood,
        note: null,
        wellBeingTags: (row.wellBeingTags ?? []) as DailyTask['wellBeingTags'],
    }))

    const loggedDates = tasks.filter((t) => filledHours(t.hours) > 0).map((t) => t.date)
    const streak = computeStreak(loggedDates)

    const earned = evaluateAchievements({
        tasks,
        currentStreak: streak.current,
        longestStreak: streak.longest,
    })

    const existing = await prisma.achievement.findMany({
        where: { userId },
        select: { key: true },
    })
    const existingKeys = new Set(existing.map((a) => a.key))
    const newAchievements = earned.filter((key) => !existingKeys.has(key))

    await Promise.all([
        prisma.user.update({
            where: { id: userId },
            data: {
                currentStreak: streak.current,
                longestStreak: streak.longest,
                lastLoggedDate: streak.lastLoggedDate,
            },
        }),
        newAchievements.length > 0
            ? prisma.achievement.createMany({
                  data: newAchievements.map((key) => ({ userId, key })),
                  skipDuplicates: true,
              })
            : Promise.resolve(),
    ])

    return {
        currentStreak: streak.current,
        longestStreak: streak.longest,
        newAchievements,
    }
}
