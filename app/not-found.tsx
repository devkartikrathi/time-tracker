import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/marketing/chrome'

export default function NotFound() {
    return (
        <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
            <Logo />
            <h1 className="text-xl font-semibold">That page does not exist</h1>
            <p className="text-muted-foreground max-w-sm text-sm">
                The link may be old, or the page may have moved.
            </p>
            <Button asChild variant="brand">
                <Link href="/">Back to the start</Link>
            </Button>
        </div>
    )
}
