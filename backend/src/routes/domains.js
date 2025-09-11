const express = require('express')
const router = express.Router()
const geminiScoringService = require('../services/geminiScoringService')
const gtldTrendAnalyzer = require('../services/gtldTrendAnalyzer')
const socialMediaService = require('../services/socialMediaService')
const domaIntegrationService = require('../services/domaIntegrationService')
const defiService = require('../services/defiIntegrationService')


router.post('/fractionalize/:domain', async (req, res) => {
    const { domain } = req.params
    const { shares, valuation } = req.body
    const result = await defiService.fractionalizeAsset(domain, shares, valuation)
    res.json(result)
})

router.post('/stake/:domain', async (req, res) => {
    const { domain } = req.params
    const { period, amount } = req.body
    const result = await defiService.stakeDomain(domain, period, amount)
    res.json(result)
})


// Enhanced search endpoint with guaranteed results
router.get('/search', async (req, res) => {
    try {
        const { q: query } = req.query

        if (!query) {
            return res.status(400).json({
                error: 'Query parameter required',
                domains: [],
                totalResults: 0
            })
        }

        console.log(`🔍 Advanced AI search for: ${query}`)
        const domains = generateDomainVariations(query)
        const results = []

        // Process all domains with Promise.allSettled for reliability
        const analysisPromises = domains.map(async (domainInfo) => {
            const { name: domain, tld, length } = domainInfo

            try {
                console.log(`📊 Analyzing ${domain}...`)

                // Get AI analysis with timeout protection
                const analysisPromise = geminiScoringService.analyzeWithAdvancedAI(domain)
                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Analysis timeout')), 30000)
                )

                const aiAnalysis = await Promise.race([analysisPromise, timeoutPromise])

                // Get additional data in parallel
                const [domaData, gtldTrends] = await Promise.allSettled([
                    domaIntegrationService.getDomainFullData(domain).catch(() => ({})),
                    gtldTrendAnalyzer.analyzeGTLDTrends().catch(() => ({ gtldAnalysis: {} }))
                ])

                const domaInfo = domaData.status === 'fulfilled' ? domaData.value : {}
                const gtldInfo = gtldTrends.status === 'fulfilled'
                    ? gtldTrends.value.gtldAnalysis[tld] || {}
                    : {}

                return createEnhancedDomainResult(domain, tld, length, aiAnalysis, domaInfo, gtldInfo)

            } catch (error) {
                console.error(`❌ Analysis failed for ${domain}:`, error.message)
                // Return fallback result instead of failing
                return createFallbackDomainResult(domain, tld, length, error.message)
            }
        })

        // Wait for all analyses to complete (or fail)
        const analysisResults = await Promise.allSettled(analysisPromises)

        // Extract all results, including fallbacks
        analysisResults.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value) {
                results.push(result.value)
            } else {
                // Create emergency fallback if even our fallback failed
                const domain = domains[index]
                results.push(createMinimalFallbackResult(domain.name, domain.tld, domain.length))
            }
        })

        // Get market overview for context
        let marketOverview = {}
        try {
            const gtldTrends = await gtldTrendAnalyzer.analyzeGTLDTrends()
            marketOverview = {
                marketOverview: gtldTrends.marketOverview || {},
                recommendations: gtldTrends.investmentRecommendations?.slice(0, 3) || [],
                topTrends: gtldTrends.trendPredictions?.emergingTrends || []
            }
        } catch (error) {
            console.error('Failed to get market overview:', error.message)
        }

        // Calculate summary statistics
        const summaryStats = calculateSummaryStats(results)

        console.log(`✅ Returning ${results.length} results for "${query}"`)

        res.json({
            query,
            domains: results,
            gtldInsights: marketOverview,
            analysis: summaryStats,
            totalResults: results.length,
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('🚨 Critical search error:', error)

        // Even on critical failure, return basic structure
        const fallbackDomains = generateDomainVariations(req.query.q || '')
            .map(d => createMinimalFallbackResult(d.name, d.tld, d.length))

        res.status(500).json({
            error: 'Search temporarily unavailable',
            message: 'Using fallback analysis',
            query: req.query.q || '',
            domains: fallbackDomains,
            totalResults: fallbackDomains.length,
            timestamp: new Date().toISOString()
        })
    }
})

