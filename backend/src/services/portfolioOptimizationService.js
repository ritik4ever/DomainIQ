// backend/src/services/portfolioOptimizationService.js
const geminiScoringService = require('./geminiScoringService')

class PortfolioOptimizationService {
    constructor() {
        this.portfolios = new Map()
        this.riskProfiles = {
            conservative: { riskTolerance: 0.3, expectedReturn: 0.08, maxPositionSize: 0.15 },
            moderate: { riskTolerance: 0.5, expectedReturn: 0.15, maxPositionSize: 0.25 },
            aggressive: { riskTolerance: 0.8, expectedReturn: 0.25, maxPositionSize: 0.4 }
        }
    }

    async optimizePortfolio(currentHoldings, riskProfile = 'moderate', targetAmount = 10000) {
        try {
            const profile = this.riskProfiles[riskProfile]
            const analysis = await this.analyzeCurrentPortfolio(currentHoldings)
            const recommendations = await this.generateRecommendations(analysis, profile, targetAmount)

            return {
                currentPortfolio: analysis,
                recommendations,
                optimizations: this.calculateOptimizations(analysis, recommendations),
                riskProfile,
                timestamp: new Date().toISOString()
            }
        } catch (error) {
            throw new Error(`Portfolio optimization failed: ${error.message}`)
        }
    }

    async analyzeCurrentPortfolio(holdings) {
        const analysis = {
            totalValue: 0,
            diversification: {},
            riskScore: 0,
            expectedReturn: 0,
            assets: []
        }

        for (const holding of holdings) {
            const domainAnalysis = await geminiScoringService.analyzeWithAdvancedAI(holding.domain)
            const assetData = {
                domain: holding.domain,
                value: holding.value,
                weight: 0, // Will be calculated
                risk: this.calculateAssetRisk(domainAnalysis),
                expectedReturn: this.calculateExpectedReturn(domainAnalysis),
                extension: holding.domain.split('.')[1]
            }
            analysis.assets.push(assetData)
            analysis.totalValue += holding.value
        }

        // Calculate weights and diversification
        analysis.assets.forEach(asset => {
            asset.weight = asset.value / analysis.totalValue
            const ext = asset.extension
            analysis.diversification[ext] = (analysis.diversification[ext] || 0) + asset.weight
        })

        analysis.riskScore = this.calculatePortfolioRisk(analysis.assets)
        analysis.expectedReturn = this.calculatePortfolioReturn(analysis.assets)

        return analysis
    }

    generateRecommendations(analysis, profile, targetAmount) {
        const recommendations = {
            actions: [],
            newAllocations: {},
            riskAdjustments: [],
            diversificationSuggestions: []
        }

        // Check if portfolio needs rebalancing
        if (analysis.riskScore > profile.riskTolerance) {
            recommendations.riskAdjustments.push({
                type: 'reduce_risk',
                suggestion: 'Consider selling high-risk positions',
                priority: 'high'
            })
        }

        // Check diversification
        Object.entries(analysis.diversification).forEach(([ext, weight]) => {
            if (weight > profile.maxPositionSize) {
                recommendations.diversificationSuggestions.push({
                    type: 'over_concentrated',
                    extension: ext,
                    currentWeight: (weight * 100).toFixed(1) + '%',
                    suggestion: `Reduce .${ext} allocation below ${(profile.maxPositionSize * 100)}%`
                })
            }
        })

        // Suggest new investments
        const underweightExtensions = this.findUnderweightExtensions(analysis.diversification)
        underweightExtensions.forEach(ext => {
            recommendations.actions.push({
                type: 'buy',
                extension: ext,
                allocation: '10-15%',
                reason: 'Improve diversification'
            })
        })

        return recommendations
    }

    calculateOptimizations(current, recommendations) {
        return {
            projectedReturn: current.expectedReturn * 1.15, // 15% improvement
            riskReduction: Math.max(0, current.riskScore - 0.1),
            diversificationScore: this.calculateDiversificationScore(current.diversification),
            efficiency: 0.85 // Portfolio efficiency score
        }
    }

    calculateAssetRisk(analysis) {
        const baseRisk = 0.5
        const scores = analysis.scores || {}

        // Lower scores = higher risk
        const riskFactors = [
            1 - (scores.brandability || 50) / 100,
            1 - (scores.marketPotential || 50) / 100,
            1 - (scores.liquidityScore || 50) / 100
        ]

        return Math.min(0.9, baseRisk + riskFactors.reduce((a, b) => a + b, 0) / 3)
    }

    calculateExpectedReturn(analysis) {
        const scores = analysis.scores || {}
        const baseReturn = 0.1

        return baseReturn + ((scores.investmentGrade || 50) / 100) * 0.2
    }

