'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface TabsContextValue {
    value: string
    onValueChange: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
    defaultValue?: string
    value?: string
    onValueChange?: (value: string) => void
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
    ({ className, defaultValue, value, onValueChange, children, ...props }, ref) => {
        const [internalValue, setInternalValue] = React.useState(defaultValue || '')

        const currentValue = value !== undefined ? value : internalValue

        const handleValueChange = React.useCallback((newValue: string) => {
            if (value === undefined) {
                setInternalValue(newValue)
            }
            onValueChange?.(newValue)
        }, [value, onValueChange])

        const contextValue = React.useMemo(() => ({
            value: currentValue,
            onValueChange: handleValueChange
        }), [currentValue, handleValueChange])

        return (
            <TabsContext.Provider value={contextValue}>
                <div
                    ref={ref}
                    className={cn('w-full', className)}
                    {...props}
                >
                    {children}
                </div>
            </TabsContext.Provider>
        )
    }
)
Tabs.displayName = 'Tabs'

const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                'inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 w-full',
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
)
TabsList.displayName = 'TabsList'

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
    ({ className, value, children, ...props }, ref) => {
        const context = React.useContext(TabsContext)

        if (!context) {
            throw new Error('TabsTrigger must be used within Tabs')
        }

        const isActive = context.value === value

        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex-1',
                    isActive
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900',
                    className
                )}
                onClick={() => context.onValueChange(value)}
                data-state={isActive ? 'active' : 'inactive'}
                {...props}
            >
                {children}
            </button>
        )
    }
)
TabsTrigger.displayName = 'TabsTrigger'

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
    ({ className, value, children, ...props }, ref) => {
        const context = React.useContext(TabsContext)

        if (!context) {
            throw new Error('TabsContent must be used within Tabs')
        }

        const isActive = context.value === value

        if (!isActive) return null

        return (
            <div
                ref={ref}
                className={cn(
                    'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                    className
                )}
                data-state={isActive ? 'active' : 'inactive'}
                {...props}
            >
                {children}
            </div>
        )
    }
)
TabsContent.displayName = 'TabsContent'

export { Tabs, TabsList, TabsTrigger, TabsContent }