'use client'

import { useSyncExternalStore } from 'react'

// The store never changes after hydration, so the subscribe function is a no-op.
const subscribe = () => () => {}

/**
 * True once hydrated, false during server render.
 *
 * `useSyncExternalStore` is the correct primitive for this: the old
 * `useState(false)` + `useEffect(() => setMounted(true))` pattern schedules a
 * second render pass on every mount, which React's lint rules now flag as a
 * cascading render.
 */
export function useIsClient(): boolean {
    return useSyncExternalStore(
        subscribe,
        () => true,
        () => false
    )
}
