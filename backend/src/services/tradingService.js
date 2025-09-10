const domaService = require('./domaService')
const aiScoringService = require('./aiScoringService')

class TradingService {
    constructor() {
        this.activeRecommendations = new Map()
        this.tradingMetrics = {
            totalRecommendations: 0,
            successfulTrades: 0,
            revenue: 0,
            userEngagement: 0
        }
    }

    async generateTradingRecommendations(walletAddress) {
        try {
            // Get user's portfolio from Doma
            const portfolioDomains = await this.getUserPortfolio(walletAddress)
            const marketListings = await domaService.getListings({ take: 50 })

            const recommendations = []

            // Analyze portfolio for sell recommendations
            for (const domain of portfolioDomains) {
                const sellRec = await this.analyzeSellOpportunity(domain)
                if (sellRec) recommendations.push(sellRec)
            }

            // Analyze market for buy recommendations  
            for (const listing of marketListings) {
                const buyRec = await this.analyzeBuyOpportunity(listing)
                if (buyRec) recommendations.push(buyRec)
            }

            // Sort by potential ROI
            recommendations.sort((a, b) => b.expectedROI - a.expectedROI)

            this.tradingMetrics.totalRecommendations += recommendations.length

            return recommendations.slice(0, 10) // Top 10 recommendations
        } catch (error) {
            console.error('Trading recommendations error:', error)
            return []
        }
    }

    async analyzeSellOpportunity(domain) {
        try {
            const currentScore = await aiScoringService.predictScore(domain)
            const marketTrend = await this.getMarketTrend(domain.tld)

            // Check if domain is overvalued or market is declining
            if (currentScore < 60 || marketTrend < -10) {
                return {
                    type: 'SELL',
                    domain: domain.name,
                    currentValue: domain.estimatedValue,
                    recommendation: 'Consider selling - market conditions unfavorable',
                    expectedROI: -5, // Expected loss if not sold
                    confidence: this.calculateConfidence(currentScore, marketTrend),
                    action: 'create_listing'
                }
            }

            return null
        } catch (error) {
            console.error('Sell analysis error:', error)
            return null
        }
    }

    async analyzeBuyOpportunity(listing) {
        try {
            const domainName = listing.domain || 'example.com' // Placeholder
            const currentPrice = parseFloat(listing.price) || 1000

            const aiScore = await aiScoringService.predictScore({ name: domainName })
            const estimatedValue = this.estimateValue(aiScore, domainName)

            const potentialROI = ((estimatedValue - currentPrice) / currentPrice) * 100

            if (potentialROI > 20 && aiScore > 70) {
                return {
                    type: 'BUY',
                    domain: domainName,
                    currentPrice,
                    estimatedValue,
                    expectedROI: potentialROI,
                    aiScore,
                    recommendation: `Undervalued domain with ${potentialROI.toFixed(1)}% upside potential`,
                    confidence: this.calculateConfidence(aiScore, potentialROI),
                    action: 'create_offer'
                }
            }

            return null
        } catch (error) {
            console.error('Buy analysis error:', error)
            return null
        }
    }

    async executeTradeRecommendation(recommendation, userWallet) {
        try {
            let result = null

            switch (recommendation.action) {
                case 'create_listing':
                    result = await this.createListing(recommendation, userWallet)
                    break
                case 'create_offer':
                    result = await this.createOffer(recommendation, userWallet)
                    break
                default:
                    throw new Error('Unknown trade action')
            }

            if (result.success) {
                this.tradingMetrics.successfulTrades++
                this.tradingMetrics.userEngagement++

                // Track revenue potential
                if (recommendation.type === 'BUY') {
                    this.tradingMetrics.revenue += recommendation.estimatedValue * 0.025 // 2.5% fee
                }
            }

            return result
        } catch (error) {
            console.error('Trade execution error:', error)
            return { success: false, error: error.message }
        }
    }

    async createListing(recommendation, userWallet) {
        // Integration with Doma Orderbook API
        try {
            const listingParams = {
                orderbook: 'DOMA',
                chainId: 'eip155:67478', // Doma testnet
                parameters: {
                    offerer: userWallet,
                    // ... other Seaport parameters
                },
                signature: '0x...' // Would need actual wallet signing
            }

            // Simulate API call for demo
            console.log('Creating listing:', recommendation.domain)

            return {
                success: true,
                orderId: `order-${Date.now()}`,
                message: `Listing created for ${recommendation.domain}`
            }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    async createOffer(recommendation, userWallet) {
        try {
            const offerParams = {
                orderbook: 'DOMA',
                chainId: 'eip155:67478',
                parameters: {
                    offerer: userWallet,
                    // ... other parameters
                },
                signature: '0x...'
            }

            console.log('Creating offer for:', recommendation.domain)

            return {
                success: true,
                orderId: `offer-${Date.now()}`,
                message: `Offer created for ${recommendation.domain}`
            }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    calculateConfidence(score, trend) {
        const scoreWeight = score / 100
        const trendWeight = Math.min(Math.abs(trend) / 50, 1)
        return Math.round((scoreWeight + trendWeight) * 50)
    }

    estimateValue(aiScore, domainName) {
        const baseTLDValue = this.getTLDValue(domainName.split('.').pop())
        const lengthMultiplier = this.getLengthMultiplier(domainName.split('.')[0].length)
        const aiMultiplier = aiScore / 50

        return Math.round(baseTLDValue * lengthMultiplier * aiMultiplier)
    }

    getTLDValue(tld) {
        const tldValues = {
            'com': 5000,
            'io': 3000,
            'ai': 3500,
            'crypto': 2000,
            'xyz': 800
        }
        return tldValues[tld] || 1000
    }

    getLengthMultiplier(length) {
        if (length <= 3) return 3
        if (length <= 5) return 2
        if (length <= 7) return 1.5
        return 1
    }

    async getMarketTrend(tld) {
        // Simulate market trend analysis
        const trends = {
            'com': 5,
            'io': 15,
            'ai': 25,
            'crypto': -5,
            'xyz': -10
        }
        return trends[tld] || 0
    }

    async getUserPortfolio(walletAddress) {
        // Mock portfolio data for demo
        return [
            {
                name: 'crypto.io',
                estimatedValue: 15000,
                tld: 'io',
                owner: walletAddress
            },
            {
                name: 'defi.com',
                estimatedValue: 8500,
                tld: 'com',
                owner: walletAddress
            }
        ]
    }

    getMetrics() {
        return {
            ...this.tradingMetrics,
            successRate: this.tradingMetrics.totalRecommendations > 0
                ? (this.tradingMetrics.successfulTrades / this.tradingMetrics.totalRecommendations) * 100
                : 0
        }
    }
}

module.exports = new TradingService()