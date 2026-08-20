'use client'

import { useState } from 'react'
import { ThemeProvider } from 'next-themes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export function Providers({ children }: { children: React.ReactNode }) {
    // Created in state so the client is stable across re-renders but never
    // shared between users during server rendering.
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 30_000,
                        // A phone waking from sleep should show fresh data, but
                        // not re-fetch on every tab focus while typing.
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

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                {children}
            </ThemeProvider>
        </QueryClientProvider>
    )
}
