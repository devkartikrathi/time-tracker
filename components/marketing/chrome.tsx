import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'

export function Logo({ className }: { className?: string }) {
    return (
        <Link href="/" className={`flex items-center gap-2 font-semibold tracking-tight ${className ?? ''}`}>
            <svg
                viewBox="0 0 24 24"
                className="text-brand size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                aria-hidden
            >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
            </svg>
            Chronos
        </Link>
    )
}

export function MarketingHeader() {
    return (
        <header className="bg-background/95 supports-[backdrop-filter]:bg-background/80 pt-safe sticky top-0 z-40 border-b backdrop-blur">
            <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
                <Logo />
                <nav className="flex items-center gap-1.5">
                    <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                        <Link href="/pricing">Pricing</Link>
                    </Button>
                    <ThemeToggle />
                    <Button asChild variant="ghost" size="sm">
                        <Link href="/sign-in">Log in</Link>
                    </Button>
                    <Button asChild variant="brand" size="sm">
                        <Link href="/sign-up">Sign up</Link>
                    </Button>
                </nav>
            </div>
        </header>
    )
}

export function MarketingFooter() {
    return (
        <footer className="border-t">
            <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
                <Logo />
                <nav className="text-muted-foreground flex flex-wrap gap-x-5 gap-y-2 text-sm">
                    <Link href="/pricing" className="hover:text-foreground">
                        Pricing
                    </Link>
                    <Link href="/privacy" className="hover:text-foreground">
                        Privacy
                    </Link>
                    <Link href="/terms" className="hover:text-foreground">
                        Terms
                    </Link>
                </nav>
                <p className="text-muted-foreground text-xs">
                    © {new Date().getFullYear()} Chronos
                </p>
            </div>
        </footer>
    )
}
