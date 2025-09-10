'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ScoreChart from '@/components/ScoreChart'
import DomainCard from '@/components/DomainCard'
import RealTimeUpdates from '@/components/RealTimeUpdates'
import TradingRecommendations from '@/components/TradingRecommendations'
import WalletGuard from '@/components/WalletGuard'
import { BarChart3, TrendingUp, Eye, DollarSign, Activity, Target } from 'lucide-react'

interface DomainPortfolio {
    name: string
    score: number
    trend: 'up' | 'down' | 'stable'
    price: string
    tld: string
    length: number
    brandability: number
    memorability: number
    tokenized: boolean
    onChainActivity: number
}

export default function Dashboard() {
    const { address } = useAccount()
    const [portfolioData, setPortfolioData] = useState<DomainPortfolio[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (address) {
            setTimeout(() => {
                setPortfolioData([
                    {
                        name: 'crypto.io',
                        score: 92,
                        trend: 'up',
                        price: '$12,500',
                        tld: '.io',
                        length: 6,
                        brandability: 88,
                        memorability: 94,
                        tokenized: true,
                        onChainActivity: 24
                    },
                    {
                        name: 'defi.com',
                        score: 85,
                        trend: 'stable',
                        price: '$8,750',
                        tld: '.com',
                        length: 4,
                        brandability: 92,
                        memorability: 89,
                        tokenized: true,
                        onChainActivity: 18
                    }
                ])
                setLoading(false)
            }, 1000)
        }
    }, [address])

    const stats = [
        { title: 'Portfolio Value', value: '$24,450', icon: DollarSign, change: '+12.5%' },
        { title: 'Avg AI Score', value: '88.5', icon: BarChart3, change: '+3.2' },
        { title: 'Active Trades', value: '5', icon: Activity, change: '+2' },
        { title: 'Success Rate', value: '78%', icon: Target, change: '+5.2%' },
    ]

    return (
        <WalletGuard message="Connect your wallet to access your personalized domain portfolio dashboard">
            {loading ? (
                <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            ) : (
                <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                    <div className="container mx-auto px-6 py-8">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">AI-Powered Portfolio Dashboard</h1>
                            <p className="text-gray-600">Connected: {address}</p>
                        </div>

                        <div className="grid md:grid-cols-4 gap-6 mb-8">
                            {stats.map((stat, index) => (
                                <Card key={index}>
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-gray-600">{stat.title}</p>
                                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                            </div>
                                            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                                                <stat.icon className="w-6 h-6 text-primary-600" />
                                            </div>
                                        </div>
                                        <div className="mt-4 flex items-center">
                                            <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                                            <span className="text-sm text-gray-500 ml-1">vs last month</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        <Tabs defaultValue="overview" className="space-y-6">
                            <TabsList>
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="trading">AI Trading</TabsTrigger>
                                <TabsTrigger value="realtime">Live Feed</TabsTrigger>
                                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview">
                                <div className="grid lg:grid-cols-2 gap-8">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Portfolio Performance</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ScoreChart />
                                        </CardContent>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Market Intelligence</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">AI domains trend</span>
                                                    <span className="text-sm font-medium text-green-600">+25.3%</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">DeFi domains trend</span>
                                                    <span className="text-sm font-medium text-green-600">+18.7%</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">Tokenization rate</span>
                                                    <span className="text-sm font-medium text-blue-600">67.2%</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">Avg transaction volume</span>
                                                    <span className="text-sm font-medium text-primary-600">$45.2K</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            <TabsContent value="trading">
                                <TradingRecommendations walletAddress={address} />
                            </TabsContent>

                            <TabsContent value="realtime">
                                <RealTimeUpdates />
                            </TabsContent>

                            <TabsContent value="portfolio">
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {portfolioData.map((domain, index) => (
                                        <DomainCard key={index} domain={domain} />
                                    ))}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            )}
        </WalletGuard>
    )
}