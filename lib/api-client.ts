import type {
    Achievement,
    DailyTask,
    Goal,
    Insight,
    Subcategory,
    UserProfile,
} from '@/types'
import type { PlanLimits } from '@/lib/plan'

export class ApiError extends Error {
    status: number
    upgradeRequired: boolean
    fields?: Record<string, string>

    constructor(message: string, status: number, extra?: Record<string, unknown>) {
        super(message)
        this.name = 'ApiError'
        this.status = status
        this.upgradeRequired = Boolean(extra?.upgradeRequired)
        this.fields = extra?.fields as Record<string, string> | undefined
    }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(path, {
        ...init,
        headers: {
            ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
            ...init?.headers,
        },
    })

    const payload = await res.json().catch(() => ({}))

    if (!res.ok) {
        throw new ApiError(payload.error ?? 'Something went wrong', res.status, payload)
    }

    return payload.data as T
}

export interface UserBundle {
    user: UserProfile
    limits: PlanLimits
    achievements: Achievement[]
}

export interface SaveDayResult {
    dailyTask: DailyTask
    progress: {
        currentStreak: number
        longestStreak: number
        newAchievements: string[]
    }
}

export interface InsightsResult {
    insights: Insight[]
    headline?: string
    suggestion?: string
    aiAvailable: boolean
    aiUsed: boolean
}

export const api = {
    getUser: () => request<UserBundle>('/api/user'),

    updateUser: (body: Record<string, unknown>) =>
        request<Partial<UserProfile>>('/api/user', { method: 'PATCH', body: JSON.stringify(body) }),

    getDays: (params: { startDate?: string; endDate?: string; date?: string }) => {
        const search = new URLSearchParams(
            Object.entries(params).filter(([, v]) => Boolean(v)) as [string, string][]
        )
        return request<DailyTask[]>(`/api/daily-tasks?${search}`)
    },

    saveDay: (body: {
        date: string
        hours: DailyTask['hours']
        wellBeingTags?: string[]
        mood?: number | null
        note?: string | null
    }) => request<SaveDayResult>('/api/daily-tasks', { method: 'PUT', body: JSON.stringify(body) }),

    deleteDay: (date: string) =>
        request<{ deleted: boolean }>(`/api/daily-tasks?date=${date}`, { method: 'DELETE' }),

    getSubcategories: () => request<Subcategory[]>('/api/subcategories'),

    createSubcategory: (body: Omit<Subcategory, 'id'>) =>
        request<Subcategory>('/api/subcategories', { method: 'POST', body: JSON.stringify(body) }),

    updateSubcategory: (id: string, body: Partial<Subcategory>) =>
        request<Subcategory>(`/api/subcategories/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(body),
        }),

    deleteSubcategory: (id: string) =>
        request<Subcategory>(`/api/subcategories/${id}`, { method: 'DELETE' }),

    getGoals: () => request<Goal[]>('/api/goals'),

    createGoal: (body: Omit<Goal, 'id' | 'isActive'>) =>
        request<Goal>('/api/goals', { method: 'POST', body: JSON.stringify(body) }),

    updateGoal: (id: string, body: Partial<Goal>) =>
        request<Goal>(`/api/goals/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

    deleteGoal: (id: string) =>
        request<{ deleted: boolean }>(`/api/goals/${id}`, { method: 'DELETE' }),

    getInsights: (useAi = false) =>
        request<InsightsResult>(`/api/insights${useAi ? '?ai=1' : ''}`),

    completeOnboarding: (body: Record<string, unknown>) =>
        request<{ onboardingCompleted: boolean }>('/api/onboarding', {
            method: 'POST',
            body: JSON.stringify(body),
        }),

    subscribePush: (subscription: PushSubscriptionJSON) =>
        request<{ id: string }>('/api/push/subscribe', {
            method: 'POST',
            body: JSON.stringify(subscription),
        }),

    unsubscribePush: (endpoint: string) =>
        request<{ deleted: boolean }>(
            `/api/push/subscribe?endpoint=${encodeURIComponent(endpoint)}`,
            { method: 'DELETE' }
        ),
}
