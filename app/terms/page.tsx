import type { Metadata } from 'next'
import { MarketingFooter, MarketingHeader } from '@/components/marketing/chrome'

export const metadata: Metadata = {
    title: 'Terms',
    description: 'The terms of using Chronos.',
}

export default function TermsPage() {
    return (
        <div className="min-h-dvh">
            <MarketingHeader />
            <main className="mx-auto max-w-2xl px-4 py-12">
                <h1 className="text-3xl font-semibold tracking-tight">Terms</h1>

                <div className="mt-8 space-y-6 text-sm leading-relaxed">
                    <section>
                        <h2 className="text-base font-semibold">The short version</h2>
                        <p className="text-muted-foreground mt-1.5">
                            Chronos is a personal time-tracking tool. Use it for yourself, do not
                            abuse it, and understand that it is provided as-is.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold">Your account</h2>
                        <p className="text-muted-foreground mt-1.5">
                            You are responsible for what happens under your account. You must be at
                            least 13 to use it. You can delete it whenever you like.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold">Your content</h2>
                        <p className="text-muted-foreground mt-1.5">
                            What you log stays yours. You grant us only what is needed to store it
                            and show it back to you.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold">Not health advice</h2>
                        <p className="text-muted-foreground mt-1.5">
                            Insights are patterns in your own numbers, nothing more. They are not
                            medical, psychological or clinical advice. If something in your life
                            needs real help, please talk to someone qualified.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold">Availability</h2>
                        <p className="text-muted-foreground mt-1.5">
                            We aim to keep Chronos running and your data safe, but it is offered
                            without warranty. Export your data if it matters to you.
                        </p>
                    </section>
                </div>
            </main>
            <MarketingFooter />
        </div>
    )
}
