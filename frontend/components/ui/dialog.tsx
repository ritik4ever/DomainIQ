"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DialogContextValue {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const DialogContext = React.createContext<DialogContextValue | undefined>(undefined)

function useDialog() {
    const context = React.useContext(DialogContext)
    if (!context) {
        throw new Error("Dialog components must be used within a Dialog")
    }
    return context
}

interface DialogProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    children: React.ReactNode
}

function Dialog({ open = false, onOpenChange, children }: DialogProps) {
    return (
        <DialogContext.Provider value={{ open, onOpenChange: onOpenChange || (() => { }) }}>
            {children}
        </DialogContext.Provider>
    )
}

interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
}

const DialogTrigger = React.forwardRef<HTMLButtonElement, DialogTriggerProps>(
    ({ className, children, onClick, ...props }, ref) => {
        const { onOpenChange } = useDialog()

        const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
            onOpenChange(true)
            onClick?.(event)
        }

        return (
            <button
                ref={ref}
                className={className}
                onClick={handleClick}
                {...props}
            >
                {children}
            </button>
        )
    }
)
DialogTrigger.displayName = "DialogTrigger"

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string
}

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
    ({ className, children, ...props }, ref) => {
        const { open, onOpenChange } = useDialog()

        React.useEffect(() => {
            const handleEscape = (event: KeyboardEvent) => {
                if (event.key === "Escape") {
                    onOpenChange(false)
                }
            }

            if (open) {
                document.addEventListener("keydown", handleEscape)
                document.body.style.overflow = "hidden"
            }

            return () => {
                document.removeEventListener("keydown", handleEscape)
                document.body.style.overflow = "unset"
            }
        }, [open, onOpenChange])

        if (!open) return null

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                {/* Overlay */}
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={() => onOpenChange(false)}
                />

                {/* Content */}
                <div
                    ref={ref}
                    className={cn(
                        "relative z-50 w-full max-w-lg mx-4 bg-white rounded-lg shadow-lg",
                        "border border-gray-200 p-6",
                        className
                    )}
                    {...props}
                >
                    {children}

                    {/* Close button */}
                    <button
                        className="absolute top-4 right-4 p-1 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
                        onClick={() => onOpenChange(false)}
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Close</span>
                    </button>
                </div>
            </div>
        )
    }
)
DialogContent.displayName = "DialogContent"

interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> { }

const DialogHeader = ({ className, ...props }: DialogHeaderProps) => (
    <div
        className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
        {...props}
    />
)
DialogHeader.displayName = "DialogHeader"

interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> { }

const DialogFooter = ({ className, ...props }: DialogFooterProps) => (
    <div
        className={cn(
            "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
            className
        )}
        {...props}
    />
)
DialogFooter.displayName = "DialogFooter"

interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> { }

const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(
    ({ className, ...props }, ref) => (
        <h2
            ref={ref}
            className={cn("text-lg font-semibold leading-none tracking-tight", className)}
            {...props}
        />
    )
)
DialogTitle.displayName = "DialogTitle"

interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> { }

const DialogDescription = React.forwardRef<HTMLParagraphElement, DialogDescriptionProps>(
    ({ className, ...props }, ref) => (
        <p
            ref={ref}
            className={cn("text-sm text-gray-500", className)}
            {...props}
        />
    )
)
DialogDescription.displayName = "DialogDescription"

export {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
}