import { requireUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { handleRouteError, ok, rateLimit } from '@/lib/api-response'
import { generateInsights } from '@/lib/insights'
import { aiPayloadToInsights, generateAiInsights, isAiConfigured } from '@/lib/ai-insights'
import { limitsFor } from '@/lib/plan'
import { addDayKey, todayKey } from '@/lib/date'
import type { DailyTask, HourSlots, Subcategory } from '@/types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
// The LLM path can take a few seconds; the heuristic path returns immediately.
export const maxDuration = 30

export async function GET(req: Request) {
    try {
        const user = await requireUser()
        const url = new URL(req.url)
        const wantsAi = url.searchParams.get('ai') === '1'

        const since = addDayKey(todayKey(), -60)
        const [rows, subcategories, goals] = await Promise.all([
            prisma.dailyTask.findMany({
                where: { userId: user.id, date: { gte: since } },
                orderBy: { date: 'asc' },
            }),
            prisma.subcategory.findMany({ where: { userId: user.id } }),
            prisma.goal.findMany({ where: { userId: user.id, isActive: true } }),
        ])

        const tasks: DailyTask[] = rows.map((row) => ({
            id: row.id,
            date: row.date,
            hours: (row.hours as HourSlots) ?? [],
            wellBeingTags: (row.wellBeingTags ?? []) as DailyTask['wellBeingTags'],
            mood: row.mood,
            note: row.note,
        }))

        const insights = generateInsights({
            tasks,
            subcategories: subcategories as unknown as Subcategory[],
            goals: goals as never,
            today: todayKey(),
            currentStreak: user.currentStreak,
        })

        const limits = limitsFor(user.plan)
        const aiAvailable = isAiConfigured() && limits.aiInsights

        // The narrative layer is Pro-gated and rate limited — it is the only
        // part of this route that costs money per call.
        if (wantsAi && aiAvailable && rateLimit(`insights-ai:${user.id}`, 10, 3_600_000)) {
            const payload = await generateAiInsights({
                tasks,
                subcategories: subcategories as unknown as Subcategory[],
                occupation: user.occupation,
                focus: user.focus,
                currentStreak: user.currentStreak,
            })

            if (payload) {
                return ok({
                    insights: [...aiPayloadToInsights(payload), ...insights],
                    headline: payload.headline,
                    suggestion: payload.suggestion,
                    aiAvailable,
                    aiUsed: true,
                })
            }
        }

        return ok({ insights, aiAvailable, aiUsed: false })
    } catch (error) {
        return handleRouteError(error, 'GET /api/insights')
    }
}
