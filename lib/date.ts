/**
 * Date helpers.
 *
 * A "day key" is the YYYY-MM-DD string that identifies a DailyTask row. The
 * previous code built these inline in a dozen places with
 * `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-...`, and one
 * place used `toISOString()` — which silently shifts the date across midnight
 * for any user west of UTC. Everything goes through here now.
 */

export type DayKey = string

export function toDayKey(date: Date): DayKey {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

/** Parses a day key into a Date at local midnight (never UTC midnight). */
export function fromDayKey(key: DayKey): Date {
    const [y, m, d] = key.split('-').map(Number)
    return new Date(y!, (m ?? 1) - 1, d ?? 1)
}

export function todayKey(): DayKey {
    return toDayKey(new Date())
}

export function addDays(date: Date, days: number): Date {
    const next = new Date(date)
    next.setDate(next.getDate() + days)
    return next
}

export function addDayKey(key: DayKey, days: number): DayKey {
    return toDayKey(addDays(fromDayKey(key), days))
}

export function isSameDay(a: Date, b: Date): boolean {
    return toDayKey(a) === toDayKey(b)
}

export function isToday(key: DayKey): boolean {
    return key === todayKey()
}

export function isFuture(key: DayKey): boolean {
    return key > todayKey()
}

/** Inclusive list of day keys between two dates. */
export function dayKeyRange(start: Date, end: Date): DayKey[] {
    const keys: DayKey[] = []
    const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate())
    const last = new Date(end.getFullYear(), end.getMonth(), end.getDate())
    while (cursor <= last) {
        keys.push(toDayKey(cursor))
        cursor.setDate(cursor.getDate() + 1)
    }
    return keys
}

export function monthBounds(date: Date): { start: Date; end: Date; startKey: DayKey; endKey: DayKey } {
    const start = new Date(date.getFullYear(), date.getMonth(), 1)
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    return { start, end, startKey: toDayKey(start), endKey: toDayKey(end) }
}

export function daysInMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

/** Last `n` day keys ending today (oldest first). */
export function lastNDays(n: number, from: Date = new Date()): DayKey[] {
    return Array.from({ length: n }, (_, i) => toDayKey(addDays(from, -(n - 1 - i))))
}

const HOUR_LABELS_12 = [
    '12a', '1a', '2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a', '10a', '11a',
    '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '10p', '11p',
]

export function formatHourShort(hour: number): string {
    return HOUR_LABELS_12[hour] ?? `${hour}`
}

export function formatHourLong(hour: number): string {
    const suffix = hour < 12 ? 'AM' : 'PM'
    const h = hour % 12 === 0 ? 12 : hour % 12
    return `${h}:00 ${suffix}`
}

export function formatHourRange(hour: number): string {
    const end = (hour + 1) % 24
    return `${formatHourLong(hour)} – ${formatHourLong(end)}`
}

/** "Today", "Yesterday", or a written date. */
export function friendlyDate(key: DayKey): string {
    const today = todayKey()
    if (key === today) return 'Today'
    if (key === addDayKey(today, -1)) return 'Yesterday'
    if (key === addDayKey(today, 1)) return 'Tomorrow'
    return fromDayKey(key).toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    })
}

export function detectTimezone(): string {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    } catch {
        return 'UTC'
    }
}
