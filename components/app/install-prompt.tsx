'use client'

import { useEffect, useState } from 'react'
import { Download, Share, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'chronos:install-dismissed'

/**
 * Registers the service worker and offers installation.
 *
 * Chrome and Android fire `beforeinstallprompt`, which gives a real install
 * button. iOS Safari fires nothing and requires the user to use Share → Add to
 * Home Screen, so that platform gets instructions instead of a button that
 * could not work.
 */
export function InstallPrompt() {
    const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
    const [showIosHint, setShowIosHint] = useState(false)

    useEffect(() => {
        if (!('serviceWorker' in navigator)) return
        navigator.serviceWorker.register('/sw.js').catch((error) => {
            console.warn('Service worker registration failed:', error)
        })
    }, [])

    useEffect(() => {
        if (typeof window === 'undefined') return
        if (localStorage.getItem(DISMISS_KEY)) return

        const standalone =
            window.matchMedia('(display-mode: standalone)').matches ||
            (window.navigator as { standalone?: boolean }).standalone === true
        if (standalone) return

        const onPrompt = (event: Event) => {
            event.preventDefault()
            setDeferred(event as BeforeInstallPromptEvent)
        }
        window.addEventListener('beforeinstallprompt', onPrompt)

        const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)
        const isSafari = /safari/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent)
        if (isIos && isSafari) {
            // Delayed so it does not greet a first-time visitor immediately.
            const timer = setTimeout(() => setShowIosHint(true), 20_000)
            return () => {
                clearTimeout(timer)
                window.removeEventListener('beforeinstallprompt', onPrompt)
            }
        }

        return () => window.removeEventListener('beforeinstallprompt', onPrompt)
    }, [])

    const dismiss = () => {
        localStorage.setItem(DISMISS_KEY, '1')
        setDeferred(null)
        setShowIosHint(false)
    }

    const install = async () => {
        if (!deferred) return
        await deferred.prompt()
        await deferred.userChoice
        setDeferred(null)
    }

    if (!deferred && !showIosHint) return null

    return (
        <div className="pb-safe fixed inset-x-0 bottom-14 z-50 px-3 pb-2 md:bottom-3">
            <div className="bg-popover mx-auto flex max-w-md items-center gap-3 rounded-xl border p-3 shadow-lg">
                <div className="bg-brand-muted flex size-9 shrink-0 items-center justify-center rounded-lg">
                    {deferred ? (
                        <Download className="text-brand size-4" />
                    ) : (
                        <Share className="text-brand size-4" />
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">Add Chronos to your home screen</p>
                    <p className="text-muted-foreground text-xs">
                        {deferred
                            ? 'Opens instantly and works offline.'
                            : 'Tap Share, then “Add to Home Screen”.'}
                    </p>
                </div>

                {deferred && (
                    <Button size="sm" variant="brand" onClick={install}>
                        Install
                    </Button>
                )}

                <Button size="icon-sm" variant="ghost" aria-label="Dismiss" onClick={dismiss}>
                    <X className="size-4" />
                </Button>
            </div>
        </div>
    )
}
