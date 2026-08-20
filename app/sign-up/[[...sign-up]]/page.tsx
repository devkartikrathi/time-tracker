import { SignUp } from '@clerk/nextjs'
import type { Metadata } from 'next'
import { Logo } from '@/components/marketing/chrome'

export const metadata: Metadata = { title: 'Sign up' }

export default function SignUpPage() {
    return (
        <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-10">
            <Logo />
            <SignUp
                appearance={{
                    elements: {
                        rootBox: 'w-full max-w-sm',
                        card: 'shadow-none border',
                    },
                }}
            />
            <p className="text-muted-foreground max-w-sm text-center text-xs">
                Free forever. No card. Your log stays private unless you choose to share it.
            </p>
        </div>
    )
}
