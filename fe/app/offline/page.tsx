import { WifiOff } from 'lucide-react'
import { Logo } from '@/components/marketing/chrome'

export const metadata = { title: 'Offline' }

export default function OfflinePage() {
    return (
        <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
            <Logo />
            <WifiOff className="text-muted-foreground size-8" />
            <h1 className="text-xl font-semibold">You are offline</h1>
            <p className="text-muted-foreground max-w-sm text-sm">
                Chronos needs a connection to load this page. Anything you already logged is safe,
                and pages you have visited before still open.
            </p>
        </div>
    )
}
