import { anthropic } from '@ai-sdk/anthropic'
import { generateObject } from 'ai'
import { z } from 'zod'
import type { DailyTask, Insight, Subcategory } from '@/types'
import { CATEGORY_META } from '@/lib/categories'
import { breakdownBySubcategory, filledHours, totalsForRange } from '@/lib/stats'
import { lastNDays } from '@/lib/date'

/**
 * Optional narrative layer over the deterministic engine in lib/insights.ts.
 *
 * The app never depends on this: if no API key is configured, or the call
 * fails, callers fall back to the heuristic insights, which are always
 * available. Nothing here invents numbers — the model is given a compact,
 * pre-aggregated summary and asked to interpret it.
 */

export function isAiConfigured(): boolean {
    return Boolean(process.env.ANTHROPIC_API_KEY)
}

const aiInsightSchema = z.object({
    headline: z
        .string()
        .describe('One sentence, under 90 characters, naming the single most important pattern.'),
    insights: z
        .array(
            z.object({
                title: z.string().describe('Short, specific title under 60 characters.'),
                body: z
                    .string()
                    .describe('Two or three sentences. Reference the actual numbers provided.'),
                severity: z.enum(['positive', 'neutral', 'warning']),
            })
        )
        .min(2)
        .max(4),
    suggestion: z
        .string()
        .describe('One concrete, small experiment the person could run next week.'),
})

export type AiInsightPayload = z.infer<typeof aiInsightSchema>

interface AiInsightInput {
    tasks: DailyTask[]
    subcategories: Subcategory[]
    occupation?: string | null
    focus?: string | null
    currentStreak: number
}

/**
 * Compact, numeric summary of the user's recent weeks.
 *
 * Deliberately not the raw day rows: sending 30 days of 24-slot arrays would
 * be a large, mostly redundant prompt, and the model reasons better over
 * aggregates than over a wall of JSON.
 */
function buildSummary({ tasks, subcategories, currentStreak }: AiInsightInput) {
    const last14 = new Set(lastNDays(14))
    const recent = tasks.filter((t) => last14.has(t.date) && filledHours(t.hours) > 0)
    const totals = totalsForRange(recent)
    const breakdown = breakdownBySubcategory(recent, subcategories).slice(0, 8)

    const perDay = recent.map((task) => ({
        date: task.date,
        loggedHours: filledHours(task.hours),
        mood: task.mood,
        tags: task.wellBeingTags,
    }))

    return {
        daysLogged: recent.length,
        streak: currentStreak,
        categoryHours: {
            rest: totals.REST,
            work: totals.WORK,
            life: totals.OTHER,
        },
        topActivities: breakdown.map((b) => ({
            name: b.name,
            hours: b.hours,
            percentOfLogged: Math.round(b.percent),
        })),
        days: perDay,
    }
}

export async function generateAiInsights(input: AiInsightInput): Promise<AiInsightPayload | null> {
    if (!isAiConfigured()) return null
    if (input.tasks.length === 0) return null

    const summary = buildSummary(input)
    if (summary.daysLogged < 3) return null

    try {
        const { object } = await generateObject({
            model: anthropic('claude-opus-5'),
            schema: aiInsightSchema,
            maxRetries: 1,
            system: [
                'You analyse personal time-tracking data and write short, grounded observations.',
                '',
                'Rules:',
                '- Only state numbers that appear in the data you are given. Never estimate or invent one.',
                '- Time is logged in whole hours across three categories: Rest, Work and Life.',
                '- Say "your data shows" rather than making causal claims. Correlation is not cause.',
                '- Be direct and specific. No pep talk, no exclamation marks, no emoji.',
                '- If the data is too thin to support a claim, say so instead of reaching.',
                '- Never give medical, psychiatric or clinical advice. If the data suggests real',
                '  distress, suggest talking to someone qualified rather than diagnosing.',
            ].join('\n'),
            prompt: [
                input.occupation ? `The person describes their work as: ${input.occupation}.` : '',
                input.focus ? `They said they want to focus on: ${input.focus}.` : '',
                '',
                'Here is a summary of their last 14 logged days:',
                JSON.stringify(summary, null, 2),
                '',
                `Category meanings: Rest = ${CATEGORY_META.REST.description}. Work = ${CATEGORY_META.WORK.description}. Life = ${CATEGORY_META.OTHER.description}.`,
                '',
                'Write the headline, 2-4 insights, and one small experiment they could try.',
            ]
                .filter(Boolean)
                .join('\n'),
        })

        return object
    } catch (error) {
        // A model or network failure must never break the Insights tab — the
        // caller renders the deterministic insights instead.
        console.error('AI insight generation failed:', error)
        return null
    }
}

/** Maps the model's output into the same shape the heuristic engine returns. */
export function aiPayloadToInsights(payload: AiInsightPayload): Insight[] {
    return payload.insights.map((insight, index) => ({
        id: `ai-${index}`,
        title: insight.title,
        body: insight.body,
        severity: insight.severity,
        icon: 'sparkles',
        priority: 1000 - index,
    }))
}
