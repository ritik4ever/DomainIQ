class GTLDTrendAnalyzer {
    constructor() {
        this.gtldDatabase = this.initializeGTLDDatabase()
        this.trendHistory = new Map()
        this.valuationModels = this.initializeValuationModels()
    }

    initializeGTLDDatabase() {
        return {
            '.com': {
                totalDomains: 158000000,
                avgPrice: 4200,
                monthlyGrowth: 0.02,
                marketCap: 662400000000,
                premiumMultiplier: 2.5,
                liquidityScore: 95,
                adoption: 'MATURE',
                trend: 'STABLE'
            },
            '.io': {
                totalDomains: 550000,
                avgPrice: 3800,
                monthlyGrowth: 0.15,
                marketCap: 2090000000,
                premiumMultiplier: 2.2,
                liquidityScore: 78,
                adoption: 'GROWING',
                trend: 'RISING'
            },
            '.ai': {
                totalDomains: 280000,
                avgPrice: 5200,
                monthlyGrowth: 0.35,
                marketCap: 1456000000,
                premiumMultiplier: 2.8,
                liquidityScore: 85,
                adoption: 'EXPLOSIVE',
                trend: 'RISING'
            },
            '.crypto': {
                totalDomains: 125000,
                avgPrice: 2800,
                monthlyGrowth: 0.25,
                marketCap: 350000000,
                premiumMultiplier: 2.1,
                liquidityScore: 65,
                adoption: 'EMERGING',
                trend: 'RISING'
            },
            '.xyz': {
                totalDomains: 3500000,
                avgPrice: 800,
                monthlyGrowth: 0.08,
                marketCap: 2800000000,
                premiumMultiplier: 1.3,
                liquidityScore: 45,
                adoption: 'GROWING',
                trend: 'STABLE'
            },
            '.org': {
                totalDomains: 10800000,
                avgPrice: 1200,
                monthlyGrowth: -0.01,
                marketCap: 12960000000,
                premiumMultiplier: 1.4,
                liquidityScore: 70,
                adoption: 'MATURE',
                trend: 'DECLINING'
            },
            '.net': {
                totalDomains: 13500000,
                avgPrice: 900,
                monthlyGrowth: -0.02,
                marketCap: 12150000000,
                premiumMultiplier: 1.2,
                liquidityScore: 65,
                adoption: 'MATURE',
                trend: 'DECLINING'
            },
            '.co': {
                totalDomains: 2800000,
                avgPrice: 1800,
                monthlyGrowth: 0.12,
                marketCap: 5040000000,
                premiumMultiplier: 1.8,
                liquidityScore: 72,
                adoption: 'GROWING',
                trend: 'RISING'
            }
        }
    }

    initializeValuationModels() {
        return {
            scarcityModel: (supply, demand) => {
                return (1 / Math.log(supply + 1)) * 1000 + (demand * 100)
            },
            adoptionModel: (growth, marketCap) => {
                return Math.sqrt(marketCap / 1000000) * (1 + growth) * 10
            },
            liquidityModel: (volume, holders) => {
                return Math.min(100, (volume / holders) * 0.1)
            },
            trendModel: (momentum, volatility) => {
                return momentum * (1 - volatility * 0.3)
            }
        }
    }

    async analyzeGTLDTrends() {
        console.log('🔄 Running comprehensive gTLD trend analysis...')

        const analysis = {}
        const gtlds = Object.keys(this.gtldDatabase)

        for (const gtld of gtlds) {
            analysis[gtld] = await this.analyzeSpecificGTLD(gtld)
        }

        return {
            timestamp: new Date().toISOString(),
            totalGTLDs: gtlds.length,
            marketOverview: this.generateMarketOverview(analysis),
            gtldAnalysis: analysis,
            trendPredictions: this.generateTrendPredictions(analysis),
            investmentRecommendations: this.generateInvestmentRecommendations(analysis),
            rarityInsights: this.generateRarityInsights(analysis)
        }
    }

    async analyzeSpecificGTLD(gtld) {
        const baseData = this.gtldDatabase[gtld]

        if (!baseData) {
            return this.getDefaultGTLDAnalysis(gtld)
        }

        // Advanced valuation heuristics
        const rarityScore = this.calculateRarityScore(baseData)
        const adoptionTrend = this.calculateAdoptionTrend(baseData)
        const valuationMultiplier = this.calculateValuationMultiplier(baseData, rarityScore)
        const liquidityAnalysis = this.analyzeLiquidity(baseData)
        const competitivePosition = this.analyzeCompetitivePosition(gtld, baseData)

        return {
            gtld,
            marketData: {
                totalDomains: baseData.totalDomains,
                avgPrice: baseData.avgPrice,
                marketCap: baseData.marketCap,
                monthlyGrowth: baseData.monthlyGrowth
            },
            scoring: {
                rarityScore,
                adoptionScore: adoptionTrend,
                liquidityScore: baseData.liquidityScore,
                overallScore: Math.round((rarityScore + adoptionTrend + baseData.liquidityScore) / 3)
            },
            valuation: {
                multiplier: valuationMultiplier.multiplier,
                position: valuationMultiplier.position,
                floorPrice: Math.round(baseData.avgPrice * 0.6),
                ceilingPrice: Math.round(baseData.avgPrice * valuationMultiplier.multiplier),
                recommendedRange: [
                    Math.round(baseData.avgPrice * 0.8),
                    Math.round(baseData.avgPrice * 1.4)
                ]
            },
            trends: {
                momentum: baseData.trend,
                adoption: baseData.adoption,
                predictedGrowth: this.predictGrowth(baseData),
                riskLevel: this.calculateRiskLevel(baseData)
            },
            liquidity: liquidityAnalysis,
            competitive: competitivePosition,
            recommendation: this.getGTLDRecommendation(rarityScore, adoptionTrend, baseData)
        }
    }

    calculateRarityScore(baseData) {
        // Inverse relationship with supply, positive with demand
        const supplyPenalty = Math.log(baseData.totalDomains) * 2
        const demandBonus = baseData.monthlyGrowth * 200
        const liquidityBonus = baseData.liquidityScore * 0.3

        const rawScore = 100 - supplyPenalty + demandBonus + liquidityBonus
        return Math.max(0, Math.min(100, Math.round(rawScore)))
    }

    calculateAdoptionTrend(baseData) {
        let score = 50

        // Growth momentum
        if (baseData.monthlyGrowth > 0.2) score += 30
        else if (baseData.monthlyGrowth > 0.1) score += 20
        else if (baseData.monthlyGrowth > 0) score += 10
        else score -= 15

        // Market maturity
        const adoptionBonus = {
            'EXPLOSIVE': 25,
            'GROWING': 15,
            'MATURE': 10,
            'EMERGING': 20
        }
        score += adoptionBonus[baseData.adoption] || 0

        // Liquidity factor
        score += baseData.liquidityScore * 0.2

        return Math.max(0, Math.min(100, Math.round(score)))
    }

    calculateValuationMultiplier(baseData, rarityScore) {
        let baseMultiplier = baseData.premiumMultiplier

        // Rarity adjustment
        baseMultiplier *= (1 + rarityScore / 100)

        // Growth adjustment
        baseMultiplier *= (1 + baseData.monthlyGrowth * 2)

        // Market position
        let position = 'STABLE'
        if (baseMultiplier > 3) position = 'PREMIUM'
        else if (baseMultiplier > 2) position = 'GROWTH'
        else if (baseMultiplier > 1.5) position = 'STABLE'
        else position = 'EMERGING'

        return {
            multiplier: Math.round(baseMultiplier * 100) / 100,
            position
        }
    }

    analyzeLiquidity(baseData) {
        const volumeScore = Math.min(100, baseData.totalDomains / 100000)
        const velocityScore = Math.max(0, baseData.monthlyGrowth * 100)
        const marketDepth = baseData.liquidityScore

        return {
            volumeScore: Math.round(volumeScore),
            velocityScore: Math.round(velocityScore),
            marketDepth,
            overallLiquidity: Math.round((volumeScore + velocityScore + marketDepth) / 3),
            tradingDifficulty: marketDepth > 80 ? 'EASY' : marketDepth > 60 ? 'MODERATE' : 'DIFFICULT'
        }
    }

    analyzeCompetitivePosition(gtld, baseData) {
        const allGtlds = Object.entries(this.gtldDatabase)
        const position = allGtlds
            .sort((a, b) => b[1].marketCap - a[1].marketCap)
            .findIndex(([key]) => key === gtld) + 1

        const marketShare = (baseData.marketCap /
            allGtlds.reduce((sum, [_, data]) => sum + data.marketCap, 0)) * 100

        return {
            marketRank: position,
            marketShare: Math.round(marketShare * 100) / 100,
            mainCompetitors: this.getMainCompetitors(gtld, allGtlds),
            competitiveAdvantage: this.getCompetitiveAdvantage(gtld, baseData),
            threats: this.getCompetitiveThreats(gtld, baseData)
        }
    }

    getMainCompetitors(gtld, allGtlds) {
        const current = this.gtldDatabase[gtld]
        return allGtlds
            .filter(([key]) => key !== gtld)
            .sort((a, b) => Math.abs(a[1].avgPrice - current.avgPrice) - Math.abs(b[1].avgPrice - current.avgPrice))
            .slice(0, 3)
            .map(([key, data]) => ({
                gtld: key,
                avgPrice: data.avgPrice,
                trend: data.trend
            }))
    }

    getCompetitiveAdvantage(gtld, baseData) {
        if (gtld === '.com') return 'Universal recognition and trust'
        if (gtld === '.ai') return 'AI trend positioning and tech appeal'
        if (gtld === '.io') return 'Strong developer community adoption'
        if (gtld === '.crypto') return 'Direct blockchain industry relevance'
        if (baseData.monthlyGrowth > 0.2) return 'High growth momentum'
        if (baseData.liquidityScore > 85) return 'Excellent market liquidity'
        return 'Stable market presence'
    }

    getCompetitiveThreats(gtld, baseData) {
        const threats = []

        if (baseData.monthlyGrowth < 0) threats.push('Declining adoption')
        if (baseData.liquidityScore < 50) threats.push('Low liquidity risk')
        if (baseData.totalDomains > 50000000) threats.push('Market oversaturation')
        if (gtld === '.org' || gtld === '.net') threats.push('Legacy TLD displacement')

        return threats.length ? threats : ['No major threats identified']
    }

    predictGrowth(baseData) {
        const currentGrowth = baseData.monthlyGrowth
        const trendFactor = {
            'RISING': 1.2,
            'STABLE': 1.0,
            'DECLINING': 0.8
        }[baseData.trend] || 1.0

        return {
            nextMonth: Math.round(currentGrowth * trendFactor * 100) / 100,
            nextQuarter: Math.round(currentGrowth * trendFactor * 3 * 100) / 100,
            nextYear: Math.round(currentGrowth * trendFactor * 12 * 100) / 100
        }
    }

    calculateRiskLevel(baseData) {
        let riskScore = 0

        if (baseData.monthlyGrowth < -0.05) riskScore += 30
        else if (baseData.monthlyGrowth < 0) riskScore += 15

        if (baseData.liquidityScore < 50) riskScore += 25
        if (baseData.totalDomains < 100000) riskScore += 20
        if (baseData.monthlyGrowth > 0.3) riskScore += 15 // Bubble risk

        if (riskScore > 50) return 'HIGH'
        if (riskScore > 25) return 'MEDIUM'
        return 'LOW'
    }

    getGTLDRecommendation(rarityScore, adoptionScore, baseData) {
        const composite = (rarityScore + adoptionScore + baseData.liquidityScore) / 3

        if (composite >= 85 && baseData.monthlyGrowth > 0.1) return 'STRONG_BUY'
        if (composite >= 70 && baseData.monthlyGrowth > 0) return 'BUY'
        if (composite >= 50) return 'HOLD'
        return 'AVOID'
    }

    generateMarketOverview(analysis) {
        const gtlds = Object.values(analysis)
        const totalMarketCap = gtlds.reduce((sum, g) => sum + g.marketData.marketCap, 0)
        const avgGrowth = gtlds.reduce((sum, g) => sum + g.marketData.monthlyGrowth, 0) / gtlds.length

        return {
            totalMarketCap,
            averageGrowth: Math.round(avgGrowth * 1000) / 10,
            hottestGTLD: gtlds.sort((a, b) => b.trends.predictedGrowth.nextQuarter - a.trends.predictedGrowth.nextQuarter)[0].gtld,
            mostLiquid: gtlds.sort((a, b) => b.liquidity.overallLiquidity - a.liquidity.overallLiquidity)[0].gtld,
            bestValue: gtlds.sort((a, b) => b.scoring.overallScore - a.scoring.overallScore)[0].gtld,
            marketSentiment: avgGrowth > 0.1 ? 'BULLISH' : avgGrowth > 0 ? 'NEUTRAL' : 'BEARISH'
        }
    }

    generateTrendPredictions(analysis) {
        return {
            emergingTrends: [
                'AI-related domains showing 35% monthly growth',
                'Crypto TLDs benefiting from institutional adoption',
                'Short premium domains maintaining scarcity premiums'
            ],
            riskFactors: [
                'Traditional TLDs (.org, .net) showing decline',
                'Oversupply risk in common extensions',
                'Regulatory uncertainty in Web3 domains'
            ],
            opportunities: Object.values(analysis)
                .filter(g => g.recommendation === 'STRONG_BUY' || g.recommendation === 'BUY')
                .map(g => ({
                    gtld: g.gtld,
                    reason: `${g.recommendation} - ${g.competitive.competitiveAdvantage}`,
                    expectedReturn: `${Math.round(g.trends.predictedGrowth.nextYear * 100)}% annually`
                }))
        }
    }

    generateInvestmentRecommendations(analysis) {
        const recommendations = []

        Object.values(analysis).forEach(gtld => {
            if (gtld.recommendation === 'STRONG_BUY') {
                recommendations.push({
                    gtld: gtld.gtld,
                    action: 'STRONG_BUY',
                    allocation: '15-25%',
                    targetPrice: gtld.valuation.recommendedRange[1],
                    reasoning: `High growth (${Math.round(gtld.marketData.monthlyGrowth * 100)}% monthly) + strong fundamentals`,
                    timeHorizon: '6-12 months'
                })
            } else if (gtld.recommendation === 'BUY' && gtld.trends.riskLevel === 'LOW') {
                recommendations.push({
                    gtld: gtld.gtld,
                    action: 'BUY',
                    allocation: '10-15%',
                    targetPrice: gtld.valuation.recommendedRange[0],
                    reasoning: 'Solid growth with manageable risk profile',
                    timeHorizon: '12-24 months'
                })
            }
        })

        return recommendations.sort((a, b) => {
            const priority = { 'STRONG_BUY': 3, 'BUY': 2, 'HOLD': 1, 'AVOID': 0 }
            return priority[b.action] - priority[a.action]
        })
    }

    generateRarityInsights(analysis) {
        const rarityRanking = Object.values(analysis)
            .sort((a, b) => b.scoring.rarityScore - a.scoring.rarityScore)

        return {
            rarestGTLDs: rarityRanking.slice(0, 3).map(g => ({
                gtld: g.gtld,
                rarityScore: g.scoring.rarityScore,
                scarcityFactor: `1 in ${Math.round(g.marketData.totalDomains / 1000)}K domains`
            })),
            scarcityDrivers: [
                'Ultra-short domains (2-4 chars) in premium TLDs',
                'Single-word dictionary terms in .ai and .io',
                'Brandable domains with Web3 relevance'
            ],
            collectibilityIndex: Math.round(rarityRanking.reduce((sum, g) => sum + g.scoring.rarityScore, 0) / rarityRanking.length)
        }
    }

    getDefaultGTLDAnalysis(gtld) {
        return {
            gtld,
            marketData: {
                totalDomains: 50000,
                avgPrice: 1200,
                marketCap: 60000000,
                monthlyGrowth: 0.05
            },
            scoring: {
                rarityScore: 60,
                adoptionScore: 50,
                liquidityScore: 40,
                overallScore: 50
            },
            recommendation: 'HOLD'
        }
    }
}

module.exports = new GTLDTrendAnalyzer()