// Network status endpoint
router.get('/network-status', async (req, res) => {
    try {
        const domaBlockchainService = require('../services/domaBlockchainService')

        const networkInfo = await domaBlockchainService.getNetworkInfo()
        const balance = await domaBlockchainService.getBalance()

        res.json({
            ...networkInfo,
            walletBalance: balance?.balance || '0',
            walletAddress: balance?.address || 'Not connected',
            canExecuteTransactions: parseFloat(balance?.balance || '0') > 0,
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        res.status(500).json({
            error: 'Network status check failed',
            message: error.message,
            connected: false,
            timestamp: new Date().toISOString()
        })
    }
})

// Transaction verification endpoint
router.get('/verify/:txHash', async (req, res) => {
    try {
        const { txHash } = req.params
        const realTransactionService = require('../services/realTransactionService')

        const verification = await realTransactionService.verifyTransaction(txHash)

        res.json({
            txHash,
            ...verification,
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        res.status(500).json({
            txHash: req.params.txHash,
            verified: false,
            error: 'Verification failed',
            message: error.message,
            timestamp: new Date().toISOString()
        })
    }
})

// Domain availability check
router.get('/available/:domain', async (req, res) => {
    try {
        const { domain } = req.params
        const domaBlockchainService = require('../services/domaBlockchainService')

        const availability = await domaBlockchainService.isDomainAvailable(domain)

        res.json({
            domain,
            ...availability,
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        res.status(500).json({
            domain: req.params.domain,
            available: false,
            error: error.message,
            timestamp: new Date().toISOString()
        })
    }
})

// Volume statistics endpoint
router.get('/volume-stats', async (req, res) => {
    try {
        const realTransactionService = require('../services/realTransactionService')
        const stats = realTransactionService.getVolumeGenerationStats()

        res.json({
            ...stats,
            timestamp: new Date().toISOString()
        })
    } catch (error) {
        res.status(500).json({
            error: 'Volume stats unavailable',
            message: error.message,
            timestamp: new Date().toISOString()
        })
    }
})

// Transaction execution endpoint
router.post('/execute/:domain', async (req, res) => {
    try {
        const { domain } = req.params
        const { action, parameters } = req.body

        console.log(`🔄 Executing ${action} for ${domain}`)

        const realTransactionService = require('../services/realTransactionService')
        const result = await realTransactionService.executeRealTransaction(domain, action, parameters)

        res.json({
            success: true,
            domain,
            action,
            message: result.message,
            txHash: result.txHash,
            volume: result.volume,
            timestamp: new Date().toISOString()
        })

    } catch (error) {
        console.error('💥 Transaction execution error:', error.message)
        res.status(500).json({
            success: false,
            domain: req.params.domain,
            error: error.message,
            message: 'Transaction execution failed',
            timestamp: new Date().toISOString()
        })
    }
})

// Helper function to create enhanced domain results
function createEnhancedDomainResult(domain, tld, length, aiAnalysis, domaInfo, gtldInfo) {
    const scores = aiAnalysis.scores || {}
    const insights = aiAnalysis.insights || {}
    const valuation = aiAnalysis.valuation || {}

    return {
        name: domain,
        tld: tld,
        length: length,

        // AI-powered scores
        brandability: scores.brandability || 70,
        memorability: scores.marketPotential || 65,
        linguistic: scores.linguistic || 75,
        market: scores.investmentGrade || 60,
        web3Relevance: scores.onChainValue || 50,
        rarityScore: scores.rarityScore || 60,
        overall: Math.round(Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length) || 67,

        // Advanced insights
        recommendation: insights.recommendation || 'HOLD',
        reasoning: `${insights.recommendation || 'HOLD'} recommendation based on ${aiAnalysis.model || 'AI'} analysis`,
        marketPosition: insights.marketPosition || 'STABLE',

        // Valuation
        estimatedPriceMin: valuation.estimatedFloor || 1000,
        estimatedPriceMax: valuation.estimatedCeiling || 5000,
        liquidityScore: scores.liquidityScore || 60,
        trendMomentum: insights.marketPosition || 'STABLE',

        // gTLD insights
        gtldTrend: gtldInfo.trends?.momentum || 'STABLE',
        gtldRarity: gtldInfo.scoring?.rarityScore || 50,
        gtldRecommendation: gtldInfo.recommendation || 'HOLD',

        // Technical metadata
        aiModel: aiAnalysis.model || 'advanced-heuristic',
        confidence: aiAnalysis.confidence || 0.78,
        aiPowered: aiAnalysis.aiPowered || false,

        // Blockchain data
        tokenized: domaInfo.tokenized || false,
        onChainActivity: domaInfo.activity?.totalEvents || 0,
        owner: domaInfo.owner || null,

        timestamp: new Date().toISOString()
    }
}

// Helper function to create fallback results when analysis fails
function createFallbackDomainResult(domain, tld, length, errorMessage) {
    const baseScore = Math.max(30, 60 - (length > 10 ? 20 : 0))

    return {
        name: domain,
        tld: tld,
        length: length,

        // Basic scores
        brandability: baseScore + 10,
        memorability: baseScore,
        linguistic: baseScore + 5,
        market: baseScore - 5,
        web3Relevance: 40,
        rarityScore: Math.max(20, 80 - length * 5),
        overall: baseScore,

        // Conservative insights
        recommendation: 'RESEARCH',
        reasoning: 'Analysis temporarily unavailable - manual research recommended',
        marketPosition: 'EMERGING',

        // Conservative valuation
        estimatedPriceMin: length <= 6 ? 500 : 100,
        estimatedPriceMax: length <= 6 ? 2000 : 800,
        liquidityScore: 40,
        trendMomentum: 'STABLE',

        // Default gTLD data
        gtldTrend: 'STABLE',
        gtldRarity: 50,
        gtldRecommendation: 'HOLD',

        // Metadata
        aiModel: 'fallback-heuristic',
        confidence: 0.4,
        aiPowered: false,

        // Default blockchain data
        tokenized: false,
        onChainActivity: 0,
        owner: null,

        error: 'Analysis unavailable',
        errorDetails: errorMessage,
        timestamp: new Date().toISOString()
    }
}

// Emergency minimal fallback for critical failures
function createMinimalFallbackResult(domain, tld, length) {
    return {
        name: domain,
        tld: tld,
        length: length,
        brandability: 50,
        memorability: 45,
        linguistic: 50,
        market: 40,
        web3Relevance: 30,
        rarityScore: 40,
        overall: 42,
        recommendation: 'RESEARCH',
        reasoning: 'Service temporarily unavailable',
        marketPosition: 'UNKNOWN',
        estimatedPriceMin: 100,
        estimatedPriceMax: 1000,
        liquidityScore: 30,
        trendMomentum: 'STABLE',
        gtldTrend: 'STABLE',
        gtldRarity: 40,
        gtldRecommendation: 'HOLD',
        aiModel: 'emergency-fallback',
        confidence: 0.3,
        aiPowered: false,
        tokenized: false,
        onChainActivity: 0,
        owner: null,
        error: 'Service unavailable',
        timestamp: new Date().toISOString()
    }
}

// Calculate summary statistics from results
function calculateSummaryStats(results) {
    if (!results.length) {
        return {
            aiPowered: false,
            totalRarityScore: 0,
            strongBuys: 0,
            avgConfidence: 30
        }
    }

    return {
        aiPowered: results.some(d => d.aiPowered),
        totalRarityScore: Math.round(results.reduce((sum, d) => sum + (d.rarityScore || 0), 0) / results.length),
        strongBuys: results.filter(d => d.recommendation === 'STRONG_BUY').length,
        avgConfidence: Math.round(results.reduce((sum, d) => sum + (d.confidence || 0), 0) / results.length * 100),
        averageOverall: Math.round(results.reduce((sum, d) => sum + (d.overall || 0), 0) / results.length),
        tokenizedCount: results.filter(d => d.tokenized).length
    }
}

// Generate domain variations for a search query
function generateDomainVariations(query) {
    const tlds = ['.com', '.io', '.xyz', '.ai', '.crypto', '.defi']
    const variations = []

    const cleanQuery = query.toLowerCase().replace(/\./g, '').trim()

    if (!cleanQuery) {
        return variations
    }

    tlds.forEach(tld => {
        variations.push({
            name: `${cleanQuery}${tld}`,
            tld: tld,
            length: cleanQuery.length
        })
    })

    return variations
}

module.exports = router