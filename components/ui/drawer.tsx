'use client'

import * as React from 'react'
import { Drawer as DrawerPrimitive } from 'vaul'
import { cn } from '@/lib/utils'

function Drawer({ ...props }: React.ComponentProps<typeof DrawerPrimitive.Root>) {
    return <DrawerPrimitive.Root data-slot="drawer" {...props} />
}

const DrawerTrigger = DrawerPrimitive.Trigger
const DrawerPortal = DrawerPrimitive.Portal
const DrawerClose = DrawerPrimitive.Close

function DrawerOverlay({
    className,
    ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
    return (
        <DrawerPrimitive.Overlay
            data-slot="drawer-overlay"
            className={cn(
                'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/60',
                className
            )}
            {...props}
        />
    )
}

function DrawerContent({
    className,
    children,
    ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content>) {
    return (
        <DrawerPortal>
            <DrawerOverlay />
            <DrawerPrimitive.Content
                data-slot="drawer-content"
                className={cn(
                    'bg-background fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-2xl border-t',
                    // Never taller than the viewport, and clear of the home indicator.
                    'max-h-[92dvh] pb-[env(safe-area-inset-bottom)]',
                    className
                )}
                {...props}
            >
                <div className="bg-muted mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full" />
                {children}
            </DrawerPrimitive.Content>
        </DrawerPortal>
    )
}

function DrawerHeader({ className, ...props }: React.ComponentProps<'div'>) {
    return <div className={cn('grid gap-1 p-4 text-left', className)} {...props} />
}

function DrawerFooter({ className, ...props }: React.ComponentProps<'div'>) {
    return <div className={cn('mt-auto flex flex-col gap-2 p-4', className)} {...props} />
}

function DrawerTitle({ className, ...props }: React.ComponentProps<typeof DrawerPrimitive.Title>) {
    return (
        <DrawerPrimitive.Title
            className={cn('text-base font-semibold', className)}
            {...props}
        />
    )
}

function DrawerDescription({
    className,
    ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
    return (
        <DrawerPrimitive.Description
            className={cn('text-muted-foreground text-sm', className)}
            {...props}
        />
    )
}

export {
    Drawer,
    DrawerPortal,
    DrawerOverlay,
    DrawerTrigger,
    DrawerClose,
    DrawerContent,
    DrawerHeader,
    DrawerFooter,
    DrawerTitle,
    DrawerDescription,
}
