import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/** Fires the device haptic on supported browsers; a no-op everywhere else. */
export function haptic(pattern: number | number[] = 8) {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
            navigator.vibrate(pattern)
        } catch {
            /* Safari on iOS has no vibrate; ignore. */
        }
    }
}

export function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value))
}
