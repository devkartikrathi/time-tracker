import * as React from 'react'
import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                'border-input bg-background flex h-11 w-full rounded-lg border px-3 py-2 text-base shadow-sm transition-colors sm:h-10',
                'file:border-0 file:bg-transparent file:text-sm file:font-medium',
                'placeholder:text-muted-foreground',
                'focus-visible:ring-ring/50 outline-none focus-visible:ring-[3px]',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
                className
            )}
            {...props}
        />
    )
}

export { Input }
