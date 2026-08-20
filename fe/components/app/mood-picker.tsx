'use client'

import { cn } from '@/lib/utils'
import { haptic } from '@/lib/utils'

const MOODS = [
    { value: 1, label: 'Rough', face: '😞' },
    { value: 2, label: 'Meh', face: '😕' },
    { value: 3, label: 'Fine', face: '😐' },
    { value: 4, label: 'Good', face: '🙂' },
    { value: 5, label: 'Great', face: '😄' },
] as const

interface MoodPickerProps {
    value: number | null
    onChange: (mood: number | null) => void
}

/**
 * A one-tap daily rating.
 *
 * This is the input that makes the insights engine able to say something the
 * user could not have worked out themselves — correlating how they felt about
 * a day against how they actually spent it.
 */
export function MoodPicker({ value, onChange }: MoodPickerProps) {
    return (
        <div>
            <p className="text-muted-foreground mb-2 text-xs font-medium">How was today?</p>
            <div className="flex gap-1.5" role="radiogroup" aria-label="Rate your day">
                {MOODS.map((mood) => {
                    const selected = value === mood.value
                    return (
                        <button
                            key={mood.value}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            aria-label={mood.label}
                            onClick={() => {
                                haptic(8)
                                // Tapping the current rating clears it, so a
                                // mis-tap does not lock in a wrong value.
                                onChange(selected ? null : mood.value)
                            }}
                            className={cn(
                                'flex h-11 flex-1 items-center justify-center rounded-lg border text-xl transition-all',
                                'focus-visible:ring-ring/60 outline-none focus-visible:ring-2',
                                selected
                                    ? 'border-brand bg-brand-muted scale-105'
                                    : 'bg-card hover:bg-accent grayscale'
                            )}
                        >
                            <span aria-hidden>{mood.face}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
