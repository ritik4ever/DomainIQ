'use client'

import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet } from 'lucide-react'

interface WalletGuardProps {
    children: React.ReactNode
    message?: string
}

export default function WalletGuard({ children, message = "Connect your wallet to access AI-powered domain analysis" }: WalletGuardProps) {
    const { isConnected } = useAccount()

    if (!isConnected) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
                <Card className="max-w-md w-full">
                    <CardHeader className="text-center">
                        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Wallet className="w-8 h-8 text-primary-600" />
                        </div>
                        <CardTitle className="text-xl">Wallet Required</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <p className="text-gray-600">{message}</p>
                        <div className="pt-2">
                            <ConnectButton />
                        </div>
                        <div className="text-xs text-gray-500 space-y-1">
                            <p>• AI-powered domain scoring</p>
                            <p>• Real-time market analysis</p>
                            <p>• Portfolio tracking</p>
                            <p>• Trading recommendations</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return <>{children}</>
}