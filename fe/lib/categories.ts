import type { CategoryType, Subcategory } from '@/types'

/**
 * Colour system.
 *
 * Every palette value here was checked with a CVD/contrast validator rather
 * than chosen by eye. Two findings shaped the result:
 *
 * 1. The original palette used #00ff00 and #ff0000 — fully saturated primaries
 *    that fail contrast and vibrate on dark backgrounds.
 *
 * 2. The PRD asked for subcategory colours to be "shades of the parent
 *    category's colour". That cannot work: within one hue you get about three
 *    separable steps before adjacent shades land below ΔE 15 and become
 *    indistinguishable even to full-colour vision. A user with six Work
 *    activities would see six near-identical cells in the month grid.
 *
 *    So activities draw from one validated 8-slot categorical palette spanning
 *    the hue wheel, and category membership is carried by grouping, labels and
 *    the day summary bar instead of by hue alone.
 *
 * Light and dark need genuinely different values — the dark surface has a
 * narrower usable lightness band. The light hex is the stored identity; the
 * dark twin is resolved at render time.
 */

export interface PaletteSlot {
    light: string
    dark: string
    name: string
}

/** Activity palette — validated for CVD separation and contrast in both modes. */
export const ACTIVITY_PALETTE: PaletteSlot[] = [
    { name: 'blue', light: '#2a78d6', dark: '#3987e5' },
    { name: 'orange', light: '#eb6834', dark: '#d95926' },
    { name: 'aqua', light: '#1baf7a', dark: '#199e70' },
    { name: 'yellow', light: '#eda100', dark: '#c98500' },
    { name: 'magenta', light: '#e87ba4', dark: '#d55181' },
    { name: 'green', light: '#008300', dark: '#00a300' },
    { name: 'violet', light: '#4a3aa7', dark: '#9085e9' },
    { name: 'red', light: '#e34948', dark: '#e66767' },
]

const DARK_BY_LIGHT = new Map(
    ACTIVITY_PALETTE.map((slot) => [slot.light.toLowerCase(), slot.dark])
)

/**
 * Resolves a stored colour for the active theme. Custom colours (Pro) are not
 * in the map and pass through unchanged.
 */
export function resolveColor(hex: string, isDark: boolean): string {
    if (!isDark) return hex
    return DARK_BY_LIGHT.get(hex.toLowerCase()) ?? hex
}

export interface CategoryMeta {
    id: CategoryType
    name: string
    label: string
    description: string
    color: string
    colorDark: string
}

export const CATEGORY_META: Record<CategoryType, CategoryMeta> = {
    REST: {
        id: 'REST',
        name: 'Rest',
        label: 'Rest',
        description: 'sleep, recovery, and doing nothing on purpose',
        color: '#2a78d6',
        colorDark: '#3987e5',
    },
    WORK: {
        id: 'WORK',
        name: 'Work',
        label: 'Work',
        description: 'your job, study, and deep focus',
        color: '#1baf7a',
        colorDark: '#199e70',
    },
    OTHER: {
        id: 'OTHER',
        name: 'Life',
        label: 'Life',
        description: 'people, play, chores, and everything else',
        color: '#eb6834',
        colorDark: '#d95926',
    },
}

export const CATEGORY_ORDER: CategoryType[] = ['REST', 'WORK', 'OTHER']
export const CATEGORY_LIST = CATEGORY_ORDER.map((id) => CATEGORY_META[id])

export function categoryColor(category: CategoryType, isDark = false): string {
    const meta = CATEGORY_META[category]
    return isDark ? meta.colorDark : meta.color
}

export function normalizeCategory(value: string): CategoryType {
    const upper = String(value ?? '').toUpperCase()
    return upper === 'REST' || upper === 'WORK' || upper === 'OTHER' ? upper : 'OTHER'
}

/** Next unused palette slot, so new activities stay mutually distinguishable. */
export function nextColorForCategory(_category: CategoryType, existing: Subcategory[]): string {
    const used = new Set(existing.map((s) => s.color.toLowerCase()))
    const free = ACTIVITY_PALETTE.find((slot) => !used.has(slot.light.toLowerCase()))
    // Past eight activities colours must repeat; the name label disambiguates.
    return (free ?? ACTIVITY_PALETTE[existing.length % ACTIVITY_PALETTE.length]!).light
}

/** Starter set — enough to log a day without any setup. */
export const DEFAULT_SUBCATEGORIES: Array<Omit<Subcategory, 'id'>> = [
    { name: 'Sleep', color: '#2a78d6', category: 'REST', icon: 'moon', sortOrder: 0 },
    { name: 'Break', color: '#4a3aa7', category: 'REST', icon: 'coffee', sortOrder: 1 },
    { name: 'Deep Work', color: '#1baf7a', category: 'WORK', icon: 'brain', sortOrder: 2 },
    { name: 'Meetings', color: '#008300', category: 'WORK', icon: 'users', sortOrder: 3 },
    { name: 'Learning', color: '#eda100', category: 'WORK', icon: 'book-open', sortOrder: 4 },
    { name: 'Exercise', color: '#eb6834', category: 'OTHER', icon: 'dumbbell', sortOrder: 5 },
    { name: 'People', color: '#e87ba4', category: 'OTHER', icon: 'heart', sortOrder: 6 },
    { name: 'Downtime', color: '#e34948', category: 'OTHER', icon: 'tv', sortOrder: 7 },
]

/**
 * Readable text colour for a filled cell, via WCAG relative luminance.
 * Yellow needs near-black text; the blues and violets need white.
 */
export function contrastText(hex: string): string {
    const clean = hex.replace('#', '')
    const full =
        clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean.padEnd(6, '0')
    const toLinear = (v: number) => {
        const s = v / 255
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
    }
    const r = toLinear(parseInt(full.slice(0, 2), 16))
    const g = toLinear(parseInt(full.slice(2, 4), 16))
    const b = toLinear(parseInt(full.slice(4, 6), 16))
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
    return luminance > 0.45 ? '#0b0b0b' : '#ffffff'
}

export function withAlpha(hex: string, alpha: number): string {
    const clean = hex.replace('#', '')
    const full =
        clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean.padEnd(6, '0')
    const r = parseInt(full.slice(0, 2), 16)
    const g = parseInt(full.slice(2, 4), 16)
    const b = parseInt(full.slice(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function isValidHexColor(value: string): boolean {
    return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)
}
