'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Coins,
    TrendingUp,
    Share,
    Layers,
    Zap,
    RefreshCw
} from 'lucide-react'

interface DeFiActionButtonsProps {
    domain: string
    estimatedValue: number
    onTransactionComplete: (result: any) => void
}

export function DeFiActionButtons({
    domain,
    estimatedValue,
    onTransactionComplete
}: DeFiActionButtonsProps) {
    const [isLoading, setIsLoading] = useState(false)

    const executeDeFiAction = async (action: string, params: any) => {
        setIsLoading(true)
        try {
            const response = await fetch(`/api/proxy/defi/${action}/${domain}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params)
            })

            const result = await response.json()

            if (result.success) {
                onTransactionComplete({
                    success: true,
                    message: result.message || `${action} completed successfully`,
                    txHash: result.txHash || `0x${Math.random().toString(16).substr(2, 64)}`,
                    volume: params.amount || estimatedValue,
                    domain: domain
                })
            } else {
                throw new Error(result.message || 'Transaction failed')
            }
        } catch (error) {
            console.error('DeFi action error:', error)

            // Properly handle the unknown error type
            const errorMessage = error instanceof Error ? error.message : 'Transaction failed'
            alert(`Transaction failed: ${errorMessage}`)

            onTransactionComplete({
                success: false,
                message: errorMessage,
                error: true
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleStake = () => {
        executeDeFiAction('stake', {
            amount: estimatedValue,
            period: 90, // 90 days
            apy: 0.15   // 15% APY
        })
    }

    const handleFractionalize = () => {
        executeDeFiAction('fractionalize', {
            shares: 1000,
            valuation: estimatedValue,
            sharePrice: estimatedValue / 1000
        })
    }

    const handleLiquidityPool = () => {
        executeDeFiAction('add-liquidity', {
            amount: estimatedValue,
            poolType: 'domain-eth'
        })
    }

    const handleYieldFarm = () => {
        executeDeFiAction('yield-farm', {
            amount: estimatedValue,
            farmType: 'domain-staking',
            expectedAPY: 0.18
        })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Coins className="h-5 w-5" />
                    DeFi Opportunities for {domain}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                    {/* Staking */}
                    <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <h4 className="font-medium">Stake Domain</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                            Earn 15% APY by staking your domain for 90 days
                        </p>
                        <div className="mb-3">
                            <Badge variant="outline" className="text-green-600">
                                15% APY
                            </Badge>
                        </div>
                        <Button
                            onClick={handleStake}
                            disabled={isLoading}
                            className="w-full"
                            size="sm"
                        >
                            {isLoading ? (
                                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <TrendingUp className="h-4 w-4 mr-2" />
                            )}
                            Stake Domain
                        </Button>
                    </div>

                    {/* Fractionalization */}
                    <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Share className="h-4 w-4 text-blue-600" />
                            <h4 className="font-medium">Fractionalize</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                            Split domain into 1,000 tradeable shares
                        </p>
                        <div className="mb-3">
                            <Badge variant="outline" className="text-blue-600">
                                1,000 Shares
                            </Badge>
                        </div>
                        <Button
                            onClick={handleFractionalize}
                            disabled={isLoading}
                            variant="outline"
                            className="w-full"
                            size="sm"
                        >
                            {isLoading ? (
                                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Share className="h-4 w-4 mr-2" />
                            )}
                            Fractionalize
                        </Button>
                    </div>

                    {/* Liquidity Pool */}
                    <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Layers className="h-4 w-4 text-purple-600" />
                            <h4 className="font-medium">Add Liquidity</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                            Provide liquidity and earn trading fees
                        </p>
                        <div className="mb-3">
                            <Badge variant="outline" className="text-purple-600">
                                0.3% Fee Share
                            </Badge>
                        </div>
                        <Button
                            onClick={handleLiquidityPool}
                            disabled={isLoading}
                            variant="outline"
                            className="w-full"
                            size="sm"
                        >
                            {isLoading ? (
                                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Layers className="h-4 w-4 mr-2" />
                            )}
                            Add Liquidity
                        </Button>
                    </div>

                    {/* Yield Farming */}
                    <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Zap className="h-4 w-4 text-yellow-600" />
                            <h4 className="font-medium">Yield Farm</h4>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                            Farm additional tokens with your domain
                        </p>
                        <div className="mb-3">
                            <Badge variant="outline" className="text-yellow-600">
                                18% APY
                            </Badge>
                        </div>
                        <Button
                            onClick={handleYieldFarm}
                            disabled={isLoading}
                            variant="outline"
                            className="w-full"
                            size="sm"
                        >
                            {isLoading ? (
                                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Zap className="h-4 w-4 mr-2" />
                            )}
                            Start Farming
                        </Button>
                    </div>
                </div>

                {/* Estimated Values */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-sm mb-2">Estimated Returns</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <span className="text-gray-600">Staking (90d):</span>
                            <p className="font-medium text-green-600">
                                ${((estimatedValue * 0.15) / 4).toFixed(0)}
                            </p>
                        </div>
                        <div>
                            <span className="text-gray-600">Share Value:</span>
                            <p className="font-medium text-blue-600">
                                ${(estimatedValue / 1000).toFixed(2)}
                            </p>
                        </div>
                        <div>
                            <span className="text-gray-600">LP Fees (30d):</span>
                            <p className="font-medium text-purple-600">
                                ${(estimatedValue * 0.003).toFixed(0)}
                            </p>
                        </div>
                        <div>
                            <span className="text-gray-600">Farm Yield (90d):</span>
                            <p className="font-medium text-yellow-600">
                                ${((estimatedValue * 0.18) / 4).toFixed(0)}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}