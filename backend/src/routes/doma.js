const express = require('express')
const router = express.Router()
const geminiScoringService = require('../services/geminiScoringService')
const gtldTrendAnalyzer = require('../services/gtldTrendAnalyzer')
const socialMediaService = require('../services/socialMediaService')
const domaIntegrationService = require('../services/domaIntegrationService')
const web2BenchmarkingService = require('../services/web2BenchmarkingService')
const transactionService = require('../services/transactionService')

router.get('/search', async (req, res) => {
    try {
        const { q: query } = req.query

        if (!query) {
            return res.status(400).json({ error: 'Query parameter required' })
        }

        console.log(`Advanced AI search for: ${query}`)
        const domains = generateDomainVariations(query)

        // Enhanced parallel processing
        const results = await Promise.all(
            domains.map(async (domain) => {
                try {
                    // 1. AI Analysis
                    const aiAnalysis = await geminiScoringService.analyzeWithAdvancedAI(domain.name)

                    // 2. Web2 Benchmarking
                    const benchmarkData = await web2BenchmarkingService.benchmarkDomain(domain.name, aiAnalysis)

                    // 3. Trading Opportunities
                    const tradingOpportunities = await transactionService.generateTradingOpportunities(aiAnalysis, benchmarkData)

                    return {
                        name: domain.name,
                        tld: domain.tld,
                        length: domain.length,

                        // Enhanced AI scores
                        brandability: aiAnalysis.scores?.brandability || 70,
                        memorability: aiAnalysis.scores?.marketPotential || 65,
                        linguistic: aiAnalysis.scores?.linguistic || 75,
                        market: aiAnalysis.scores?.investmentGrade || 60,
                        web3Relevance: aiAnalysis.scores?.onChainValue || 50,
                        rarityScore: aiAnalysis.scores?.rarityScore || 60,
                        overall: Math.round(Object.values(aiAnalysis.scores || {}).reduce((a, b) => a + b, 0) / 6) || 67,

                        // AI insights
                        recommendation: aiAnalysis.insights?.recommendation || 'HOLD',
                        reasoning: aiAnalysis.insights?.onChainInsight || 'AI-powered analysis',
                        marketPosition: aiAnalysis.insights?.marketPosition || 'STABLE',

                        // Enhanced valuation
                        estimatedPriceMin: aiAnalysis.valuation?.estimatedFloor || 1000,
                        estimatedPriceMax: aiAnalysis.valuation?.estimatedCeiling || 5000,
                        liquidityScore: aiAnalysis.scores?.liquidityScore || 60,

                        // Web2 benchmarking results
                        benchmarking: {
                            aiOutperforms: benchmarkData.comparison?.aiOutperforms || false,
                            web2Average: benchmarkData.web2Performance?.averageValuation || 0,
                            aiAdvantage: benchmarkData.comparison?.differencePercent || 0,
                            confidence: benchmarkData.comparison?.confidence || 0.5,
                            services: benchmarkData.web2Performance?.serviceCount || 0
                        },

                        // Trading opportunities
                        opportunities: {
                            count: tradingOpportunities.totalOpportunities || 0,
                            volume: tradingOpportunities.estimatedVolume || 0,
                            priority: tradingOpportunities.priorityActions?.length || 0,
                            types: tradingOpportunities.opportunities?.map(op => op.type) || []
                        },

                        // Blockchain data
                        tokenized: aiAnalysis.blockchain?.tokenized || false,
                        onChainActivity: aiAnalysis.blockchain?.totalEvents || 0,
                        onChainData: aiAnalysis.onChainData || false,

                        // Technical metadata
                        aiModel: aiAnalysis.model || 'advanced-heuristic',
                        confidence: aiAnalysis.confidence || 0.78,
                        aiPowered: aiAnalysis.aiPowered || false,

                        timestamp: new Date().toISOString()
                    }
                } catch (error) {
                    console.error(`Error processing ${domain.name}:`, error.message)
                    return generateFallbackDomainData(domain)
                }
            })
        )

        // Get gTLD trends for context
        const gtldTrends = await gtldTrendAnalyzer.analyzeGTLDTrends()

        // Enhanced response with comprehensive analytics
        const response = {
            domains: results,
            analytics: {
                aiPowered: results.filter(d => d.aiPowered).length,
                totalRarityScore: Math.round(results.reduce((sum, d) => sum + d.rarityScore, 0) / results.length),
                strongBuys: results.filter(d => d.recommendation === 'STRONG_BUY').length,
                avgConfidence: Math.round(results.reduce((sum, d) => sum + d.confidence, 0) / results.length * 100),

                // Web2 benchmarking stats
                benchmarking: {
                    aiOutperformsCount: results.filter(d => d.benchmarking.aiOutperforms).length,
                    avgWeb2Value: Math.round(results.reduce((sum, d) => sum + d.benchmarking.web2Average, 0) / results.length),
                    totalServices: results.reduce((sum, d) => sum + d.benchmarking.services, 0)
                },

                // Trading opportunities stats
                opportunities: {
                    totalOpportunities: results.reduce((sum, d) => sum + d.opportunities.count, 0),
                    totalVolume: results.reduce((sum, d) => sum + d.opportunities.volume, 0),
                    highPriority: results.reduce((sum, d) => sum + d.opportunities.priority, 0)
                },

                // On-chain data stats
                onChain: {
                    tokenizedDomains: results.filter(d => d.tokenized).length,
                    avgActivity: Math.round(results.reduce((sum, d) => sum + d.onChainActivity, 0) / results.length),
                    realDataPoints: results.filter(d => d.onChainData).length
                }
            },

            gtldInsights: {
                marketOverview: gtldTrends.marketOverview,
                recommendations: gtldTrends.investmentRecommendations?.slice(0, 3) || [],
                topTrends: gtldTrends.trendPredictions?.emergingTrends || []
            },

            query: query,
            totalResults: results.length,
            timestamp: new Date().toISOString()
        }

        console.log(`Enhanced analysis completed: ${results.length} results with ${response.analytics.opportunities.totalOpportunities} trading opportunities`)

        res.json(response)

    } catch (error) {
        console.error('Enhanced search error:', error)
        res.status(500).json({
            error: 'Enhanced search failed',
            message: error.message,
            domains: [],
            query: query || ''
        })
    }
})


