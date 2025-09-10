interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg'
    message?: string
}

export default function LoadingSpinner({ size = 'md', message }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12'
    }

    return (
        <div className="flex flex-col items-center justify-center space-y-4">
            <div className={`animate-spin rounded-full border-b-2 border-primary-600 ${sizeClasses[size]}`}></div>
            {message && <p className="text-gray-600 text-sm">{message}</p>}
        </div>
    )
}