const Web3 = require('web3')

class CrossChainAnalysisService {
    constructor() {
        this.networks = {
            ethereum: {
                name: 'Ethereum',
                rpc: 'https://rpc.ankr.com/eth',
                explorer: 'https://etherscan.io',
                chainId: 1,
                gasMultiplier: 1.5
            },
            polygon: {
                name: 'Polygon',
                rpc: 'https://rpc.ankr.com/polygon',
                explorer: 'https://polygonscan.com',
                chainId: 137,
                gasMultiplier: 0.1
            },
            bsc: {
                name: 'BSC',
                rpc: 'https://rpc.ankr.com/bsc',
                explorer: 'https://bscscan.com',
                chainId: 56,
                gasMultiplier: 0.2
            },
            doma: {
                name: 'Doma Testnet',
                rpc: 'https://rpc-testnet.doma.xyz',
                explorer: 'https://explorer-testnet.doma.xyz',
                chainId: 97476,
                gasMultiplier: 0.05
            }
        }

        this.priceCache = new Map()
        this.lastUpdate = 0
    }

    // Analyze domain across multiple chains
    async analyzeCrossChain(domain) {
        try {
            console.log(`Analyzing ${domain} across multiple chains...`)

            const results = await Promise.allSettled(
                Object.entries(this.networks).map(([networkKey, network]) =>
                    this.analyzeOnNetwork(domain, networkKey, network)
                )
            )

            const analysis = {
                domain,
                networks: {},
                arbitrageOpportunities: [],
                bestNetwork: null,
                totalVolume: 0,
                timestamp: new Date().toISOString()
            }

            results.forEach((result, index) => {
                const networkKey = Object.keys(this.networks)[index]
                if (result.status === 'fulfilled') {
                    analysis.networks[networkKey] = result.value
                    analysis.totalVolume += result.value.estimatedValue
                } else {
                    analysis.networks[networkKey] = {
                        error: result.reason.message,
                        available: false
                    }
                }
            })

            // Find arbitrage opportunities
            analysis.arbitrageOpportunities = this.findArbitrageOpportunities(analysis.networks)
            analysis.bestNetwork = this.determineBestNetwork(analysis.networks)

            return analysis

        } catch (error) {
            console.error('Cross-chain analysis error:', error)
            throw new Error(`Cross-chain analysis failed: ${error.message}`)
        }
    }

    // Analyze domain on specific network
    async analyzeOnNetwork(domain, networkKey, network) {
        try {
            const web3 = new Web3(network.rpc)

            // Simulate different pricing and availability across networks
            const basePrice = this.calculateBasePrice(domain)
            const networkMultiplier = this.getNetworkMultiplier(networkKey)
            const estimatedValue = Math.round(basePrice * networkMultiplier)

            // Simulate gas costs
            const gasPrice = await this.getGasPrice(web3)
            const transactionCost = gasPrice * 21000 * network.gasMultiplier

            // Check if domain exists on this network (simulated)
            const exists = Math.random() > 0.6 // 40% chance domain exists
            const tokenized = exists ? Math.random() > 0.7 : false // 30% chance tokenized if exists

            return {
                network: network.name,
                networkKey,
                available: !exists,
                tokenized,
                estimatedValue,
                transactionCost: parseFloat(transactionCost.toFixed(6)),
                gasPrice: parseFloat(gasPrice.toFixed(9)),
                priceAdvantage: this.calculatePriceAdvantage(estimatedValue, basePrice),
                liquidityScore: this.calculateLiquidityScore(networkKey),
                recommendation: this.getNetworkRecommendation(estimatedValue, transactionCost, !exists)
            }

        } catch (error) {
            throw new Error(`Network analysis failed for ${networkKey}: ${error.message}`)
        }
    }

    // Calculate base price for domain
    calculateBasePrice(domain) {
        const name = domain.split('.')[0]
        const extension = domain.split('.')[1]

        let basePrice = 1000

        // Length factor
        if (name.length <= 3) basePrice *= 5
        else if (name.length <= 5) basePrice *= 2
        else if (name.length >= 10) basePrice *= 0.5

        // Extension factor
        const extensionMultipliers = {
            'com': 2.0,
            'io': 1.5,
            'ai': 3.0,
            'crypto': 2.5,
            'defi': 2.8,
            'xyz': 0.8
        }

        basePrice *= extensionMultipliers[extension] || 1.0

        return basePrice
    }

    // Get network-specific pricing multiplier
    getNetworkMultiplier(networkKey) {
        const multipliers = {
            ethereum: 1.8,   // Premium pricing on Ethereum
            polygon: 0.6,    // Lower prices on Polygon
            bsc: 0.7,        // Moderate prices on BSC
            doma: 1.0        // Base prices on Doma
        }
        return multipliers[networkKey] || 1.0
    }

    // Get gas price for network
    async getGasPrice(web3) {
        try {
            const gasPrice = await web3.eth.getGasPrice()
            return parseFloat(web3.utils.fromWei(gasPrice, 'ether'))
        } catch (error) {
            // Return estimated gas price if RPC fails
            return 0.00001
        }
    }

