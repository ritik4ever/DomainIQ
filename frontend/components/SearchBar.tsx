'use client'

import { useState, useMemo } from 'react'
import { Search, Loader2 } from 'lucide-react'

interface DomainResult {
    domain: string
    name: string
    tld: string
    brandability: number
    memorability: number
    overall: number
    recommendation: string
    reasoning: string
    estimatedPriceMin: number
    estimatedPriceMax: number
    confidence: number
    aiPowered: boolean
    tokenized: boolean
    onChainActivity: number
    timestamp: string
    error?: string
}

interface SearchBarProps {
    onSearch: (query: string) => void
    onResults?: (results: DomainResult[]) => void
    disabled?: boolean
    placeholder?: string
    showResults?: boolean
}

export default function SearchBar({
    onSearch,
    onResults,
    disabled = false,
    placeholder = "Enter domain name...",
    showResults = true
}: SearchBarProps) {
    const [query, setQuery] = useState('')
    const [searchResults, setSearchResults] = useState<DomainResult[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)

    // Debounced search function
    const debouncedSearch = useMemo(() => {
        const searchFunction = async (searchQuery: string) => {
            if (!searchQuery.trim()) {
                setSearchResults([])
                setHasSearched(false)
                return
            }

            setIsLoading(true)
            setHasSearched(true)

            try {
                console.log(`🔍 Searching for: ${searchQuery}`)

                const response = await fetch(`/api/proxy/domains/search?q=${encodeURIComponent(searchQuery)}`)
                const data = await response.json()

                console.log(`📊 Search response:`, data)

                if (data.domains && data.domains.length > 0) {
                    setSearchResults(data.domains)
                    onResults?.(data.domains)
                } else if (data.results && data.results.length > 0) {
                    setSearchResults(data.results)
                    onResults?.(data.results)
                } else {
                    setSearchResults([])
                    onResults?.([])
                }

                // Call original onSearch callback
                onSearch(searchQuery)

            } catch (error) {
                console.error('Search failed:', error)
                setSearchResults([])
                onResults?.([])

                // Still call onSearch for compatibility
                onSearch(searchQuery)
            } finally {
                setIsLoading(false)
            }
        }

        // Debounce with 800ms delay
        let timeoutId: NodeJS.Timeout
        return (searchQuery: string) => {
            clearTimeout(timeoutId)
            timeoutId = setTimeout(() => searchFunction(searchQuery), 800)
        }
    }, [onSearch, onResults])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (query.trim() && !disabled) {
            // Clear debounce timeout and search immediately
            setIsLoading(true)
            debouncedSearch(query.trim())
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setQuery(value)

        // Trigger debounced search on input change
        debouncedSearch(value)
    }

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Search Form */}
            <form onSubmit={handleSubmit} className="w-full">
                <div className="relative">
                    <input
                        type="text"
                        value={query}
                        onChange={handleInputChange}
                        placeholder={placeholder}
                        disabled={disabled}
                        className="w-full h-14 pl-6 pr-14 text-lg rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm disabled:opacity-50 transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!query.trim() || disabled || isLoading}
                        className="absolute right-2 top-2 h-10 w-10 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 text-white animate-spin" />
                        ) : (
                            <Search className="w-5 h-5 text-white" />
                        )}
                    </button>
                </div>
            </form>

            {/* Search Results */}
            {showResults && (
                <div className="mt-6">
                    {/* Loading State */}
                    {isLoading && (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                            <p className="mt-2 text-gray-600">Analyzing domains...</p>
                            <p className="text-sm text-gray-500">AI-powered analysis in progress</p>
                        </div>
                    )}

                    {/* No Results State */}
                    {!isLoading && hasSearched && query && searchResults.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-600">No results found for "{query}"</p>
                            <p className="text-sm text-gray-500 mt-1">Try a different search term</p>
                        </div>
                    )}

                    {/* Results Grid */}
                    {!isLoading && searchResults.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Domain Analysis Results ({searchResults.length})
                                </h3>
                                <div className="text-sm text-gray-500">
                                    {searchResults.filter(r => r.aiPowered).length > 0 && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                            AI-Powered
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="grid gap-4">
                                {searchResults.map((result, index) => (
                                    <DomainResultCard key={`${result.name}-${index}`} domain={result} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// Domain Result Card Component
function DomainResultCard({ domain }: { domain: DomainResult }) {
    const getRecommendationColor = (recommendation: string) => {
        switch (recommendation?.toUpperCase()) {
            case 'STRONG_BUY':
                return 'bg-green-100 text-green-800'
            case 'BUY':
                return 'bg-blue-100 text-blue-800'
            case 'HOLD':
                return 'bg-yellow-100 text-yellow-800'
            case 'RESEARCH':
                return 'bg-purple-100 text-purple-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const formatPrice = (price: number) => {
        if (price >= 1000) {
            return `$${(price / 1000).toFixed(1)}k`
        }
        return `$${price}`
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h4 className="text-xl font-bold text-gray-900">{domain.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRecommendationColor(domain.recommendation)}`}>
                            {domain.recommendation}
                        </span>
                        {domain.aiPowered && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800">
                                AI Analysis
                            </span>
                        )}
                        {domain.tokenized && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-emerald-100 text-emerald-800">
                                Tokenized
                            </span>
                        )}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{domain.overall}/100</div>
                    <div className="text-sm text-gray-500">Overall Score</div>
                </div>
            </div>

            {/* Scores Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{domain.brandability}</div>
                    <div className="text-sm text-gray-500">Brandability</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{domain.memorability}</div>
                    <div className="text-sm text-gray-500">Market</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{Math.round(domain.confidence * 100)}%</div>
                    <div className="text-sm text-gray-500">Confidence</div>
                </div>
                <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{domain.onChainActivity}</div>
                    <div className="text-sm text-gray-500">Activity</div>
                </div>
            </div>

            {/* Price Range */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-3">
                <div>
                    <div className="text-sm text-gray-500">Estimated Value</div>
                    <div className="font-semibold text-gray-900">
                        {formatPrice(domain.estimatedPriceMin)} - {formatPrice(domain.estimatedPriceMax)}
                    </div>
                </div>
                {domain.tokenized && (
                    <div className="text-right">
                        <div className="text-sm text-gray-500">On-chain Events</div>
                        <div className="font-semibold text-gray-900">{domain.onChainActivity}</div>
                    </div>
                )}
            </div>

            {/* Reasoning */}
            <p className="text-sm text-gray-600 mb-3">{domain.reasoning}</p>

            {/* Error Display */}
            {domain.error && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-800">
                        <span className="font-medium">Limited Analysis:</span> {domain.error}
                    </p>
                </div>
            )}
        </div>
    )
}