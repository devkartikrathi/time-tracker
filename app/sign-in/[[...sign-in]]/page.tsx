import { SignIn } from '@clerk/nextjs'
import type { Metadata } from 'next'
import { Logo } from '@/components/marketing/chrome'

export const metadata: Metadata = { title: 'Log in' }

export default function SignInPage() {
    return (
        <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-10">
            <Logo />
            <SignIn
                appearance={{
                    elements: {
                        rootBox: 'w-full max-w-sm',
                        card: 'shadow-none border',
                    },
                }}
            />
        </div>
    )
}
