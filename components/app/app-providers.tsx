'use client'

import { useState } from 'react'
import { ClerkProvider } from '@clerk/nextjs'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

/**
 * Providers only the signed-in product needs. Loaded on /app, /onboarding and
 * the auth pages — never on the marketing routes.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
    // Created in state so the client is stable across re-renders but never
    // shared between users during server rendering.
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 30_000,
                        // A phone waking from sleep should show fresh data, but
                        // not re-fetch on every focus while the user is typing.
                        refetchOnWindowFocus: false,
                        refetchOnReconnect: true,
                        retry: (failureCount, error) => {
                            const status = (error as { status?: number }).status
                            // Auth and validation failures will not fix themselves.
                            if (status && status >= 400 && status < 500) return false
                            return failureCount < 2
                        },
                    },
                    mutations: { retry: 0 },
                },
            })
    )

    const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    const tree = <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>

    if (!publishableKey) return tree
    return <ClerkProvider publishableKey={publishableKey}>{tree}</ClerkProvider>
}
