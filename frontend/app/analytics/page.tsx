'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, BarChart3, DollarSign, Activity } from 'lucide-react'
import ScoreChart from '@/components/ScoreChart'

interface MarketData {
    totalMarketCap?: string
    dailyVolume?: string
    tokenizedDomains?: number
    activeListings?: number
    topSales?: Array<{
        domain: string
        price: string
        date: string
    }>
    trendingCategories?: Array<{
        name: string
        growth: string
    }>
}

export default function AnalyticsPage() {
    const [marketData, setMarketData] = useState<MarketData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchMarketData = async () => {
            try {
                const response = await fetch('/api/proxy/analytics/market')
                const data = await response.json()
                setMarketData(data)
            } catch (error) {
                console.error('Error fetching market data:', error)
                // Set fallback data for demo
                setMarketData({
                    totalMarketCap: '$2.1B',
                    dailyVolume: '$12.5M',
                    tokenizedDomains: 45230,
                    activeListings: 8920,
                    topSales: [
                        { domain: 'finance.io', price: '$125,000', date: '2024-09-08' },
                        { domain: 'crypto.ai', price: '$89,000', date: '2024-09-07' },
                        { domain: 'defi.com', price: '$65,000', date: '2024-09-06' }
                    ],
                    trendingCategories: [
                        { name: 'AI & Technology', growth: '+25.3%' },
                        { name: 'DeFi & Finance', growth: '+18.7%' },
                        { name: 'Gaming & NFT', growth: '+12.1%' }
                    ]
                })
            } finally {
                setLoading(false)
            }
        }

        fetchMarketData()
    }, [])

    const stats = [
        {
            title: 'Market Cap',
            value: marketData?.totalMarketCap || '$2.1B',
            icon: DollarSign,
            change: '+15.3%'
        },
        {
            title: 'Daily Volume',
            value: marketData?.dailyVolume || '$12.5M',
            icon: Activity,
            change: '+8.7%'
        },
        {
            title: 'Tokenized Domains',
            value: marketData?.tokenizedDomains?.toLocaleString() || '45,230',
            icon: BarChart3,
            change: '+22.4%'
        },
        {
            title: 'Active Listings',
            value: marketData?.activeListings?.toLocaleString() || '8,920',
            icon: TrendingUp,
            change: '+12.1%'
        }
    ]

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="container mx-auto px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Market Analytics</h1>
                    <p className="text-gray-600">Comprehensive insights into the tokenized domain market</p>
                </div>

                {/* Stats Grid */}
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

                <div className="grid lg:grid-cols-2 gap-8 mb-8">
                    {/* Top Sales */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Top Sales</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {(marketData?.topSales || []).map((sale, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div>
                                            <h4 className="font-medium text-gray-900">{sale.domain}</h4>
                                            <p className="text-sm text-gray-500">{sale.date}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-gray-900">{sale.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Trending Categories */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Trending Categories</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {(marketData?.trendingCategories || []).map((category, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <span className="text-gray-700">{category.name}</span>
                                        <Badge variant="success">{category.growth}</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Market Performance Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Market Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80">
                            <ScoreChart />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}