// volume stats endpoint
router.get('/volume-stats', async (req, res) => {
    try {
        const transactionService = require('../services/transactionService')
        const volumeStats = transactionService.getOpportunityStats()

        // Add demo volume metrics
        const demoMetrics = {
            ...volumeStats,
            realTimeGeneration: {
                last24Hours: '$125,000',
                currentHour: '$8,500',
                averagePerDomain: '$2,100',
                transactionCount: 45,
                successRate: '89%'
            },
            projectedVolume: {
                weekly: volumeStats.totalEstimatedVolume * 1.5,
                monthly: volumeStats.totalEstimatedVolume * 6,
                confidence: 0.85
            }
        }

        res.json(demoMetrics)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// New endpoint for Web2 benchmarking
router.get('/benchmark/:domain', async (req, res) => {
    try {
        const { domain } = req.params

        // Get AI analysis first
        const aiAnalysis = await geminiScoringService.analyzeWithAdvancedAI(domain)

        // Then benchmark against Web2
        const benchmark = await web2BenchmarkingService.benchmarkDomain(domain, aiAnalysis)

        res.json(benchmark)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// New endpoint for trading opportunities
router.get('/opportunities/:domain', async (req, res) => {
    try {
        const { domain } = req.params

        const aiAnalysis = await geminiScoringService.analyzeWithAdvancedAI(domain)
        const benchmarkData = await web2BenchmarkingService.benchmarkDomain(domain, aiAnalysis)
        const opportunities = await transactionService.generateTradingOpportunities(aiAnalysis, benchmarkData)

        res.json(opportunities)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// New endpoint for executing trades
router.post('/execute/:domain', async (req, res) => {
    try {
        const { domain } = req.params
        const { action, parameters } = req.body

        const result = await transactionService.executeTradingAction(domain, action, parameters)

        res.json(result)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Enhanced test endpoint
router.get('/test-integration/:domain', async (req, res) => {
    try {
        const { domain } = req.params
        console.log(`Full integration test for: ${domain}`)

        // Test all services
        const [aiResult, domaResult, benchmarkResult] = await Promise.allSettled([
            geminiScoringService.analyzeWithAdvancedAI(domain),
            domaIntegrationService.getDomainFullData(domain),
            web2BenchmarkingService.benchmarkDomain(domain, { scores: { investmentGrade: 75 }, valuation: { estimatedFloor: 1000, estimatedCeiling: 5000 }, insights: { recommendation: 'BUY' } })
        ])

        res.json({
            domain,
            tests: {
                ai: {
                    status: aiResult.status,
                    powered: aiResult.status === 'fulfilled' ? aiResult.value.aiPowered : false,
                    model: aiResult.status === 'fulfilled' ? aiResult.value.model : null,
                    error: aiResult.status === 'rejected' ? aiResult.reason.message : null
                },
                doma: {
                    status: domaResult.status,
                    connected: domaResult.status === 'fulfilled' ? domaResult.value.onChainData : false,
                    tokenized: domaResult.status === 'fulfilled' ? domaResult.value.tokenized : false,
                    error: domaResult.status === 'rejected' ? domaResult.reason.message : null
                },
                benchmark: {
                    status: benchmarkResult.status,
                    aiOutperforms: benchmarkResult.status === 'fulfilled' ? benchmarkResult.value.comparison?.aiOutperforms : false,
                    services: benchmarkResult.status === 'fulfilled' ? benchmarkResult.value.web2Performance?.serviceCount : 0,
                    error: benchmarkResult.status === 'rejected' ? benchmarkResult.reason.message : null
                }
            },
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

function generateDomainVariations(query) {
    const tlds = ['.com', '.io', '.xyz', '.ai', '.crypto', '.defi']
    const variations = []

    const cleanQuery = query.toLowerCase().replace(/\./g, '')

    tlds.forEach(tld => {
        variations.push({
            name: `${cleanQuery}${tld}`,
            tld: tld,
            length: cleanQuery.length
        })
    })

    return variations
}

function generateFallbackDomainData(domain) {
    return {
        name: domain.name,
        tld: domain.tld,
        length: domain.length,
        brandability: 60,
        memorability: 65,
        linguistic: 70,
        market: 55,
        web3Relevance: 50,
        rarityScore: 60,
        overall: 60,
        recommendation: 'HOLD',
        reasoning: 'Fallback analysis due to service error',
        estimatedPriceMin: 1000,
        estimatedPriceMax: 3000,
        benchmarking: { aiOutperforms: false, web2Average: 0, confidence: 0.3 },
        opportunities: { count: 0, volume: 0, types: [] },
        tokenized: false,
        onChainActivity: 0,
        aiModel: 'fallback',
        confidence: 0.3,
        aiPowered: false,
        error: 'Service unavailable'
    }
}

module.exports = router