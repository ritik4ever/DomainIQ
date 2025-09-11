'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    TrendingUp,
    Wallet,
    Share,
    Clock,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    RefreshCw,
    Coins,
    Activity
} from 'lucide-react'
import { testDeFiFlow } from '@/lib/defi-test-utils'
import { defiWebSocketService } from '@/lib/defi-websocket-service'

interface DeFiStats {
    totalValueLocked: number
    activeStaking: number
    stakedValue: number
    activeFractionalization: number
    fractionalizedValue: number
    liquidityPools: number
    poolLiquidity: number
    totalYieldGenerated: number
    averageAPY: number
}

interface StakingPosition {
    domain: string
    principal: number
    apy: number
    currentYield: number
    daysStaked: number
    stakingPeriod: number
    maturityProgress: number
    status: string
}

interface FractionalizedAsset {
    domain: string
    totalShares: number
    availableShares: number
    sharePrice: number
    totalValuation: number
    holders: number
}

export default function DeFiDashboard() {
    const [stats, setStats] = useState<DeFiStats | null>(null)
    const [portfolio, setPortfolio] = useState<any>(null)
    const [opportunities, setOpportunities] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)

    // Add a test button or call on mount
    const handleTest = () => {
        testDeFiFlow()
    }

    // Or test automatically when component mounts
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            testDeFiFlow()
        }
    }, [])

    const loadDashboardData = async () => {
        try {
            setIsRefreshing(true)

            // Load DeFi statistics
            const statsResponse = await fetch('/api/proxy/defi/stats')
            const statsData = await statsResponse.json()
            if (statsData.success) {
                setStats(statsData.stats)
            }

            // Load user portfolio (using dummy address for demo)
            const portfolioResponse = await fetch('/api/proxy/defi/portfolio/0xF2efFb61b3895Faa93613a9b731DA9292A35Bce1')
            const portfolioData = await portfolioResponse.json()
            if (portfolioData.success) {
                setPortfolio(portfolioData.portfolio)
            }

            // Load opportunities
            const opportunitiesResponse = await fetch('/api/proxy/defi/opportunities')
            const opportunitiesData = await opportunitiesResponse.json()
            if (opportunitiesData.success) {
                setOpportunities(opportunitiesData)
            }

        } catch (error) {
            console.error('Dashboard load error:', error)
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }

    useEffect(() => {
        loadDashboardData()
    }, [])

    // Add WebSocket connection
    useEffect(() => {
        // Connect to WebSocket
        defiWebSocketService.connect()

        // Listen for DeFi updates
        const handleDeFiUpdate = (event: any) => {
            console.log('Real-time DeFi update:', event.detail)
            // Refresh dashboard data
            loadDashboardData()
        }

        window.addEventListener('defi-update', handleDeFiUpdate)

        // Cleanup
        return () => {
            window.removeEventListener('defi-update', handleDeFiUpdate)
            defiWebSocketService.disconnect()
        }
    }, [])

    const claimRewards = async () => {
        try {
            setIsRefreshing(true)
            const response = await fetch('/api/proxy/defi/claim-rewards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userAddress: '0xF2efFb61b3895Faa93613a9b731DA9292A35Bce1' })
            })

            const result = await response.json()
            if (result.success) {
                alert(`Successfully claimed $${result.totalRewards} in rewards!`)
                loadDashboardData() // Refresh data
            } else {
                alert(result.message || 'No rewards available')
            }
        } catch (error) {
            console.error('Claim rewards error:', error)
            alert('Failed to claim rewards')
        } finally {
            setIsRefreshing(false)
        }
    }

    if (isLoading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center h-64">
                    <RefreshCw className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Loading DeFi Dashboard...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto p-6 space-y-6">

                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">DeFi Dashboard</h1>
                        <p className="text-gray-600">Manage your domain DeFi positions and opportunities</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={claimRewards}
                            disabled={isRefreshing}
                            className="flex items-center gap-2"
                        >
                            <Coins className="h-4 w-4" />
                            Claim Rewards
                        </Button>
                        <Button
                            variant="outline"
                            onClick={loadDashboardData}
                            disabled={isRefreshing}
                        >
                            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                        {process.env.NODE_ENV === 'development' && (
                            <Button
                                variant="outline"
                                onClick={handleTest}
                                className="flex items-center gap-2"
                            >
                                <Activity className="h-4 w-4" />
                                Test DeFi
                            </Button>
                        )}
                    </div>
                </div>

                {/* Key Metrics */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Total Value Locked</p>
                                        <p className="text-2xl font-bold">${stats.totalValueLocked.toLocaleString()}</p>
                                    </div>
                                    <Wallet className="h-8 w-8 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Active Staking</p>
                                        <p className="text-2xl font-bold">{stats.activeStaking}</p>
                                        <p className="text-xs text-green-600">${stats.stakedValue.toLocaleString()} staked</p>
                                    </div>
                                    <TrendingUp className="h-8 w-8 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Fractionalized Assets</p>
                                        <p className="text-2xl font-bold">{stats.activeFractionalization}</p>
                                        <p className="text-xs text-blue-600">${stats.fractionalizedValue.toLocaleString()} value</p>
                                    </div>
                                    <Share className="h-8 w-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">Yield Generated</p>
                                        <p className="text-2xl font-bold">${stats.totalYieldGenerated}</p>
                                        <p className="text-xs text-purple-600">{stats.averageAPY.toFixed(1)}% avg APY</p>
                                    </div>
                                    <DollarSign className="h-8 w-8 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Main Content Tabs */}
                <Tabs defaultValue="portfolio" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="portfolio">My Portfolio</TabsTrigger>
                        <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    </TabsList>

                    {/* Portfolio Tab */}
                    <TabsContent value="portfolio" className="space-y-4">
                        {portfolio && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                                {/* Staking Positions */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5" />
                                            Staking Positions
                                        </CardTitle>
                                        <CardDescription>
                                            Total staked: ${portfolio.totalStaked?.toLocaleString() || '0'}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {portfolio.staking?.length > 0 ? (
                                            portfolio.staking.map((position: StakingPosition, index: number) => (
                                                <div key={index} className="border rounded-lg p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h4 className="font-medium">{position.domain}</h4>
                                                            <p className="text-sm text-gray-600">
                                                                ${position.principal.toLocaleString()} staked
                                                            </p>
                                                        </div>
                                                        <Badge variant={position.status === 'active' ? 'default' : 'secondary'}>
                                                            {position.apy * 100}% APY
                                                        </Badge>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-sm">
                                                            <span>Progress</span>
                                                            <span>{position.maturityProgress}%</span>
                                                        </div>
                                                        <Progress value={position.maturityProgress} className="h-2" />
                                                        <div className="flex justify-between text-sm">
                                                            <span>Current Yield</span>
                                                            <span className="text-green-600 font-medium">
                                                                ${position.currentYield}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between text-sm text-gray-600">
                                                            <span>{position.daysStaked} days staked</span>
                                                            <span>{position.stakingPeriod - position.daysStaked} days remaining</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 text-center py-8">No active staking positions</p>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Fractionalized Assets */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Share className="h-5 w-5" />
                                            Fractionalized Assets
                                        </CardTitle>
                                        <CardDescription>
                                            Assets available for fractional ownership
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {portfolio.fractionalized?.length > 0 ? (
                                            portfolio.fractionalized.map((asset: FractionalizedAsset, index: number) => (
                                                <div key={index} className="border rounded-lg p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <h4 className="font-medium">{asset.domain}</h4>
                                                            <p className="text-sm text-gray-600">
                                                                ${asset.totalValuation.toLocaleString()} total value
                                                            </p>
                                                        </div>
                                                        <Badge variant="outline">
                                                            ${asset.sharePrice.toFixed(2)}/share
                                                        </Badge>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-gray-600">Available Shares</span>
                                                            <p className="font-medium">{asset.availableShares.toLocaleString()}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600">Total Holders</span>
                                                            <p className="font-medium">{asset.holders}</p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-3">
                                                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                                                            <span>Sold</span>
                                                            <span>{((asset.totalShares - asset.availableShares) / asset.totalShares * 100).toFixed(1)}%</span>
                                                        </div>
                                                        <Progress
                                                            value={(asset.totalShares - asset.availableShares) / asset.totalShares * 100}
                                                            className="h-1"
                                                        />
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 text-center py-8">No fractionalized assets</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Portfolio Summary */}
                        {portfolio && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Portfolio Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">
                                                ${portfolio.totalStaked?.toLocaleString() || '0'}
                                            </div>
                                            <div className="text-sm text-gray-600">Total Staked</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600">
                                                ${portfolio.totalYield?.toFixed(2) || '0.00'}
                                            </div>
                                            <div className="text-sm text-gray-600">Accrued Yield</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-purple-600">
                                                ${portfolio.portfolioValue?.toLocaleString() || '0'}
                                            </div>
                                            <div className="text-sm text-gray-600">Total Portfolio Value</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Opportunities Tab */}
                    <TabsContent value="opportunities" className="space-y-4">
                        {opportunities && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                                {/* Staking Opportunities */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Staking Opportunities</CardTitle>
                                        <CardDescription>{opportunities.staking?.length || 0} available</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {opportunities.staking?.map((opp: any, index: number) => (
                                            <div key={index} className="border rounded-lg p-3">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-medium">{opp.extension}</span>
                                                    <Badge
                                                        variant={opp.priority === 'high' ? 'default' : 'outline'}
                                                    >
                                                        {opp.priority}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">{opp.opportunity}</p>
                                                <p className="text-xs text-green-600">{opp.potential}</p>
                                            </div>
                                        )) || <p className="text-gray-500">No staking opportunities</p>}
                                    </CardContent>
                                </Card>

                                {/* Fractionalization Opportunities */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Fractionalization</CardTitle>
                                        <CardDescription>{opportunities.fractional?.length || 0} available</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {opportunities.fractional?.map((opp: any, index: number) => (
                                            <div key={index} className="border rounded-lg p-3">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-medium">{opp.domain}</span>
                                                    <Badge
                                                        variant={opp.priority === 'high' ? 'default' : 'outline'}
                                                    >
                                                        {opp.priority}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">{opp.opportunity}</p>
                                                <p className="text-xs text-blue-600">{opp.potential}</p>
                                            </div>
                                        )) || <p className="text-gray-500">No fractionalization opportunities</p>}
                                    </CardContent>
                                </Card>

                                {/* Liquidity Opportunities */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Liquidity Pools</CardTitle>
                                        <CardDescription>{opportunities.liquidity?.length || 0} available</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {opportunities.liquidity?.map((opp: any, index: number) => (
                                            <div key={index} className="border rounded-lg p-3">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-medium">{opp.domain}</span>
                                                    <Badge
                                                        variant={opp.priority === 'high' ? 'default' : 'outline'}
                                                    >
                                                        {opp.priority}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">{opp.opportunity}</p>
                                                <p className="text-xs text-purple-600">{opp.potential}</p>
                                            </div>
                                        )) || <p className="text-gray-500">No liquidity opportunities</p>}
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </TabsContent>

                    {/* Analytics Tab */}
                    <TabsContent value="analytics" className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* Performance Chart Placeholder */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Portfolio Performance</CardTitle>
                                    <CardDescription>30-day performance overview</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                                        <div className="text-center">
                                            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                            <p className="text-gray-500">Performance chart coming soon</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Yield Analytics */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Yield Analytics</CardTitle>
                                    <CardDescription>Breakdown by asset type</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span>.ai domains</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                                                </div>
                                                <span className="text-sm font-medium">12%</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>.crypto domains</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                                                </div>
                                                <span className="text-sm font-medium">15%</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span>.defi domains</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                                    <div className="bg-purple-600 h-2 rounded-full" style={{ width: '90%' }}></div>
                                                </div>
                                                <span className="text-sm font-medium">18%</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}