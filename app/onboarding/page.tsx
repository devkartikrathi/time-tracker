'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Logo } from '@/components/marketing/chrome'
import { api, ApiError } from '@/lib/api-client'
import { detectTimezone } from '@/lib/date'
import { cn } from '@/lib/utils'

const OCCUPATIONS = ['Student', 'Engineer', 'Designer', 'Founder', 'Manager', 'Freelancer']
const FOCUSES = [
    'Sleeping properly',
    'Deep work',
    'Less doomscrolling',
    'More exercise',
    'Time with people',
    'Just seeing the truth',
]

/**
 * Two short steps, then straight into the grid.
 *
 * The previous flow asked for occupation, age and a free-text focus before
 * showing anything, with a plain `alert()` on failure. Every extra field before
 * a user has seen the product costs signups, so this asks the minimum, offers
 * tappable answers rather than empty text boxes, and hands them the grid.
 */
export default function OnboardingPage() {
    const router = useRouter()
    const [step, setStep] = useState(0)
    const [occupation, setOccupation] = useState('')
    const [age, setAge] = useState('')
    const [focus, setFocus] = useState('')
    const [saving, setSaving] = useState(false)

    const finish = async () => {
        setSaving(true)
        try {
            await api.completeOnboarding({
                occupation: occupation.trim(),
                age: Number(age),
                focus: focus.trim(),
                timezone: detectTimezone(),
            })
            // refresh() re-runs the server layout so its onboarding check sees
            // the freshly-completed state instead of bouncing straight back.
            router.refresh()
            router.replace('/app')
        } catch (error) {
            toast.error(
                error instanceof ApiError ? error.message : 'Could not save that — try again'
            )
            setSaving(false)
        }
    }

    const canContinue = step === 0 ? occupation.trim() && age : focus.trim()

    return (
        <div className="flex min-h-dvh flex-col">
            <header className="pt-safe border-b">
                <div className="mx-auto flex h-14 max-w-lg items-center px-4">
                    <Logo />
                </div>
            </header>

            <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-4 py-8">
                <div className="mb-6 flex gap-1.5" aria-hidden>
                    {[0, 1].map((index) => (
                        <div
                            key={index}
                            className={cn(
                                'h-1 flex-1 rounded-full transition-colors',
                                index <= step ? 'bg-brand' : 'bg-muted'
                            )}
                        />
                    ))}
                </div>

                {step === 0 ? (
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">
                                First, the basics
                            </h1>
                            <p className="text-muted-foreground mt-1.5 text-sm">
                                Two questions, then you are in. This only shapes the wording of
                                your insights.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>What do you do?</Label>
                            <div className="flex flex-wrap gap-2">
                                {OCCUPATIONS.map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => setOccupation(option)}
                                        className={cn(
                                            'min-h-10 rounded-full border px-3.5 text-sm font-medium transition-all',
                                            occupation === option
                                                ? 'border-brand bg-brand-muted text-brand'
                                                : 'bg-card hover:bg-accent'
                                        )}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                            <Input
                                aria-label="Or type your own occupation"
                                placeholder="Or type your own"
                                value={OCCUPATIONS.includes(occupation) ? '' : occupation}
                                onChange={(event) => setOccupation(event.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="age">How old are you?</Label>
                            <Input
                                id="age"
                                type="number"
                                inputMode="numeric"
                                min={13}
                                max={120}
                                placeholder="27"
                                value={age}
                                onChange={(event) => setAge(event.target.value)}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight">
                                What are you hoping to change?
                            </h1>
                            <p className="text-muted-foreground mt-1.5 text-sm">
                                Pick whichever is closest. You can change it later.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {FOCUSES.map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => setFocus(option)}
                                    className={cn(
                                        'min-h-10 rounded-full border px-3.5 text-sm font-medium transition-all',
                                        focus === option
                                            ? 'border-brand bg-brand-muted text-brand'
                                            : 'bg-card hover:bg-accent'
                                    )}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                        <Input
                            aria-label="Or type your own focus"
                            placeholder="Or type your own"
                            value={FOCUSES.includes(focus) ? '' : focus}
                            onChange={(event) => setFocus(event.target.value)}
                        />
                    </div>
                )}

                <div className="mt-8 flex gap-3">
                    {step > 0 && (
                        <Button variant="outline" onClick={() => setStep(0)} disabled={saving}>
                            Back
                        </Button>
                    )}
                    <Button
                        variant="brand"
                        className="flex-1"
                        disabled={!canContinue || saving}
                        onClick={() => (step === 0 ? setStep(1) : finish())}
                    >
                        {saving ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <>
                                {step === 0 ? 'Continue' : 'Open my grid'}
                                <ArrowRight className="size-4" />
                            </>
                        )}
                    </Button>
                </div>
            </main>
        </div>
    )
}
