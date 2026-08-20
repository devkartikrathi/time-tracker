import { AppProviders } from '@/components/app/app-providers'

/** Clerk's hosted components are client-side and need the provider. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return <AppProviders>{children}</AppProviders>
}
