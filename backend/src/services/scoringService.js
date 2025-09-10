const {
    calculateBrandabilityScore,
    calculateMemorabilityScore,
    calculateLinguisticScore,
    calculateMarketScore
} = require('../utils/scoring-algorithms')

class ScoringService {
    async calculateDomainScore(domain) {
        try {
            const { name, tld, length } = domain

            // Calculate individual scoring components
            const brandability = calculateBrandabilityScore(name)
            const memorability = calculateMemorabilityScore(name)
            const linguistic = calculateLinguisticScore(name)
            const market = calculateMarketScore(name, tld)

            // Weighted overall score
            const overallScore = Math.round(
                (brandability * 0.3) +
                (memorability * 0.25) +
                (linguistic * 0.25) +
                (market * 0.2)
            )

            // Determine trend (simplified)
            const trend = overallScore >= 75 ? 'up' : overallScore >= 60 ? 'stable' : 'down'

            // Estimate price based on score and other factors
            const price = this.estimatePrice(overallScore, tld, length, name)

            return {
                score: overallScore,
                brandability,
                memorability,
                linguistic,
                market,
                trend,
                price
            }
        } catch (error) {
            console.error('Scoring error:', error)
            return {
                score: 50,
                brandability: 50,
                memorability: 50,
                linguistic: 50,
                market: 50,
                trend: 'stable',
                price: '$1,000'
            }
        }
    }

    estimatePrice(score, tld, length, name) {
        let basePrice = 1000

        // TLD multipliers
        const tldMultipliers = {
            '.com': 3,
            '.io': 2,
            '.ai': 2.5,
            '.crypto': 1.8,
            '.defi': 1.5,
            '.xyz': 1
        }

        // Length penalties/bonuses
        const lengthMultiplier = length <= 4 ? 2.5 :
            length <= 6 ? 1.5 :
                length <= 8 ? 1 : 0.7

        // Score multiplier
        const scoreMultiplier = score / 50

        const estimatedPrice = basePrice *
            (tldMultipliers[tld] || 1) *
            lengthMultiplier *
            scoreMultiplier

        return `$${Math.round(estimatedPrice).toLocaleString()}`
    }

    async getDetailedAnalysis(domain) {
        const scoring = await this.calculateDomainScore(domain)

        return {
            domain: domain.name,
            scoring,
            recommendations: this.generateRecommendations(scoring),
            comparables: await this.findComparables(domain.name),
            marketInsights: this.getMarketInsights(domain.name)
        }
    }

    generateRecommendations(scoring) {
        const recommendations = []

        if (scoring.score >= 80) {
            recommendations.push({
                type: 'strong_buy',
                message: 'Excellent domain with strong commercial potential'
            })
        } else if (scoring.score >= 60) {
            recommendations.push({
                type: 'moderate_buy',
                message: 'Good domain suitable for branding or development'
            })
        } else {
            recommendations.push({
                type: 'pass',
                message: 'Consider alternatives with better scoring metrics'
            })
        }

        if (scoring.brandability < 60) {
            recommendations.push({
                type: 'caution',
                message: 'Low brandability score may limit commercial appeal'
            })
        }

        return recommendations
    }

    async findComparables(domainName) {
        // Simplified comparable domain logic
        return [
            { name: 'similar1.com', price: '$5,000', sold: '2024-01-15' },
            { name: 'similar2.io', price: '$3,200', sold: '2024-02-20' },
            { name: 'similar3.ai', price: '$7,500', sold: '2024-03-10' }
        ]
    }

    getMarketInsights(domainName) {
        return {
            category: 'Technology',
            demand: 'High',
            liquidity: 'Medium',
            growthPotential: 'Strong'
        }
    }

    async getMarketTrends() {
        return {
            topTlds: [
                { tld: '.com', change: '+8.5%', volume: 1250 },
                { tld: '.io', change: '+15.2%', volume: 890 },
                { tld: '.ai', change: '+22.1%', volume: 650 }
            ],
            categories: [
                { category: 'AI/Tech', change: '+18.9%' },
                { category: 'DeFi', change: '+12.3%' },
                { category: 'Gaming', change: '+7.8%' }
            ]
        }
    }

    async getDomainAnalytics(domainName) {
        return {
            traffic: Math.floor(Math.random() * 10000),
            backlinks: Math.floor(Math.random() * 500),
            mentions: Math.floor(Math.random() * 100),
            socialSignals: Math.floor(Math.random() * 1000)
        }
    }
}

module.exports = new ScoringService()