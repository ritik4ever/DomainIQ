'use client'

import { useState } from 'react'
import Link from 'next/link'
import { TrendingUp, TrendingDown, Minus, ExternalLink, Heart, HeartHandshake } from 'lucide-react'
import { useWatchlist } from '@/hooks/useWatchlist'

interface DomainCardProps {
    domain: {
        name: string
        score: number
        trend: 'up' | 'down' | 'stable'
        price?: string
        tld: string
        length: number
        brandability: number
        memorability: number
        tokenized: boolean
        onChainActivity?: number
    }
}

export default function DomainCard({ domain }: DomainCardProps) {
    const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist()
    const [isWatched, setIsWatched] = useState(isInWatchlist(domain.name))

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 bg-green-50'
        if (score >= 60) return 'text-yellow-600 bg-yellow-50'
        return 'text-red-600 bg-red-50'
    }

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />
            case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />
            default: return <Minus className="w-4 h-4 text-gray-400" />
        }
    }

    // Updated working URLs (since testnet is down, use mainnet for demo)
    const getDomaUrl = (domainName: string) => {
        return `https://dashboard-testnet.doma.xyz`
    }
    const handleWatchlistToggle = async () => {
        if (isWatched) {
            if (await removeFromWatchlist(domain.name)) {
                setIsWatched(false)
            }
        } else {
            if (await addToWatchlist(domain.name, domain.score, domain.price)) {
                setIsWatched(true)
            }
        }
    }

    return (
        <div className="card hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {domain.name}
                    </h3>
                    <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColor(domain.score)}`}>
                            Score: {domain.score}
                        </span>
                        {getTrendIcon(domain.trend)}
                        {domain.tokenized && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                                Tokenized
                            </span>
                        )}
                    </div>
                </div>
                <Link href={`/domain/${domain.name}`} className="text-primary-600 hover:text-primary-700">
                    <ExternalLink size={16} />
                </Link>
            </div>

            {domain.price && (
                <div className="mb-4">
                    <span className="text-2xl font-bold text-gray-900">{domain.price}</span>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                    <span className="text-gray-500">Length:</span>
                    <span className="ml-1 font-medium">{domain.length} chars</span>
                </div>
                <div>
                    <span className="text-gray-500">TLD:</span>
                    <span className="ml-1 font-medium">{domain.tld}</span>
                </div>
                <div>
                    <span className="text-gray-500">Brandability:</span>
                    <span className="ml-1 font-medium">{domain.brandability}/100</span>
                </div>
                <div>
                    <span className="text-gray-500">Memorability:</span>
                    <span className="ml-1 font-medium">{domain.memorability}/100</span>
                </div>
            </div>

            {domain.onChainActivity && domain.onChainActivity > 0 && (
                <div className="mb-4 pt-4 border-t border-gray-200">
                    <span className="text-sm text-gray-500">On-chain Activity:</span>
                    <span className="ml-1 text-sm font-medium text-primary-600">{domain.onChainActivity} transactions</span>
                </div>
            )}

            <div className="flex space-x-2">
                <Link href={`/domain/${domain.name}`} className="flex-1">
                    <button className="w-full btn-primary text-sm py-2">
                        View Details
                    </button>
                </Link>
                <button
                    onClick={handleWatchlistToggle}
                    className={`flex-1 text-sm py-2 px-3 rounded-lg border transition-colors flex items-center justify-center ${isWatched
                        ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                >
                    {isWatched ? (
                        <>
                            <HeartHandshake className="w-4 h-4 mr-1" />
                            Watched
                        </>
                    ) : (
                        <>
                            <Heart className="w-4 h-4 mr-1" />
                            Watch
                        </>
                    )}
                </button>
            </div>

            <div className="mt-2 flex space-x-2">
                <a
                    href={getDomaUrl(domain.name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                >
                    <button className="w-full btn-outline text-xs py-2 flex items-center justify-center">
                        View on Doma
                        <ExternalLink className="w-3 h-3 ml-1" />
                    </button>
                </a>
            </div>
        </div>
    )
}