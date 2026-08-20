'use client'

import { useTheme } from 'next-themes'
import { categoryColor, resolveColor } from '@/lib/categories'
import { useIsClient } from '@/hooks/use-is-client'
import type { CategoryType } from '@/types'

/**
 * Theme-aware colour resolution for charts and the grid.
 *
 * Light and dark need different palette values — the dark surface has a
 * narrower usable lightness band, and several light-mode hues drop below 3:1
 * contrast against it. Stored colours are the light-mode identity; this maps
 * them to their dark twin when needed.
 */
export function useChartTheme() {
    const { resolvedTheme } = useTheme()
    const mounted = useIsClient()

    // Before hydration the theme is unknown; assuming light avoids a flash of
    // wrong-mode colours on the server-rendered pass.
    const isDark = mounted && resolvedTheme === 'dark'

    return {
        isDark,
        mounted,
        color: (hex: string) => resolveColor(hex, isDark),
        category: (category: CategoryType) => categoryColor(category, isDark),
        /** Recessive chrome for axes and gridlines, per the surface in use. */
        grid: isDark ? '#2c2c2a' : '#e1e0d9',
        axis: isDark ? '#383835' : '#c3c2b7',
        muted: '#898781',
        text: isDark ? '#ffffff' : '#0b0b0b',
        surface: isDark ? '#1a1a19' : '#fcfcfb',
    }
}
