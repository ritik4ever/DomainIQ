'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, DollarSign, Target, Zap } from 'lucide-react'

interface Recommendation {
    type: 'BUY' | 'SELL'
    domain: string
    currentPrice?: number
    estimatedValue?: number
    currentValue?: number
    expectedROI: number
    recommendation: string
    confidence: number
    action: string
    aiScore?: number
}

interface TradingRecommendationsProps {
    walletAddress?: string
}

export default function TradingRecommendations({ walletAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' }: TradingRecommendationsProps) {
    const [recommendations, setRecommendations] = useState<Recommendation[]>([])
    const [loading, setLoading] = useState(false)
    const [executing, setExecuting] = useState<string | null>(null)

    useEffect(() => {
        if (walletAddress) {
            fetchRecommendations()
        }
    }, [walletAddress])

    const fetchRecommendations = async () => {
        setLoading(true)
        try {
            const response = await fetch(`/api/proxy/trading/recommendations/${walletAddress}`)
            const data = await response.json()
            setRecommendations(data.recommendations || [])
        } catch (error) {
            console.error('Recommendations fetch error:', error)
            // Demo data for testing
            setRecommendations([
                {
                    type: 'BUY',
                    domain: 'ai-analytics.io',
                    currentPrice: 2500,
                    estimatedValue: 4500,
                    expectedROI: 80,
                    recommendation: 'Undervalued AI domain with strong growth potential',
                    confidence: 85,
                    action: 'create_offer',
                    aiScore: 87
                },
                {
                    type: 'SELL',
                    domain: 'crypto.xyz',
                    currentValue: 1800,
                    expectedROI: -10,
                    recommendation: 'Market conditions unfavorable for .xyz domains',
                    confidence: 72,
                    action: 'create_listing',
                    aiScore: 65
                },
                {
                    type: 'BUY',
                    domain: 'defi-protocol.com',
                    currentPrice: 8000,
                    estimatedValue: 12000,
                    expectedROI: 50,
                    recommendation: 'Premium DeFi domain with institutional interest',
                    confidence: 90,
                    action: 'create_offer',
                    aiScore: 92
                }
            ])
        } finally {
            setLoading(false)
        }
    }

    const executeRecommendation = async (recommendation: Recommendation) => {
        setExecuting(recommendation.domain)
        try {
            const response = await fetch('/api/proxy/trading/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recommendation, userWallet: walletAddress })
            })

            const result = await response.json()

            if (result.success) {
                // Show success notification
                alert(`${recommendation.type} order created for ${recommendation.domain}`)
                // Remove executed recommendation
                setRecommendations(prev => prev.filter(r => r.domain !== recommendation.domain))
            } else {
                alert(`Failed to execute trade: ${result.error}`)
            }
        } catch (error) {
            console.error('Trade execution error:', error)
            alert('Trade execution failed')
        } finally {
            setExecuting(null)
        }
    }

    const getTypeIcon = (type: string) => {
        return type === 'BUY' ?
            <TrendingUp className="w-4 h-4 text-green-600" /> :
            <TrendingDown className="w-4 h-4 text-red-600" />
    }

    const getTypeColor = (type: string) => {
        return type === 'BUY' ? 'success' : 'destructive'
    }

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    <span className="ml-2">Generating AI recommendations...</span>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Target className="w-5 h-5 mr-2" />
                        AI Trading Recommendations
                    </div>
                    <Button variant="outline" size="sm" onClick={fetchRecommendations}>
                        Refresh
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {recommendations.length === 0 ? (
                    <div className="text-center py-8">
                        <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No recommendations available</p>
                        <p className="text-sm text-gray-400">Connect wallet to get personalized suggestions</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {recommendations.map((rec, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center space-x-2">
                                        {getTypeIcon(rec.type)}
                                        <Badge variant={getTypeColor(rec.type) as any}>
                                            {rec.type}
                                        </Badge>
                                        <h4 className="font-semibold text-gray-900">{rec.domain}</h4>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-gray-600">Expected ROI</p>
                                        <p className={`font-bold ${rec.expectedROI > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {rec.expectedROI > 0 ? '+' : ''}{rec.expectedROI.toFixed(1)}%
                                        </p>
                                    </div>
                                </div>

                                <p className="text-gray-700 mb-4">{rec.recommendation}</p>

                                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                                    <div>
                                        <p className="text-gray-600">Current Price</p>
                                        <p className="font-semibold">
                                            ${(rec.currentPrice || rec.currentValue || 0).toLocaleString()}
                                        </p>
                                    </div>
                                    {rec.estimatedValue && (
                                        <div>
                                            <p className="text-gray-600">AI Valuation</p>
                                            <p className="font-semibold text-green-600">
                                                ${rec.estimatedValue.toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-gray-600">Confidence</p>
                                        <p className="font-semibold">{rec.confidence}%</p>
                                    </div>
                                </div>

                                {rec.aiScore && (
                                    <div className="flex items-center mb-4">
                                        <span className="text-sm text-gray-600 mr-2">AI Score:</span>
                                        <Badge variant={rec.aiScore >= 80 ? 'success' : 'default'}>
                                            {rec.aiScore}/100
                                        </Badge>
                                    </div>
                                )}

                                <div className="flex space-x-2">
                                    <Button
                                        onClick={() => executeRecommendation(rec)}
                                        disabled={executing === rec.domain}
                                        className="flex-1"
                                        variant={rec.type === 'BUY' ? 'default' : 'outline'}
                                    >
                                        {executing === rec.domain ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Executing...
                                            </>
                                        ) : (
                                            <>
                                                <Zap className="w-4 h-4 mr-2" />
                                                Execute {rec.type}
                                            </>
                                        )}
                                    </Button>
                                    <Button variant="outline" size="sm">
                                        Details
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}