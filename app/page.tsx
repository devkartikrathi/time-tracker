import Link from 'next/link'
import type { Metadata } from 'next'
import {
    ArrowRight,
    ChartColumn,
    Download,
    Flame,
    Lightbulb,
    Lock,
    Smartphone,
    Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DemoGrid } from '@/components/marketing/demo-grid'
import { MarketingHeader, MarketingFooter } from '@/components/marketing/chrome'

export const metadata: Metadata = {
    title: 'Chronos — See where your 24 hours actually go',
    description:
        'Log your day in twenty seconds. Chronos turns your hours into a picture of how you actually live — rest, work and life, side by side. Free and works on your phone.',
}

const FEATURES = [
    {
        icon: Smartphone,
        title: 'Built for your thumb',
        body: 'Pick an activity once, then drag across the hours. A whole day takes about twenty seconds, standing on a train.',
    },
    {
        icon: ChartColumn,
        title: 'A month you can read',
        body: 'Every day as a row, every hour as a block. Your sleep drift, your good weeks and your bad ones are visible in one glance.',
    },
    {
        icon: Lightbulb,
        title: 'Patterns, not platitudes',
        body: 'Rate your days and Chronos tells you which kind of time actually tracks with the good ones. Grounded in your numbers, never invented.',
    },
    {
        icon: Flame,
        title: 'Streaks that survive real life',
        body: 'One logged hour keeps the streak. Today never breaks it — only a fully skipped day does.',
    },
    {
        icon: Download,
        title: 'Your data leaves with you',
        body: 'Export everything to CSV or JSON any time. No lock-in, no hostage-taking.',
    },
    {
        icon: Lock,
        title: 'Private by default',
        body: 'Your log is yours. Nothing is sold, nothing is shared, and nothing is public unless you choose to post it.',
    },
]

const FAQS = [
    {
        q: 'How is this different from Toggl or Clockify?',
        a: 'Those are built for billing clients — start a timer, stop a timer, invoice. Chronos is retrospective and personal: at the end of the day you fill in what actually happened, including the sleeping and the scrolling. It is closer to a diary than a timesheet.',
    },
    {
        q: 'Do I have to log every hour?',
        a: 'No. Most people fill in the big blocks and leave the rest. The unlogged gaps are shown honestly rather than hidden, and they are often the most interesting part.',
    },
    {
        q: 'Why hours and not minutes?',
        a: 'Because precision kills the habit. An hour is coarse enough that you can do a full day from memory in seconds, and fine enough that the patterns still show up.',
    },
    {
        q: 'Does it work offline?',
        a: 'Add it to your home screen and it opens instantly and keeps working without a connection. Anything you log syncs when you are back online.',
    },
    {
        q: 'Is there a free plan?',
        a: 'Yes, and it is genuinely usable — the grid, the month view, insights, streaks and goals are all free. Pro adds unlimited history, exports and deeper AI reads.',
    },
]

export default function HomePage() {
    return (
        <div className="min-h-dvh">
            <MarketingHeader />

            <main>
                {/* Hero */}
                <section className="mx-auto max-w-5xl px-4 pb-12 pt-10 sm:pt-16">
                    <div className="mx-auto max-w-2xl text-center">
                        <p className="text-brand mb-4 text-sm font-medium">
                            You get 24 hours. Same as everyone.
                        </p>
                        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
                            See where your hours{' '}
                            <span className="text-brand">actually</span> go
                        </h1>
                        <p className="text-muted-foreground mt-4 text-pretty text-base leading-relaxed sm:text-lg">
                            Not where you planned them to go. Log a day in twenty seconds, then
                            watch a month of your real life appear — rest, work and everything
                            else, side by side.
                        </p>

                        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                            <Button asChild size="lg" variant="brand" className="w-full sm:w-auto">
                                <Link href="/sign-up">
                                    Start tracking free
                                    <ArrowRight className="size-4" />
                                </Link>
                            </Button>
                            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                                <Link href="/sign-in">I have an account</Link>
                            </Button>
                        </div>
                        <p className="text-muted-foreground mt-3 text-xs">
                            Free forever. No card. Works on your phone.
                        </p>
                    </div>

                    <div className="mx-auto mt-10 max-w-2xl">
                        <DemoGrid />
                    </div>
                </section>

                {/* How it works */}
                <section className="border-y">
                    <div className="mx-auto max-w-5xl px-4 py-12">
                        <h2 className="text-center text-2xl font-semibold tracking-tight">
                            Three taps, then it runs itself
                        </h2>
                        <ol className="mt-8 grid gap-6 sm:grid-cols-3">
                            {[
                                {
                                    n: '1',
                                    t: 'Pick an activity',
                                    d: 'Sleep, Deep Work, People — yours to name. Eight to start with, ready to go.',
                                },
                                {
                                    n: '2',
                                    t: 'Drag across the hours',
                                    d: 'One gesture fills a whole block. No dialogs, no timers, no fiddling.',
                                },
                                {
                                    n: '3',
                                    t: 'Watch the shape appear',
                                    d: 'After a week the patterns start showing. After a month they are hard to argue with.',
                                },
                            ].map((step) => (
                                <li key={step.n}>
                                    <div className="bg-brand-muted text-brand mb-3 flex size-8 items-center justify-center rounded-full text-sm font-semibold">
                                        {step.n}
                                    </div>
                                    <h3 className="font-medium">{step.t}</h3>
                                    <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                                        {step.d}
                                    </p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                {/* Features */}
                <section className="mx-auto max-w-5xl px-4 py-14">
                    <h2 className="text-center text-2xl font-semibold tracking-tight">
                        Small app, honest numbers
                    </h2>
                    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {FEATURES.map((feature) => (
                            <div key={feature.title}>
                                <feature.icon className="text-brand mb-3 size-5" />
                                <h3 className="font-medium">{feature.title}</h3>
                                <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                                    {feature.body}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* FAQ */}
                <section className="border-t">
                    <div className="mx-auto max-w-2xl px-4 py-14">
                        <h2 className="text-center text-2xl font-semibold tracking-tight">
                            Questions
                        </h2>
                        <dl className="mt-8 space-y-6">
                            {FAQS.map((faq) => (
                                <div key={faq.q}>
                                    <dt className="font-medium">{faq.q}</dt>
                                    <dd className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
                                        {faq.a}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </section>

                {/* Closing CTA */}
                <section className="border-t">
                    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
                        <Sparkles className="text-brand mx-auto mb-4 size-6" />
                        <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                            You have already spent today
                        </h2>
                        <p className="text-muted-foreground mt-3 text-pretty">
                            The only question is whether you know what you spent it on. Start with
                            today — it takes twenty seconds.
                        </p>
                        <Button asChild size="lg" variant="brand" className="mt-6">
                            <Link href="/sign-up">
                                Start tracking free
                                <ArrowRight className="size-4" />
                            </Link>
                        </Button>
                    </div>
                </section>
            </main>

            <MarketingFooter />
        </div>
    )
}
