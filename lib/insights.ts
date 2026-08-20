import type { CategoryType, DailyTask, Goal, Insight, Subcategory, WellBeingTag } from '@/types'
import { CATEGORY_META } from '@/lib/categories'
import { friendlyDate, lastNDays, type DayKey } from '@/lib/date'
import {
    averageOf,
    filledHours,
    goalProgress,
    hoursBySubcategory,
    longestRun,
    totalsForDay,
    totalsForRange,
} from '@/lib/stats'
import { WELL_BEING_TAGS } from '@/types'

export interface InsightInput {
    tasks: DailyTask[]
    subcategories: Subcategory[]
    goals: Goal[]
    today: DayKey
    currentStreak: number
}

const hoursWord = (n: number) => `${Number.isInteger(n) ? n : n.toFixed(1)} ${n === 1 ? 'hour' : 'hours'}`

/**
 * Deterministic insight engine.
 *
 * Every rule is a plain function of the logged data, so insights are instant,
 * free, work offline, and never hallucinate a number. The optional LLM layer
 * (lib/ai-insights.ts) writes narrative on top of these, but the app never
 * depends on it being available.
 */
export function generateInsights(input: InsightInput): Insight[] {
    const { tasks, subcategories, goals, today, currentStreak } = input
    const insights: Insight[] = []

    const logged = tasks.filter((t) => filledHours(t.hours) > 0)
    if (logged.length === 0) {
        return [
            {
                id: 'empty',
                title: 'Log your first day',
                body: 'Tap any hour on the grid to record what you were doing. Once you have a few days in, this tab fills up with patterns from your own data.',
                severity: 'neutral',
                icon: 'sparkles',
                priority: 100,
            },
        ]
    }

    const last7 = new Set(lastNDays(7))
    const last14 = new Set(lastNDays(14))
    const week = logged.filter((t) => last7.has(t.date))
    const prevWeek = logged.filter((t) => last14.has(t.date) && !last7.has(t.date))
    const byId = new Map(subcategories.map((s) => [s.id, s]))

    // --- Streak ---------------------------------------------------------
    if (currentStreak >= 3) {
        insights.push({
            id: 'streak',
            title: `${currentStreak} days in a row`,
            body: `You have logged every day for ${currentStreak} days. Consistency is what turns this from a novelty into something that actually tells you about your life.`,
            severity: 'positive',
            icon: 'flame',
            priority: 70,
        })
    }

    // --- Sleep ----------------------------------------------------------
    const sleepSub = subcategories.find((s) => /sleep/i.test(s.name))
    if (sleepSub && week.length >= 3) {
        const nightly = week.map(
            (t) => t.hours.filter((h) => h?.subcategoryId === sleepSub.id).length
        )
        const avg = averageOf(nightly)
        const spread = Math.max(...nightly) - Math.min(...nightly)

        if (avg > 0 && avg < 6.5) {
            insights.push({
                id: 'sleep-low',
                title: `Averaging ${avg.toFixed(1)}h of sleep`,
                body: `Across your last ${week.length} logged days you slept ${avg.toFixed(1)} hours a night. Short sleep tends to show up as lower focus a day or two later, not the same day — worth watching alongside your work hours.`,
                severity: 'warning',
                icon: 'moon',
                priority: 88,
            })
        } else if (avg >= 7) {
            insights.push({
                id: 'sleep-good',
                title: `Sleep is holding at ${avg.toFixed(1)}h`,
                body: `You are averaging ${avg.toFixed(1)} hours a night this week. That is a solid base — most of the other patterns here get easier when this one is steady.`,
                severity: 'positive',
                icon: 'moon',
                priority: 40,
            })
        }

        if (spread >= 4 && week.length >= 4) {
            insights.push({
                id: 'sleep-irregular',
                title: 'Your sleep is uneven',
                body: `Your shortest and longest nights this week differ by ${spread} hours. Irregular timing is usually harder on energy than simply sleeping less, so evening out the schedule may pay off more than adding an hour.`,
                severity: 'warning',
                icon: 'activity',
                priority: 72,
            })
        }
    }

    // --- Long unbroken work runs ---------------------------------------
    const marathon = logged
        .map((t) => ({ date: t.date, run: longestRun(t.hours, 'WORK') }))
        .filter((d) => d.run >= 6)
        .sort((a, b) => b.run - a.run)[0]

    if (marathon) {
        insights.push({
            id: 'marathon',
            title: `${marathon.run} unbroken hours of work`,
            body: `On ${friendlyDate(marathon.date)} you logged ${marathon.run} consecutive work hours with no break in between. Attention reliably degrades past about 90 minutes — a short break roughly every two hours usually gets more done, not less.`,
            severity: 'warning',
            icon: 'timer',
            priority: 85,
        })
    }

    // --- Balance --------------------------------------------------------
    const weekTotals = totalsForRange(week)
    const weekSum = weekTotals.REST + weekTotals.WORK + weekTotals.OTHER
    if (weekSum >= 20) {
        const shares = (Object.entries(weekTotals) as Array<[CategoryType, number]>).map(
            ([category, hours]) => ({ category, share: hours / weekSum })
        )
        const starved = shares.find((s) => s.share < 0.08)
        const dominant = shares.find((s) => s.share > 0.62)

        if (starved) {
            const meta = CATEGORY_META[starved.category]
            insights.push({
                id: `starved-${starved.category}`,
                title: `${meta.label} is down to ${Math.round(starved.share * 100)}%`,
                body: `${meta.label} accounted for only ${Math.round(starved.share * 100)}% of your logged time this week. ${meta.description}. A week or two like this is normal; a month of it usually is not.`,
                severity: 'warning',
                icon: 'scale',
                priority: 80,
            })
        }

        if (dominant) {
            const meta = CATEGORY_META[dominant.category]
            insights.push({
                id: `dominant-${dominant.category}`,
                title: `${meta.label} is taking ${Math.round(dominant.share * 100)}% of your time`,
                body: `Most of your logged week went to ${meta.label.toLowerCase()}. If that is deliberate, good — this is just here so it is a choice rather than a drift.`,
                severity: 'neutral',
                icon: 'chart-pie',
                priority: 60,
            })
        }
    }

    // --- Week over week -------------------------------------------------
    if (prevWeek.length >= 3 && week.length >= 3) {
        const now = totalsForRange(week)
        const before = totalsForRange(prevWeek)
        for (const category of ['REST', 'WORK', 'OTHER'] as CategoryType[]) {
            const delta = now[category] - before[category]
            if (Math.abs(delta) >= 6) {
                const meta = CATEGORY_META[category]
                insights.push({
                    id: `trend-${category}`,
                    title: `${meta.label} ${delta > 0 ? 'up' : 'down'} ${Math.abs(delta)}h this week`,
                    body: `You logged ${hoursWord(now[category])} of ${meta.label.toLowerCase()} this week versus ${hoursWord(before[category])} the week before.`,
                    severity: delta > 0 && category !== 'REST' ? 'neutral' : 'neutral',
                    icon: delta > 0 ? 'trending-up' : 'trending-down',
                    priority: 55,
                })
            }
        }
    }

    // --- Mood correlation ----------------------------------------------
    // The most genuinely useful thing this dataset can produce: which category
    // of time actually tracks with the user rating their day highly.
    const rated = logged.filter((t) => t.mood != null)
    if (rated.length >= 8) {
        const best = bestMoodCorrelation(rated)
        if (best) {
            const meta = CATEGORY_META[best.category]
            insights.push({
                id: 'mood-correlation',
                title: `Your best days have more ${meta.label.toLowerCase()}`,
                body: `On days you rated ${best.goodMood.toFixed(1)}/5 or better you averaged ${hoursWord(best.goodHours)} of ${meta.label.toLowerCase()}, against ${hoursWord(best.badHours)} on lower-rated days. Based on ${rated.length} rated days — a pattern, not proof of cause.`,
                severity: 'positive',
                icon: 'heart',
                priority: 92,
            })
        }
    } else if (rated.length > 0 && rated.length < 8) {
        insights.push({
            id: 'mood-more',
            title: 'Rate a few more days',
            body: `You have rated ${rated.length} ${rated.length === 1 ? 'day' : 'days'}. At eight, this tab starts showing which kinds of time actually track with your better days.`,
            severity: 'neutral',
            icon: 'smile',
            priority: 50,
        })
    }

    // --- Peak hour ------------------------------------------------------
    const workByHour = Array.from({ length: 24 }, () => 0)
    for (const task of logged) {
        task.hours.forEach((h, i) => {
            if (h?.category === 'WORK') workByHour[i]! += 1
        })
    }
    const peak = workByHour.indexOf(Math.max(...workByHour))
    if (Math.max(...workByHour) >= 4) {
        const label = peak === 0 ? '12am' : peak < 12 ? `${peak}am` : peak === 12 ? '12pm' : `${peak - 12}pm`
        insights.push({
            id: 'peak-hour',
            title: `${label} is your most worked hour`,
            body: `Across your history, ${label} is when you most often log work. Protecting that hour from meetings is usually the cheapest scheduling win available.`,
            severity: 'neutral',
            icon: 'sunrise',
            priority: 45,
        })
    }

    // --- Neglected well-being dimension ---------------------------------
    const recentTags = new Set<WellBeingTag>()
    for (const task of week) for (const tag of task.wellBeingTags ?? []) recentTags.add(tag)
    if (week.length >= 5) {
        const missing = WELL_BEING_TAGS.filter((t) => !recentTags.has(t))
        if (missing.length > 0 && recentTags.size > 0) {
            insights.push({
                id: 'wellbeing-gap',
                title: `No ${missing[0]} time logged this week`,
                body: `You tagged ${Array.from(recentTags).slice(0, 3).join(', ')} this week but nothing for ${missing.slice(0, 3).join(', ')}. The wheel on the Analytics tab shows the full shape.`,
                severity: 'neutral',
                icon: 'compass',
                priority: 48,
            })
        }
    }

    // --- Goal pace ------------------------------------------------------
    for (const goal of goals.filter((g) => g.isActive)) {
        const progress = goalProgress(goal, logged, today)
        if (progress.target <= 0) continue
        const sub = byId.get(goal.subcategoryId)

        if (progress.met) {
            insights.push({
                id: `goal-met-${goal.id}`,
                title: `${goal.name} hit`,
                body: `${hoursWord(progress.logged)} logged against a target of ${hoursWord(progress.target)}.`,
                severity: 'positive',
                icon: 'circle-check-big',
                priority: 65,
            })
        } else if (progress.percent < 40 && progress.periodDays > 1) {
            const remaining = progress.target - progress.logged
            insights.push({
                id: `goal-behind-${goal.id}`,
                title: `${goal.name} is behind`,
                body: `${hoursWord(progress.logged)} of ${hoursWord(progress.target)} so far. You need ${hoursWord(remaining)} more of ${sub?.name ?? 'this activity'} to land it this ${goal.period === 'WEEKLY' ? 'week' : 'month'}.`,
                severity: 'warning',
                icon: 'target',
                priority: 78,
            })
        }
    }

    // --- Coverage -------------------------------------------------------
    const avgFilled = averageOf(week.map((t) => filledHours(t.hours)))
    if (week.length >= 3 && avgFilled < 12) {
        insights.push({
            id: 'coverage',
            title: `${Math.round(avgFilled)} of 24 hours logged per day`,
            body: `You are filling about ${Math.round(avgFilled)} hours a day. The gaps are where the surprises usually hide — try filling one full day end to end and see what it looks like.`,
            severity: 'neutral',
            icon: 'grid-3x3',
            priority: 58,
        })
    }

    // --- Top activity ---------------------------------------------------
    const totals = hoursBySubcategory(week)
    const top = Array.from(totals.entries()).sort((a, b) => b[1] - a[1])[0]
    if (top && top[1] >= 5) {
        const sub = byId.get(top[0])
        if (sub) {
            insights.push({
                id: 'top-activity',
                title: `${sub.name} led your week`,
                body: `${hoursWord(top[1])} across ${week.length} logged days — your single biggest use of time.`,
                severity: 'neutral',
                icon: 'chart-column',
                priority: 42,
            })
        }
    }

    return insights.sort((a, b) => b.priority - a.priority)
}

/** Category whose hours differ most between well-rated and poorly-rated days. */
function bestMoodCorrelation(rated: DailyTask[]) {
    const sorted = [...rated].sort((a, b) => (b.mood ?? 0) - (a.mood ?? 0))
    const half = Math.floor(sorted.length / 2)
    const good = sorted.slice(0, half)
    const bad = sorted.slice(-half)
    if (good.length === 0 || bad.length === 0) return null

    let winner: { category: CategoryType; goodHours: number; badHours: number; goodMood: number } | null = null
    let bestDelta = 0

    for (const category of ['REST', 'WORK', 'OTHER'] as CategoryType[]) {
        const goodHours = averageOf(good.map((t) => totalsForDay(t)[category]))
        const badHours = averageOf(bad.map((t) => totalsForDay(t)[category]))
        const delta = goodHours - badHours
        if (delta > bestDelta && delta >= 1) {
            bestDelta = delta
            winner = {
                category,
                goodHours,
                badHours,
                goodMood: averageOf(good.map((t) => t.mood ?? 0)),
            }
        }
    }
    return winner
}
