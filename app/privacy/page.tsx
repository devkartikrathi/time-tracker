import type { Metadata } from 'next'
import { MarketingFooter, MarketingHeader } from '@/components/marketing/chrome'

export const metadata: Metadata = {
    title: 'Privacy',
    description: 'What Chronos stores, why, and how to get it back or delete it.',
}

export default function PrivacyPage() {
    return (
        <div className="min-h-dvh">
            <MarketingHeader />
            <main className="prose-sm mx-auto max-w-2xl px-4 py-12">
                <h1 className="text-3xl font-semibold tracking-tight">Privacy</h1>
                <p className="text-muted-foreground mt-2 text-sm">
                    Plain language, because this is the part people actually care about.
                </p>

                <div className="mt-8 space-y-6 text-sm leading-relaxed">
                    <section>
                        <h2 className="text-base font-semibold">What we store</h2>
                        <p className="text-muted-foreground mt-1.5">
                            Your email and name from your sign-in provider, the activities you
                            create, and the hours, moods, tags and notes you log. That is the whole
                            list.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold">What we do not do</h2>
                        <p className="text-muted-foreground mt-1.5">
                            We do not sell your data, share it with advertisers, or make any part of
                            your log public. A month card is only ever created when you tap share,
                            and it is handed to you rather than posted anywhere.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold">AI analysis</h2>
                        <p className="text-muted-foreground mt-1.5">
                            The optional written analysis sends an aggregated summary of your recent
                            days — hour counts per category, activity totals and mood ratings — to
                            Google&apos;s Gemini API to be interpreted. Individual notes are not
                            included, and nothing is sent unless you tap that button.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold">Getting your data out</h2>
                        <p className="text-muted-foreground mt-1.5">
                            Export everything to CSV or JSON from the You tab at any time. Deleting
                            your account removes every row we hold, immediately and permanently.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-base font-semibold">Analytics</h2>
                        <p className="text-muted-foreground mt-1.5">
                            We use privacy-friendly aggregate analytics to count page views and
                            measure load times. It does not track you across other sites.
                        </p>
                    </section>
                </div>
            </main>
            <MarketingFooter />
        </div>
    )
}
