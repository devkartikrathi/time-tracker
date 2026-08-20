export type CategoryType = 'REST' | 'WORK' | 'OTHER'
export type Plan = 'FREE' | 'PRO'
export type GoalPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY'

export const WELL_BEING_TAGS = [
    'Physical',
    'Mental',
    'Social',
    'Spiritual',
    'Growth',
    'Family',
    'Mission',
    'Money',
    'Romance',
    'Friends',
    'Joy',
] as const

export type WellBeingTag = (typeof WELL_BEING_TAGS)[number]

/** A single filled hour slot. Stored inside DailyTask.hours. */
export interface HourData {
    taskName: string
    category: CategoryType
    subcategoryId: string
    /** Denormalised for rendering so the grid does not need a join per cell. */
    subcategory?: Subcategory
}

/** 24 slots, index 0 = midnight. `null` means the hour is unlogged. */
export type HourSlots = (HourData | null)[]

export interface DailyTask {
    id: string
    /** YYYY-MM-DD in the user's local timezone. */
    date: string
    wellBeingTags: WellBeingTag[]
    hours: HourSlots
    mood: number | null
    note: string | null
}

export interface Subcategory {
    id: string
    name: string
    color: string
    icon?: string | null
    category: CategoryType
    sortOrder?: number
    isArchived?: boolean
}

export interface Category {
    id: CategoryType
    name: string
    label: string
    color: string
    subcategories: Subcategory[]
}

export interface Goal {
    id: string
    name: string
    targetHours: number
    period: GoalPeriod
    category: CategoryType
    subcategoryId: string
    isActive: boolean
}

export interface UserProfile {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
    occupation: string | null
    age: number | null
    focus: string | null
    plan: Plan
    timezone: string
    weekStartsOn: number
    currentStreak: number
    longestStreak: number
    lastLoggedDate: string | null
    reminderHour: number | null
    onboardingCompleted: boolean
}

export interface Achievement {
    key: string
    unlockedAt: string
}

export type InsightSeverity = 'positive' | 'neutral' | 'warning'

export interface Insight {
    id: string
    title: string
    body: string
    severity: InsightSeverity
    icon: string
    /** Sort weight — higher surfaces first. */
    priority: number
}
