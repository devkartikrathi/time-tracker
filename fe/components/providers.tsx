'use client'

import { ThemeProvider } from 'next-themes'

/**
 * Global providers — deliberately only the theme.
 *
 * Clerk and React Query are scoped to the authenticated app (see
 * `components/app/app-providers.tsx`). Putting them here would ship both SDKs
 * to the marketing pages, which need neither, and the landing page is the one
 * page whose load time actually costs signups.
 */
export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            {children}
        </ThemeProvider>
    )
}
