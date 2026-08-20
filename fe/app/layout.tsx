import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Providers } from '@/components/providers'
import { Toaster } from '@/components/ui/sonner'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans', display: 'swap' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono', display: 'swap' })

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://chronos.app'

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: 'Chronos — See where your 24 hours actually go',
        template: '%s · Chronos',
    },
    description:
        'Log your day in twenty seconds. Chronos turns your hours into a picture of how you actually live — rest, work and life, side by side.',
    applicationName: 'Chronos',
    keywords: [
        'time tracking',
        'life tracking',
        'daily log',
        'habit tracker',
        'time audit',
        'work life balance',
    ],
    openGraph: {
        type: 'website',
        siteName: 'Chronos',
        title: 'Chronos — See where your 24 hours actually go',
        description:
            'Log your day in twenty seconds and watch the patterns appear. Free, private, works on your phone.',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Chronos — See where your 24 hours actually go',
        description: 'Log your day in twenty seconds and watch the patterns appear.',
    },
    manifest: '/manifest.webmanifest',
    appleWebApp: {
        capable: true,
        title: 'Chronos',
        statusBarStyle: 'black-translucent',
    },
    formatDetection: { telephone: false },
}

export const viewport: Viewport = {
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#fcfcfc' },
        { media: '(prefers-color-scheme: dark)', color: '#111113' },
    ],
    width: 'device-width',
    initialScale: 1,
    // Zoom stays enabled — disabling it is an accessibility failure. The 16px
    // input rule in globals.css is what prevents iOS auto-zoom on focus.
    maximumScale: 5,
    viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

    const tree = (
        <html lang="en" suppressHydrationWarning>
            <body className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
                <Providers>{children}</Providers>
                <Toaster />
                <Analytics />
                <SpeedInsights />
            </body>
        </html>
    )

    // Without Clerk keys the marketing pages still render, so a fresh clone
    // shows something useful instead of crashing on a missing provider.
    if (!publishableKey) return tree

    return <ClerkProvider publishableKey={publishableKey}>{tree}</ClerkProvider>
}
