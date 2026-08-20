/**
 * AI insight layer — guard tests.
 *
 * These assert the property that matters most: the Insights tab must never
 * depend on the model being reachable. Deliberately hermetic — no network call
 * is made, so the suite stays fast and runs offline. (The bad-key path, which
 * does hit the API and must also degrade to null, is exercised manually.)
 */

import { isAiConfigured, generateAiInsights } from '../lib/ai-insights.js'

let pass = 0
let fail = 0
const eq = (name: string, got: unknown, want: unknown) => {
    const ok = JSON.stringify(got) === JSON.stringify(want)
    ok ? pass++ : fail++
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${ok ? '' : `  got ${JSON.stringify(got)}`}`)
}

const mkDay = (date: string) => ({
    id: date,
    date,
    mood: 4,
    note: null,
    wellBeingTags: [] as never[],
    hours: Array.from({ length: 24 }, (_, h) =>
        h >= 9 && h < 17
            ? { taskName: 'w', category: 'WORK' as const, subcategoryId: 'w' }
            : null
    ),
})

const threeDays = [mkDay('2026-08-18'), mkDay('2026-08-19'), mkDay('2026-08-20')]

delete process.env.GOOGLE_GENERATIVE_AI_API_KEY
eq('not configured without a key', isAiConfigured(), false)
eq(
    'returns null without a key',
    await generateAiInsights({ tasks: threeDays, subcategories: [], currentStreak: 3 }),
    null
)

process.env.GOOGLE_GENERATIVE_AI_API_KEY = 'set-but-unused-in-these-cases'
eq('configured with a key', isAiConfigured(), true)
// Both bail before any network call, so the key value never matters here.
eq(
    'returns null with no tasks',
    await generateAiInsights({ tasks: [], subcategories: [], currentStreak: 0 }),
    null
)
eq(
    'returns null below the three-day floor',
    await generateAiInsights({ tasks: [mkDay('2026-08-20')], subcategories: [], currentStreak: 1 }),
    null
)

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
