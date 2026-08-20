'use client'

import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useIsClient } from '@/hooks/use-is-client'

/**
 * Lives in its own module rather than beside the app header: the marketing
 * pages use it too, and importing it from a file that also pulls in Clerk's
 * UserButton would drag the whole auth SDK onto the landing page.
 */
export function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme()
    // The server cannot know the user's theme, so the icon only renders once
    // hydrated — otherwise it mismatches on the server pass.
    const mounted = useIsClient()

    return (
        <Button
            variant="ghost"
            size="icon-sm"
            aria-label={
                mounted
                    ? `Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`
                    : 'Toggle theme'
            }
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
        >
            {mounted && resolvedTheme === 'dark' ? (
                <Sun className="size-4" />
            ) : (
                <Moon className="size-4" />
            )}
        </Button>
    )
}
