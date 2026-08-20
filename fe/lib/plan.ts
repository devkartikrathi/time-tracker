import type { Plan } from '@/types'

/**
 * Free/Pro limits. Enforced server-side in the API routes; the UI reads the
 * same numbers so the two never drift apart.
 */
export interface PlanLimits {
    /** Days of history readable. Infinity for unlimited. */
    historyDays: number
    maxSubcategories: number
    maxGoals: number
    aiInsights: boolean
    export: boolean
    customColors: boolean
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
    FREE: {
        historyDays: 90,
        maxSubcategories: 8,
        maxGoals: 3,
        aiInsights: false,
        export: false,
        customColors: false,
    },
    PRO: {
        historyDays: Number.POSITIVE_INFINITY,
        maxSubcategories: 50,
        maxGoals: 30,
        aiInsights: true,
        export: true,
        customColors: true,
    },
}

export function limitsFor(plan: Plan): PlanLimits {
    return PLAN_LIMITS[plan] ?? PLAN_LIMITS.FREE
}

export const PRO_PRICE_MONTHLY = 4
export const PRO_PRICE_YEARLY = 36
