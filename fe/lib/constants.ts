// Fixed categories - these are the only 3 categories in the app
export const CATEGORIES = {
    REST: {
        id: 'REST' as const,
        name: 'REST',
        color: '#9ca3af'
    },
    WORK: {
        id: 'WORK' as const,
        name: 'WORK',
        color: '#00ff00'
    },
    OTHER: {
        id: 'OTHER' as const,
        name: 'OTHER',
        color: '#ff0000'
    }
} as const

export const CATEGORY_LIST = Object.values(CATEGORIES)

export type CategoryId = keyof typeof CATEGORIES
export type Category = typeof CATEGORIES[CategoryId]

// Helper to convert frontend category ID to database enum
export function getCategoryEnum(categoryId: string): 'REST' | 'WORK' | 'OTHER' {
    switch (categoryId.toLowerCase()) {
        case 'rest': return 'REST'
        case 'work': return 'WORK'
        case 'other': return 'OTHER'
        default: return 'OTHER'
    }
}
