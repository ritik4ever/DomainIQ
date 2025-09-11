'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ExternalLink, TrendingUp, Heart, HeartHandshake, CheckCircle, Zap, DollarSign, Activity } from 'lucide-react'
import Link from 'next/link'
import { useWatchlist } from '@/hooks/useWatchlist'
import ScoreChart from '@/components/ScoreChart'
import { TradingExecution } from '@/components/TradingExecution'
import { LiveOpportunities } from '@/components/LiveOpportunities'
import { DeFiActionButtons } from '@/components/DeFiActionButtons'
import { TransactionResultModal } from '@/components/TransactionResultModal'
import { testDeFiFlow } from '@/lib/defi-test-utils'
import { trackDeFiVolume } from '@/lib/volume-tracking-utils'


interface DomainData {
    name: string
    score?: number
    brandability?: number
    memorability?: number
    linguistic?: number
    market?: number
    price?: string
    tokenized?: boolean
    onChainActivity?: number
    owner?: string
    networkId?: string
    domaScore?: number
    estimatedValue?: number
    recommendations?: Array<{
        type: string
        message: string
    }>
}

function DomainDetailPage() {
    const params = useParams()
    const { address, isConnected } = useAccount()
    const domainName = params.name as string
    const [domainData, setDomainData] = useState<DomainData | null>(null)
    const [loading, setLoading] = useState(true)
    const [watchlistLoading, setWatchlistLoading] = useState(false)
    const [actionMessage, setActionMessage] = useState('')
    const [opportunities, setOpportunities] = useState<any[]>([])
    const [opportunitiesLoading, setOpportunitiesLoading] = useState(false)
    const [networkStatus, setNetworkStatus] = useState<any>(null)
    const [verificationResult, setVerificationResult] = useState<any>(null)
    const [transactionResult, setTransactionResult] = useState<any>(null)
    const [showTransactionModal, setShowTransactionModal] = useState(false)

    const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist()
    const isWatched = isInWatchlist(domainName)

    // ADD THESE FUNCTIONS:
    const handleTest = () => {
        console.log(`Testing DeFi flow for domain: ${domainName}`)
        testDeFiFlow()
    }

    // Test automatically in development
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`Auto-testing DeFi for domain: ${domainName}`)
            testDeFiFlow()
        }
    }, [domainName])

    // ✅ Fetch network status on mount
    useEffect(() => {
        const fetchNetworkStatus = async () => {
            try {
                const response = await fetch('/api/proxy/domains/network-status')
                if (response.ok) {
                    const status = await response.json()
                    setNetworkStatus(status)
                }
            } catch (error) {
                console.error('Network status fetch failed:', error)
            }
        }

        fetchNetworkStatus()
        // Refresh every 30 seconds
        const interval = setInterval(fetchNetworkStatus, 30000)
        return () => clearInterval(interval)
    }, [])

    // ✅ Enhanced trade execution with verification
    const handleTradeExecution = async (domain: string, action: string, params: any) => {
        try {
            console.log(`Executing REAL ${action} for ${domain}`)

            const response = await fetch(`/api/proxy/domains/execute/${domain}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, parameters: params })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Execution failed')
            }

            // Verify real transactions
            if (data.realTransaction && data.txHash) {
                console.log(`Verifying real transaction: ${data.txHash}`)
                const verifyResponse = await fetch(`/api/proxy/domains/verify/${data.txHash}`)
                const verification = await verifyResponse.json()
                setVerificationResult(verification)
            }

            const result = {
                success: true,
                message: data.message,
                txHash: data.txHash,
                volume: data.volume,
                domain: domain,
                realTransaction: data.realTransaction,
                explorerUrl: data.explorerUrl,
                blockNumber: data.blockNumber
            }

            // Track DeFi volume
            trackDeFiVolume(result)

            return result
        } catch (error: any) {
            const errorMessage = error instanceof Error ? error.message : 'Transaction failed'
            console.error('Trade execution error:', error)
            throw new Error(errorMessage)
        }
    }

    const handleDeFiTransaction = (result: any) => {
        setTransactionResult(result)
        setShowTransactionModal(true)

        // Track DeFi volume
        if (result.success) {
            trackDeFiVolume({
                domain: params.domain,
                volume: result.volume,
                txHash: result.txHash
            })
        }

        // Optional: Update domain data after transaction
        // refreshDomainData()
    }

    const fetchOpportunities = async () => {
        setOpportunitiesLoading(true)
        try {
            const mockOpportunities = [
                {
                    type: 'TOKENIZATION',
                    title: 'Tokenization Opportunity',
                    description: `Convert ${domainName} to NFT on Doma Protocol for enhanced liquidity`,
                    action: 'TOKENIZE',
                    estimatedVolume: Math.floor(Math.random() * 10000 + 5000),
                    confidence: 0.85,
                    priority: 'HIGH',
                    timeframe: '1-3 days',
                    onChainActions: [
                        {
                            action: 'tokenize',
                            description: 'Mint domain NFT on Doma Protocol',
                            estimatedGas: 0.005,
                            estimatedCost: 50
                        }
                    ]
                },
                {
                    type: 'LISTING',
                    title: 'Marketplace Listing',
                    description: 'List on Doma marketplace for optimal price discovery',
                    action: 'CREATE_LISTING',
                    suggestedPrice: Math.floor(Math.random() * 15000 + 10000),
                    estimatedVolume: Math.floor(Math.random() * 15000 + 10000),
                    confidence: 0.75,
                    priority: 'MEDIUM',
                    timeframe: 'Immediate',
                    onChainActions: [
                        {
                            action: 'list',
                            description: 'Create marketplace listing',
                            estimatedGas: 0.003,
                            estimatedCost: 30
                        }
                    ]
                }
            ]
            setOpportunities(mockOpportunities)
        } catch (error) {
            console.error('Failed to fetch opportunities:', error)
            setOpportunities([])
        } finally {
            setOpportunitiesLoading(false)
        }
    }

    useEffect(() => {
        const fetchDomainDetails = async () => {
            try {
                setDomainData({
                    name: domainName,
                    score: 75,
                    brandability: 80,
                    memorability: 75,
                    linguistic: 70,
                    market: 65,
                    price: '$2,500',
                    tokenized: false,
                    onChainActivity: 0,
                    domaScore: 78,
                    estimatedValue: 2500
                })
                await fetchOpportunities()
            } catch (error) {
                console.error('Error fetching domain details:', error)
            } finally {
                setLoading(false)
            }
        }

        if (domainName) {
            fetchDomainDetails()
        }
    }, [domainName])

    const handleWatchlistToggle = async () => {
        if (!domainData) return

        setWatchlistLoading(true)
        setActionMessage('')

        try {
            let success = false
            if (isWatched) {
                success = await removeFromWatchlist(domainName)
                setActionMessage(success ? 'Removed from watchlist' : 'Failed to update watchlist')
            } else {
                success = await addToWatchlist(domainName, domainData.score, domainData.price)
                setActionMessage(success ? 'Added to watchlist' : 'Failed to update watchlist')
            }
            setTimeout(() => setActionMessage(''), 3000)
        } catch (error) {
            setActionMessage('Error updating watchlist')
            setTimeout(() => setActionMessage(''), 3000)
        } finally {
            setWatchlistLoading(false)
        }
    }

    const getExternalLinks = (domainName: string) => {
        return {
            doma: `https://testnet.doma.xyz/names/${domainName}`,
            domaMainnet: `https://doma.xyz/names/${domainName}`,
            whois: `https://who.is/whois/${domainName}`,
            namecheap: `https://www.namecheap.com/domains/registration/results/?domain=${domainName}`,
            sedo: `https://sedo.com/search/?partnerRequestId=&language=e&domain=${domainName}`,
            opensea: `https://opensea.io/collection/ethereum-name-service`,
            afternic: `https://www.afternic.com/domain/${domainName}`,
            dan: `https://dan.com/search?q=${domainName}`
        }
    }

    if (!isConnected) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
                <Card className="max-w-md w-full">
                    <CardHeader className="text-center">
                        <CardTitle className="text-xl">Wallet Required</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        <p className="text-gray-600">Connect your wallet to access AI-powered domain analysis</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Analyzing {domainName}</p>
                </div>
            </div>
        )
    }

    if (!domainData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Domain Not Found</h2>
                    <p className="text-gray-600 mb-4">Could not find details for {domainName}</p>
                    <Link href="/">
                        <Button>Back to Search</Button>
                    </Link>
                </div>
            </div>
        )
    }

    const links = getExternalLinks(domainName)

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <LiveOpportunities />

            <div className="container mx-auto px-6 py-8">
                {/* ✅ Show Network Status */}
                {networkStatus && (
                    <div className="mb-4 p-3 border rounded-lg">
                        <h5 className="font-semibold">Network Status</h5>
                        <div className="text-sm mt-1 space-y-1">
                            <div className="flex justify-between">
                                <span>Network:</span>
                                <span className="font-mono">{networkStatus.network}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Connected:</span>
                                <span className={networkStatus.connected ? 'text-green-600' : 'text-red-600'}>
                                    {networkStatus.connected ? '✅ Yes' : '❌ No'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Block:</span>
                                <span className="font-mono">#{networkStatus.blockNumber?.toString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Balance:</span>
                                <span className="font-mono">{networkStatus.walletBalance} ETH</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Can Execute:</span>
                                <span className={networkStatus.canExecuteTransactions ? 'text-green-600' : 'text-red-600'}>
                                    {networkStatus.canExecuteTransactions ? '✅ Yes' : '❌ No'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* ✅ Show Verification Result */}
                {verificationResult && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <h5 className="font-semibold text-green-900">Transaction Verification</h5>
                        <div className="text-sm text-green-700 mt-1">
                            <p>Status: {verificationResult.verified ? '✅ Verified' : '❌ Failed'}</p>
                            {verificationResult.txHash && <p>Tx Hash: {verificationResult.txHash}</p>}
                            {verificationResult.blockNumber && <p>Block: #{verificationResult.blockNumber}</p>}
                            {verificationResult.explorerUrl && (
                                <a href={verificationResult.explorerUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                                    View on Explorer
                                </a>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex items-center mb-8">
                    <Link href="/" className="mr-4">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-900">{domainData.name}</h1>
                        <div className="flex items-center space-x-2 mt-2">
                            <Badge variant={domainData.tokenized ? "default" : "secondary"}>
                                {domainData.tokenized ? "Tokenized on Doma" : "Available for Tokenization"}
                            </Badge>
                            <Badge variant="outline">
                                AI Score: {domainData.score || 75}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <TrendingUp className="w-5 h-5 mr-2" />
                                    AI Analysis
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-gray-900">Scores</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-sm text-gray-600">Brandability</span>
                                                    <span className="text-sm font-semibold">{domainData.brandability}/100</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-600 h-2 rounded-full"
                                                        style={{ width: `${domainData.brandability}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-gray-900">Doma Analysis</h4>
                                        <div className="space-y-3">
                                            <div>
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-sm text-gray-600">Activity</span>
                                                    <span className="text-sm font-semibold">{domainData.onChainActivity} txns</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <DollarSign className="w-5 h-5 mr-2" />
                                    Trading Opportunities
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {opportunitiesLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        <span className="ml-2 text-gray-600">Loading...</span>
                                    </div>
                                ) : (
                                    <TradingExecution
                                        domain={domainName}
                                        opportunities={opportunities}
                                        onExecute={handleTradeExecution}
                                    />
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Price Chart</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ScoreChart />
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Domain Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Length</span>
                                    <span className="font-medium">{domainData.name.split('.')[0].length} chars</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Price</span>
                                    <span className="font-medium text-green-600">{domainData.price}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Status</span>
                                    <span className="font-medium">Available</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <a href={links.doma} target="_blank" rel="noopener noreferrer" className="w-full">
                                    <Button variant="default" className="w-full">
                                        <Zap className="w-4 h-4 mr-2" />
                                        View on Doma
                                        <ExternalLink className="w-4 h-4 ml-2" />
                                    </Button>
                                </a>

                                <Button
                                    onClick={handleWatchlistToggle}
                                    disabled={watchlistLoading}
                                    className="w-full"
                                    variant={isWatched ? "outline" : "default"}
                                >
                                    {watchlistLoading ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                                    ) : (
                                        <>
                                            {isWatched ? (
                                                <HeartHandshake className="w-4 h-4 mr-2" />
                                            ) : (
                                                <Heart className="w-4 h-4 mr-2" />
                                            )}
                                        </>
                                    )}
                                    {isWatched ? 'Remove from Portfolio' : 'Add to Portfolio'}
                                </Button>

                                {/* ADD THIS TEST BUTTON (DEVELOPMENT ONLY): */}
                                {process.env.NODE_ENV === 'development' && (
                                    <Button
                                        variant="outline"
                                        onClick={handleTest}
                                        className="w-full"
                                    >
                                        <Activity className="w-4 h-4 mr-2" />
                                        Test DeFi Flow
                                    </Button>
                                )}

                                {actionMessage && (
                                    <div className="text-sm p-2 rounded bg-green-50 text-green-600">
                                        <CheckCircle className="w-4 h-4 mr-1 inline" />
                                        {actionMessage}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Add DeFi Actions Section */}
                <div className="mt-8">
                    <DeFiActionButtons
                        domain={domainName}
                        estimatedValue={domainData?.estimatedValue || 2500}
                        onTransactionComplete={handleDeFiTransaction}
                    />
                </div>

                {/* Transaction Result Modal */}
                <TransactionResultModal
                    isOpen={showTransactionModal}
                    onClose={() => setShowTransactionModal(false)}
                    result={transactionResult}
                />
            </div>
        </div>
    )
}

export default DomainDetailPage