class GTLDAnalysisService {
    constructor() {
        this.gtldData = new Map()
        this.trendHistory = new Map()
    }

    async analyzeGTLDTrends() {
        const gtlds = ['.com', '.io', '.ai', '.xyz', '.org', '.net', '.co', '.crypto', '.defi', '.nft']
        const analysis = {}

        for (const gtld of gtlds) {
            analysis[gtld] = await this.analyzeSpecificGTLD(gtld)
        }

        return {
            timestamp: new Date().toISOString(),
            gtldAnalysis: analysis,
            marketSummary: this.generateMarketSummary(analysis),
            recommendations: this.generateGTLDRecommendations(analysis)
        }
    }

    async analyzeSpecificGTLD(gtld) {
        // Advanced heuristic analysis for each gTLD
        const baseMetrics = this.getBaseGTLDMetrics(gtld)
        const rarityScore = this.calculateRarityScore(gtld)
        const adoptionTrend = this.calculateAdoptionTrend(gtld)
        const valuationHeuristic = this.calculateValuationHeuristic(gtld, baseMetrics)

        return {
            gtld,
            rarityScore,
            adoptionTrend,
            averagePrice: baseMetrics.avgPrice,
            totalDomains: baseMetrics.totalDomains,
            monthlyGrowth: baseMetrics.monthlyGrowth,
            valuationMultiplier: valuationHeuristic.multiplier,
            marketPosition: valuationHeuristic.position,
            recommendationLevel: this.getRecommendationLevel(rarityScore, adoptionTrend)
        }
    }

    getBaseGTLDMetrics(gtld) {
        const metrics = {
            '.com': { avgPrice: 8500, totalDomains: 450000, monthlyGrowth: 0.05 },
            '.io': { avgPrice: 4200, totalDomains: 85000, monthlyGrowth: 0.18 },
            '.ai': { avgPrice: 6800, totalDomains: 32000, monthlyGrowth: 0.28 },
            '.xyz': { avgPrice: 1200, totalDomains: 125000, monthlyGrowth: 0.08 },
            '.org': { avgPrice: 2800, totalDomains: 180000, monthlyGrowth: 0.03 },
            '.net': { avgPrice: 2200, totalDomains: 95000, monthlyGrowth: 0.02 },
            '.co': { avgPrice: 3400, totalDomains: 45000, monthlyGrowth: 0.12 },
            '.crypto': { avgPrice: 3800, totalDomains: 15000, monthlyGrowth: 0.25 },
            '.defi': { avgPrice: 2900, totalDomains: 8500, monthlyGrowth: 0.22 },
            '.nft': { avgPrice: 2100, totalDomains: 12000, monthlyGrowth: 0.15 }
        }

        return metrics[gtld] || { avgPrice: 1000, totalDomains: 5000, monthlyGrowth: 0.05 }
    }

    calculateRarityScore(gtld) {
        const metrics = this.getBaseGTLDMetrics(gtld)
        const supply = metrics.totalDomains
        const demand = metrics.monthlyGrowth

        // Rarity inversely correlated with supply, positively with demand
        const rarityScore = Math.max(0, Math.min(100,
            (1 / Math.log(supply + 1)) * 10000 + (demand * 100)
        ))

        return Math.round(rarityScore)
    }

    calculateAdoptionTrend(gtld) {
        const trendFactors = {
            '.com': 0.85, // Stable, mature
            '.io': 0.92,  // Strong tech adoption
            '.ai': 0.98,  // Explosive AI trend
            '.xyz': 0.78, // Moderate growth
            '.org': 0.72, // Declining
            '.net': 0.70, // Declining
            '.co': 0.88,  // Strong business adoption
            '.crypto': 0.95, // Crypto boom
            '.defi': 0.93,   // DeFi growth
            '.nft': 0.82     // NFT cooling but stable
        }

        return trendFactors[gtld] || 0.75
    }

    calculateValuationHeuristic(gtld, metrics) {
        const baseMultiplier = metrics.avgPrice / 1000
        const growthBonus = metrics.monthlyGrowth * 10
        const multiplier = baseMultiplier + growthBonus

        let position = 'EMERGING'
        if (multiplier > 8) position = 'PREMIUM'
        else if (multiplier > 4) position = 'GROWTH'
        else if (multiplier > 2) position = 'STABLE'

        return { multiplier: Math.round(multiplier * 10) / 10, position }
    }

    getRecommendationLevel(rarityScore, adoptionTrend) {
        const composite = (rarityScore * 0.4) + (adoptionTrend * 60)

        if (composite >= 85) return 'STRONG_BUY'
        if (composite >= 70) return 'BUY'
        if (composite >= 50) return 'HOLD'
        return 'AVOID'
    }

    generateMarketSummary(analysis) {
        const gtlds = Object.values(analysis)
        const avgRarity = gtlds.reduce((sum, g) => sum + g.rarityScore, 0) / gtlds.length
        const hottest = gtlds.sort((a, b) => b.adoptionTrend - a.adoptionTrend)[0]
        const mostRare = gtlds.sort((a, b) => b.rarityScore - a.rarityScore)[0]

        return {
            marketHeat: avgRarity > 60 ? 'HOT' : avgRarity > 40 ? 'WARM' : 'COOL',
            hottestGTLD: hottest.gtld,
            rarestGTLD: mostRare.gtld,
            averageRarityScore: Math.round(avgRarity)
        }
    }

    generateGTLDRecommendations(analysis) {
        const recommendations = []

        Object.values(analysis).forEach(gtld => {
            if (gtld.recommendationLevel === 'STRONG_BUY') {
                recommendations.push({
                    gtld: gtld.gtld,
                    action: 'ACQUIRE',
                    reason: `High rarity (${gtld.rarityScore}) + strong adoption trend (${Math.round(gtld.adoptionTrend * 100)}%)`,
                    priority: 'HIGH'
                })
            } else if (gtld.recommendationLevel === 'BUY' && gtld.monthlyGrowth > 0.2) {
                recommendations.push({
                    gtld: gtld.gtld,
                    action: 'MONITOR',
                    reason: `Rapid growth (${Math.round(gtld.monthlyGrowth * 100)}% monthly)`,
                    priority: 'MEDIUM'
                })
            }
        })

        return recommendations.sort((a, b) =>
            a.priority === 'HIGH' ? -1 : b.priority === 'HIGH' ? 1 : 0
        )
    }
}

module.exports = new GTLDAnalysisService()