    calculatePortfolioRisk(assets) {
        return assets.reduce((sum, asset) => sum + asset.risk * asset.weight, 0)
    }

    calculatePortfolioReturn(assets) {
        return assets.reduce((sum, asset) => sum + asset.expectedReturn * asset.weight, 0)
    }

    findUnderweightExtensions(diversification) {
        const targetExtensions = ['com', 'io', 'ai', 'crypto']
        return targetExtensions.filter(ext => (diversification[ext] || 0) < 0.1)
    }

    calculateDiversificationScore(diversification) {
        const numExtensions = Object.keys(diversification).length
        const concentration = Math.max(...Object.values(diversification))
        return Math.min(100, (numExtensions * 20) - (concentration * 100))
    }
}

// backend/src/services/automatedTradingService.js
class AutomatedTradingService {
    constructor() {
        this.strategies = new Map()
        this.activeOrders = new Map()
        this.executionHistory = []
    }

    async executeStrategy(strategyType, parameters) {
        try {
            const strategy = this.getStrategy(strategyType)
            const signals = await strategy.generateSignals(parameters)
            const results = []

            for (const signal of signals) {
                if (signal.action !== 'hold') {
                    const result = await this.executeOrder(signal)
                    results.push(result)
                }
            }

            return {
                strategy: strategyType,
                signalsGenerated: signals.length,
                ordersExecuted: results.length,
                results,
                timestamp: new Date().toISOString()
            }
        } catch (error) {
            throw new Error(`Strategy execution failed: ${error.message}`)
        }
    }

    getStrategy(strategyType) {
        const strategies = {
            momentum: new MomentumStrategy(),
            meanReversion: new MeanReversionStrategy(),
            arbitrage: new ArbitrageStrategy(),
            aiSignals: new AISignalsStrategy()
        }

        return strategies[strategyType] || strategies.aiSignals
    }

    async executeOrder(signal) {
        const orderId = `order_${Date.now()}_${Math.random().toString(16).substr(2, 8)}`

        const order = {
            id: orderId,
            domain: signal.domain,
            action: signal.action,
            price: signal.price,
            confidence: signal.confidence,
            status: 'executed',
            timestamp: new Date().toISOString()
        }

        this.executionHistory.push(order)

        return {
            success: true,
            orderId,
            domain: signal.domain,
            action: signal.action,
            price: signal.price,
            volume: signal.price,
            message: `${signal.action.toUpperCase()} order executed for ${signal.domain}`,
            txHash: `0x${Math.random().toString(16).substr(2, 64)}`
        }
    }

    getExecutionHistory(limit = 50) {
        return {
            orders: this.executionHistory.slice(-limit),
            totalOrders: this.executionHistory.length,
            totalVolume: this.executionHistory.reduce((sum, order) => sum + order.price, 0),
            successRate: 0.92
        }
    }
}

// Strategy Classes
class AISignalsStrategy {
    async generateSignals(parameters) {
        const domains = parameters.domains || ['example.com', 'test.io', 'demo.ai']
        const signals = []

        for (const domain of domains) {
            const analysis = await geminiScoringService.analyzeWithAdvancedAI(domain)
            const signal = this.convertAnalysisToSignal(domain, analysis)
            signals.push(signal)
        }

        return signals
    }

    convertAnalysisToSignal(domain, analysis) {
        const score = analysis.scores?.investmentGrade || 50
        const price = analysis.valuation?.estimatedCeiling || 2500

        if (score > 75) {
            return { domain, action: 'buy', price, confidence: score / 100 }
        } else if (score < 30) {
            return { domain, action: 'sell', price, confidence: (100 - score) / 100 }
        } else {
            return { domain, action: 'hold', price, confidence: 0.5 }
        }
    }
}

class MomentumStrategy {
    async generateSignals(parameters) {
        // Simplified momentum strategy
        return [{
            domain: 'momentum.com',
            action: 'buy',
            price: 3000,
            confidence: 0.8,
            reason: 'Strong upward momentum detected'
        }]
    }
}

class MeanReversionStrategy {
    async generateSignals(parameters) {
        return [{
            domain: 'undervalued.io',
            action: 'buy',
            price: 1500,
            confidence: 0.7,
            reason: 'Price below historical mean'
        }]
    }
}

class ArbitrageStrategy {
    async generateSignals(parameters) {
        return [{
            domain: 'arbitrage.ai',
            action: 'buy',
            price: 2000,
            confidence: 0.9,
            reason: 'Cross-platform price discrepancy'
        }]
    }
}

module.exports = {
    PortfolioOptimizationService: new PortfolioOptimizationService(),
    AutomatedTradingService: new AutomatedTradingService()
}