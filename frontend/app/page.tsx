'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import SearchBar from '@/components/SearchBar'
import WalletGuard from '@/components/WalletGuard'
import { BarChart3, Shield, TrendingUp, ExternalLink } from 'lucide-react'

interface DomainResult {
    name: string
    tld: string
    length: number
    brandability: number
    memorability: number
    linguistic: number
    market: number
    overall: number
    recommendation: string
    reasoning: string
    estimatedPriceMin: number
    estimatedPriceMax: number
    tokenized: boolean
    onChainActivity: number
    socialMentions: number
    aiModel: string
    confidence: number
}

// Domain Results Component
function DomainResults({ query }: { query: string }) {
    const [results, setResults] = useState<DomainResult[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        async function fetchResults() {
            if (!query) return

            setLoading(true)
            try {
                const response = await fetch(`/api/proxy/domains/search?q=${encodeURIComponent(query)}`)
                const data = await response.json()
                console.log('Search results:', data) // Debug log
                setResults(data.domains || [])
            } catch (error) {
                console.error('Search error:', error)
                setResults([])
            } finally {
                setLoading(false)
            }
        }

        fetchResults()
    }, [query])

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto mt-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Analyzing "{query}" with AI...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (results.length === 0) {
        return (
            <div className="max-w-6xl mx-auto mt-8">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                    <p className="text-gray-600">No results found for "{query}"</p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto mt-8">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Analysis Results</h2>
                <p className="text-gray-600">{results.length} domain variations analyzed</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((domain, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => router.push(`/domain/${domain.name}`)}
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{domain.name}</h3>
                                <div className="flex items-center space-x-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${domain.overall >= 80 ? 'text-green-600 bg-green-50' :
                                        domain.overall >= 60 ? 'text-yellow-600 bg-yellow-50' :
                                            'text-red-600 bg-red-50'
                                        }`}>
                                        Score: {domain.overall}
                                    </span>
                                    {domain.tokenized && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                                            Tokenized
                                        </span>
                                    )}
                                </div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-gray-400" />
                        </div>

                        {/* Price Range */}
                        <div className="mb-4">
                            <span className="text-sm text-gray-500">Est. Value: </span>
                            <span className="text-lg font-bold text-gray-900">
                                ${domain.estimatedPriceMin.toLocaleString()} - ${domain.estimatedPriceMax.toLocaleString()}
                            </span>
                        </div>

                        {/* Scores Grid */}
                        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                            <div>
                                <span className="text-gray-500">Brandability:</span>
                                <span className="ml-1 font-medium">{domain.brandability}/100</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Market:</span>
                                <span className="ml-1 font-medium">{domain.market}/100</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Length:</span>
                                <span className="ml-1 font-medium">{domain.length} chars</span>
                            </div>
                            <div>
                                <span className="text-gray-500">TLD:</span>
                                <span className="ml-1 font-medium">{domain.tld}</span>
                            </div>
                        </div>

                        {/* Activity */}
                        {domain.onChainActivity > 0 && (
                            <div className="mb-4 pt-3 border-t border-gray-100">
                                <span className="text-sm text-gray-500">Activity: </span>
                                <span className="text-sm font-medium text-primary-600">{domain.onChainActivity} transactions</span>
                            </div>
                        )}

                        {/* Recommendation */}
                        <div className="mb-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${domain.recommendation === 'BUY' ? 'bg-green-100 text-green-800' :
                                domain.recommendation === 'HOLD' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                {domain.recommendation}
                            </span>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/domain/${domain.name}`)
                            }}
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                            View Details
                        </button>

                        {/* AI Model Info */}
                        <div className="mt-2 text-xs text-gray-400 text-center">
                            Powered by {domain.aiModel} • {Math.round(domain.confidence * 100)}% confidence
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// Search Results Wrapper
function SearchResultsWrapper() {
    const searchParams = useSearchParams()
    const searchQuery = searchParams.get('search')

    if (!searchQuery) return null

    return <DomainResults query={searchQuery} />
}

export default function Home() {
    const router = useRouter()
    const [isSearching, setIsSearching] = useState(false)

    const handleSearch = async (query: string) => {
        setIsSearching(true)

        try {
            const cleanQuery = query.trim().toLowerCase()

            if (cleanQuery) {
                router.push(`/?search=${encodeURIComponent(cleanQuery)}`)
            }
        } catch (error) {
            console.error('Search error:', error)
        } finally {
            setIsSearching(false)
        }
    }

    return (
        <WalletGuard message="Connect your wallet to start analyzing domains with AI-powered insights">
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <div className="container mx-auto px-6 py-12">
                    {/* Hero Section */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                            Domain Intelligence <span className="text-primary-600">Powered by AI</span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                            Discover undervalued domains, analyze market trends, and make data-driven investments with our advanced AI scoring engine integrated with Doma Protocol.
                        </p>
                    </div>

                    {/* Search Bar Section */}
                    <div className="max-w-4xl mx-auto mb-16">
                        <Suspense fallback={
                            <div className="flex items-center justify-center p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                            </div>
                        }>
                            <SearchBar onSearch={handleSearch} disabled={isSearching} />
                        </Suspense>
                    </div>

                    {/* Search Results */}
                    <Suspense fallback={null}>
                        <SearchResultsWrapper />
                    </Suspense>

                    {/* Features Section - Only show if no search results */}
                    <Suspense fallback={null}>
                        <FeaturesSection />
                    </Suspense>
                </div>
            </div>
        </WalletGuard>
    )
}

// Features Section Component
function FeaturesSection() {
    const searchParams = useSearchParams()
    const hasSearch = searchParams.get('search')

    if (hasSearch) return null

    return (
        <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="text-center p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/20 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <BarChart3 className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">AI-Powered Scoring</h3>
                <p className="text-gray-600 leading-relaxed">
                    Advanced algorithms analyze linguistic patterns, market trends, and on-chain data to provide accurate domain valuations
                </p>
            </div>

            <div className="text-center p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/20 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <Shield className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">On-Chain Integration</h3>
                <p className="text-gray-600 leading-relaxed">
                    Real-time data from Doma Protocol for accurate tokenized domain analysis and blockchain verification
                </p>
            </div>

            <div className="text-center p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/20 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <TrendingUp className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Market Insights</h3>
                <p className="text-gray-600 leading-relaxed">
                    Identify undervalued opportunities, track portfolio performance, and get AI-powered trading recommendations
                </p>
            </div>
        </div>
    )
}