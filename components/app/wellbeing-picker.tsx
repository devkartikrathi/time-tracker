'use client'

import { WELL_BEING_TAGS, type WellBeingTag } from '@/types'
import { cn, haptic } from '@/lib/utils'

interface WellBeingPickerProps {
    value: WellBeingTag[]
    onChange: (tags: WellBeingTag[]) => void
}

/**
 * Day-level life-area tags.
 *
 * Deliberately tagged per day rather than per hour: asking someone to classify
 * all 24 hours across eleven dimensions is the kind of friction that ends a
 * daily habit in a week.
 */
export function WellBeingPicker({ value, onChange }: WellBeingPickerProps) {
    const toggle = (tag: WellBeingTag) => {
        haptic(6)
        onChange(value.includes(tag) ? value.filter((t) => t !== tag) : [...value, tag])
    }

    return (
        <div>
            <p className="text-muted-foreground mb-2 text-xs font-medium">
                What did today touch?
            </p>
            <div className="flex flex-wrap gap-1.5">
                {WELL_BEING_TAGS.map((tag) => {
                    const selected = value.includes(tag)
                    return (
                        <button
                            key={tag}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => toggle(tag)}
                            className={cn(
                                'min-h-9 rounded-full border px-3 text-xs font-medium transition-all',
                                'focus-visible:ring-ring/60 outline-none focus-visible:ring-2',
                                selected
                                    ? 'border-brand bg-brand-muted text-brand'
                                    : 'bg-card text-muted-foreground hover:bg-accent'
                            )}
                        >
                            {tag}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
