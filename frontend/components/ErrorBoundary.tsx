'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryState {
    hasError: boolean
    error?: Error
    errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
    children: React.ReactNode
    fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        this.setState({
            error,
            errorInfo
        })
        console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    resetError = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                const FallbackComponent = this.props.fallback
                return <FallbackComponent error={this.state.error} resetError={this.resetError} />
            }

            return (
                <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
                    <Card className="max-w-lg w-full">
                        <CardHeader>
                            <CardTitle className="flex items-center text-red-600">
                                <AlertTriangle className="w-5 h-5 mr-2" />
                                Something went wrong
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-gray-600">
                                We encountered an unexpected error. This might be a temporary issue.
                            </p>

                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <div className="bg-gray-100 p-4 rounded-lg text-sm">
                                    <p className="font-medium text-red-600 mb-2">Error Details:</p>
                                    <p className="text-gray-700">{this.state.error.message}</p>
                                    {this.state.error.stack && (
                                        <details className="mt-2">
                                            <summary className="cursor-pointer text-gray-600">Stack Trace</summary>
                                            <pre className="mt-2 text-xs overflow-auto">
                                                {this.state.error.stack}
                                            </pre>
                                        </details>
                                    )}
                                </div>
                            )}

                            <div className="flex space-x-3">
                                <Button onClick={this.resetError} className="flex-1">
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Try Again
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => window.location.reload()}
                                    className="flex-1"
                                >
                                    Refresh Page
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )
        }

        return this.props.children
    }
}

// Hook version for functional components
export function useErrorBoundary() {
    const [error, setError] = React.useState<Error | null>(null)

    const resetError = React.useCallback(() => {
        setError(null)
    }, [])

    const captureError = React.useCallback((error: Error) => {
        setError(error)
    }, [])

    React.useEffect(() => {
        if (error) {
            throw error
        }
    }, [error])

    return { captureError, resetError }
}