    // Calculate price advantage compared to base
    calculatePriceAdvantage(networkPrice, basePrice) {
        const advantage = ((networkPrice - basePrice) / basePrice) * 100
        return parseFloat(advantage.toFixed(2))
    }

    // Calculate liquidity score for network
    calculateLiquidityScore(networkKey) {
        const scores = {
            ethereum: 95,
            polygon: 75,
            bsc: 70,
            doma: 85
        }
        return scores[networkKey] || 50
    }

    // Get recommendation for network
    getNetworkRecommendation(value, cost, available) {
        if (!available) return 'Domain already exists'

        const netValue = value - (cost * 1000000) // Convert ETH to USD

        if (netValue > value * 0.8) return 'Highly Recommended'
        if (netValue > value * 0.5) return 'Recommended'
        if (netValue > 0) return 'Consider'
        return 'High Costs'
    }

    // Find arbitrage opportunities
    findArbitrageOpportunities(networks) {
        const opportunities = []
        const networkKeys = Object.keys(networks)

        for (let i = 0; i < networkKeys.length; i++) {
            for (let j = i + 1; j < networkKeys.length; j++) {
                const network1 = networks[networkKeys[i]]
                const network2 = networks[networkKeys[j]]

                if (network1.error || network2.error) continue

                const priceDiff = Math.abs(network1.estimatedValue - network2.estimatedValue)
                const percentDiff = (priceDiff / Math.min(network1.estimatedValue, network2.estimatedValue)) * 100

                if (percentDiff > 20) { // 20% price difference threshold
                    const buyNetwork = network1.estimatedValue < network2.estimatedValue ? networkKeys[i] : networkKeys[j]
                    const sellNetwork = network1.estimatedValue > network2.estimatedValue ? networkKeys[i] : networkKeys[j]

                    opportunities.push({
                        type: 'price_arbitrage',
                        buyOn: networks[buyNetwork].network,
                        sellOn: networks[sellNetwork].network,
                        buyPrice: networks[buyNetwork].estimatedValue,
                        sellPrice: networks[sellNetwork].estimatedValue,
                        profit: priceDiff,
                        profitPercent: percentDiff.toFixed(1),
                        recommendation: percentDiff > 50 ? 'High Priority' : 'Consider'
                    })
                }
            }
        }

        return opportunities
    }

    // Determine best network for domain
    determineBestNetwork(networks) {
        let bestNetwork = null
        let bestScore = -1

        Object.entries(networks).forEach(([key, network]) => {
            if (network.error) return

            let score = 0

            // Availability bonus
            if (network.available) score += 40

            // Low transaction cost bonus
            if (network.transactionCost < 0.01) score += 20

            // High liquidity bonus
            score += network.liquidityScore * 0.3

            // Price advantage bonus
            if (network.priceAdvantage > 0) score += network.priceAdvantage * 0.5

            if (score > bestScore) {
                bestScore = score
                bestNetwork = {
                    network: network.network,
                    networkKey: key,
                    score: score.toFixed(1),
                    reasons: this.getBestNetworkReasons(network)
                }
            }
        })

        return bestNetwork
    }

    // Get reasons why network is best
    getBestNetworkReasons(network) {
        const reasons = []

        if (network.available) reasons.push('Domain available')
        if (network.transactionCost < 0.01) reasons.push('Low transaction costs')
        if (network.liquidityScore > 80) reasons.push('High liquidity')
        if (network.priceAdvantage > 10) reasons.push('Price advantage')

        return reasons
    }

    // Get cross-chain summary for multiple domains
    async getCrossChainSummary(domains) {
        const summaries = await Promise.allSettled(
            domains.map(domain => this.analyzeCrossChain(domain))
        )

        const successful = summaries
            .filter(s => s.status === 'fulfilled')
            .map(s => s.value)

        return {
            totalDomains: domains.length,
            analyzed: successful.length,
            totalArbitrageOpportunities: successful.reduce((sum, s) => sum + s.arbitrageOpportunities.length, 0),
            averageVolume: successful.reduce((sum, s) => sum + s.totalVolume, 0) / successful.length,
            topOpportunities: this.getTopOpportunities(successful),
            networkDistribution: this.getNetworkDistribution(successful)
        }
    }

    // Get top arbitrage opportunities
    getTopOpportunities(analyses) {
        const allOpportunities = analyses
            .flatMap(a => a.arbitrageOpportunities)
            .sort((a, b) => b.profit - a.profit)
            .slice(0, 5)

        return allOpportunities
    }

    // Get network distribution
    getNetworkDistribution(analyses) {
        const distribution = {}

        analyses.forEach(analysis => {
            if (analysis.bestNetwork) {
                const network = analysis.bestNetwork.network
                distribution[network] = (distribution[network] || 0) + 1
            }
        })

        return distribution
    }
}

module.exports = new CrossChainAnalysisService()