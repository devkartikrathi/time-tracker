/* Chronos service worker.
 *
 * Deliberately conservative: it caches the app shell and static assets so the
 * app opens instantly and survives a dropped connection, but never caches API
 * responses — serving a stale day grid would look like data loss.
 */

const CACHE = 'chronos-shell-v1'
const SHELL = ['/', '/app', '/offline', '/icons/icon-192.png', '/manifest.webmanifest']

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open(CACHE)
            // One bad URL must not fail the whole install, so each is added
            // independently and failures are tolerated.
            .then((cache) => Promise.allSettled(SHELL.map((url) => cache.add(url))))
            .then(() => self.skipWaiting())
    )
})

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    )
})

self.addEventListener('fetch', (event) => {
    const { request } = event
    if (request.method !== 'GET') return

    const url = new URL(request.url)
    if (url.origin !== self.location.origin) return

    // Never serve API data from cache.
    if (url.pathname.startsWith('/api/')) return

    // Navigations: network first, fall back to the cached shell offline.
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const copy = response.clone()
                    caches.open(CACHE).then((cache) => cache.put(request, copy))
                    return response
                })
                .catch(async () => (await caches.match(request)) ?? (await caches.match('/offline')) ?? Response.error())
        )
        return
    }

    // Static assets: cache first.
    event.respondWith(
        caches.match(request).then(
            (cached) =>
                cached ??
                fetch(request).then((response) => {
                    if (response.ok && response.type === 'basic') {
                        const copy = response.clone()
                        caches.open(CACHE).then((cache) => cache.put(request, copy))
                    }
                    return response
                })
        )
    )
})

self.addEventListener('push', (event) => {
    if (!event.data) return
    let payload = {}
    try {
        payload = event.data.json()
    } catch {
        payload = { title: 'Chronos', body: event.data.text() }
    }

    event.waitUntil(
        self.registration.showNotification(payload.title ?? 'Chronos', {
            body: payload.body ?? '',
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-192.png',
            tag: 'chronos-reminder',
            data: { url: payload.url ?? '/app' },
        })
    )
})

self.addEventListener('notificationclick', (event) => {
    event.notification.close()
    const target = event.notification.data?.url ?? '/app'

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Focus an existing tab rather than opening a duplicate.
            for (const client of clientList) {
                if (client.url.includes(target) && 'focus' in client) return client.focus()
            }
            return self.clients.openWindow(target)
        })
    )
})
