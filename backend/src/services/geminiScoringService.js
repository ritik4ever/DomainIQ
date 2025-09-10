const { GoogleGenerativeAI } = require('@google/generative-ai')
const domaIntegrationService = require('./domaIntegrationService')

class GeminiScoringService {
    constructor() {
        this.genAI = null
        this.hasGemini = false
        this.requestCount = 0
        this.minutelyLimit = 15
        this.lastReset = Math.floor(Date.now() / 60000)
        this.apiKey = process.env.GEMINI_API_KEY
        this.cache = new Map()
        this.cacheExpiry = 3600000

        // Queue and rate limiting
        this.requestQueue = []
        this.processing = false
        this.lastRequestTime = 0
        this.minInterval = 5000 // 5 seconds between requests
        this.maxRetries = 3
        this.retryDelay = 5000 // 5 seconds
        this.dailyQuotaExhausted = false
        this.lastQuotaCheck = Date.now()
        this.quotaResetTime = this.getNextMidnight()
        this.resetInterval = null

        console.log('Initializing Gemini service...')
        console.log('GEMINI_API_KEY present:', !!this.apiKey)
        console.log('API Key preview:', this.apiKey ? `${this.apiKey.substring(0, 20)}...` : 'MISSING')
        console.log('Next quota reset:', new Date(this.quotaResetTime).toISOString())

        if (this.apiKey) {
            try {
                this.genAI = new GoogleGenerativeAI(this.apiKey)
                this.hasGemini = true
                console.log('✅ Gemini AI service initialized (Free Tier - 15 RPM)')
            } catch (error) {
                console.error('❌ Gemini initialization error:', error.message)
                this.hasGemini = false
            }
        } else {
            console.log('⚠️ Gemini API key not found, using advanced heuristics only')
            this.hasGemini = false
        }

        // Setup daily quota reset mechanism
        this.setupDailyReset()
    }

    setupDailyReset() {
        // Clear any existing interval
        if (this.resetInterval) {
            clearInterval(this.resetInterval)
        }

        // Check for quota reset every minute
        this.resetInterval = setInterval(() => {
            const now = Date.now()
            if (now >= this.quotaResetTime) {
                this.performDailyReset()
            }
        }, 60000) // Check every minute

        console.log('🕒 Daily reset mechanism activated')
    }

    performDailyReset() {
        const wasExhausted = this.dailyQuotaExhausted

        // Reset quota flags
        this.dailyQuotaExhausted = false
        this.lastQuotaCheck = Date.now()
        this.quotaResetTime = this.getNextMidnight()

        // Reset minute-based counters
        this.requestCount = 0
        this.lastReset = Math.floor(Date.now() / 60000)

        if (wasExhausted) {
            console.log('🔄 Gemini quota reset for new day - service restored!')
            console.log('📅 Next reset scheduled for:', new Date(this.quotaResetTime).toISOString())
        } else {
            console.log('🔄 Daily quota maintenance reset completed')
        }

        // Clean old cache entries (older than 24 hours)
        this.cleanOldCache()
    }

    getNextMidnight() {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(0, 0, 0, 0)
        return tomorrow.getTime()
    }

    cleanOldCache() {
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000)
        let cleaned = 0

        for (const [key, value] of this.cache.entries()) {
            if (value.timestamp < oneDayAgo) {
                this.cache.delete(key)
                cleaned++
            }
        }

        if (cleaned > 0) {
            console.log(`🧹 Cleaned ${cleaned} old cache entries`)
        }
    }

    checkRateLimit() {
        const currentMinute = Math.floor(Date.now() / 60000)
        if (currentMinute !== this.lastReset) {
            this.requestCount = 0
            this.lastReset = currentMinute
        }
        const hasQuota = this.requestCount < this.minutelyLimit
        console.log(`Rate limit check: ${this.requestCount}/${this.minutelyLimit} requests used, hasQuota: ${hasQuota}`)
        return hasQuota
    }

    async analyzeWithAdvancedAI(domainName) {
        console.log(`🤖 GEMINI ANALYSIS REQUESTED for: ${domainName}`)

        // Check for automatic quota reset
        if (Date.now() >= this.quotaResetTime && this.dailyQuotaExhausted) {
            console.log('🔄 Automatic quota reset triggered')
            this.performDailyReset()
        }

        // Check cache first
        const cacheKey = `analysis-${domainName}`
        const cached = this.cache.get(cacheKey)
        if (cached && (Date.now() - cached.timestamp < this.cacheExpiry)) {
            console.log(`📋 Using cached analysis for ${domainName}`)
            return cached.data
        }

        // Skip Gemini entirely if quota exhausted
        if (this.dailyQuotaExhausted) {
            const hoursUntilReset = Math.ceil((this.quotaResetTime - Date.now()) / (1000 * 60 * 60))
            console.log(`⚠️ Gemini quota exhausted, using heuristic analysis for ${domainName}`)
            console.log(`⏰ Quota resets in approximately ${hoursUntilReset} hours`)
            return this.getFallbackAnalysis(domainName)
        }

        // Add to queue for processing
        return new Promise((resolve, reject) => {
            this.requestQueue.push({
                domainName,
                resolve,
                reject,
                timestamp: Date.now(),
                retries: 0
            })
            console.log(`📝 Added ${domainName} to queue (position: ${this.requestQueue.length})`)
            this.processQueue()
        })
    }

    isQuotaError(error) {
        const quotaIndicators = [
            '429',
            'quota',
            'Too Many Requests',
            'rate limit exceeded',
            'quota exceeded',
            'daily limit exceeded',
            'resource exhausted'
        ]
        const errorMessage = error.message.toLowerCase()
        return quotaIndicators.some(indicator =>
            errorMessage.includes(indicator.toLowerCase())
        )
    }

    async processQueue() {
        if (this.processing || this.requestQueue.length === 0) {
            return
        }

        console.log(`🔄 Processing queue with ${this.requestQueue.length} items`)
        this.processing = true

        while (this.requestQueue.length > 0) {
            const request = this.requestQueue.shift()
            const { domainName, resolve, reject, retries } = request

            try {
                console.log(`⚡ Processing ${domainName} (attempt ${retries + 1})`)

                // Ensure minimum interval between requests
                const now = Date.now()
                const timeSinceLastRequest = now - this.lastRequestTime
                if (timeSinceLastRequest < this.minInterval) {
                    const waitTime = this.minInterval - timeSinceLastRequest
                    console.log(`⏱️ Waiting ${waitTime}ms before next request`)
                    await new Promise(resolve => setTimeout(resolve, waitTime))
                }

                const result = await this.executeAnalysis(domainName)
                this.lastRequestTime = Date.now()

                // Cache successful results
                const cacheKey = `analysis-${domainName}`
                this.cache.set(cacheKey, {
                    data: result,
                    timestamp: Date.now()
                })

                resolve(result)
                console.log(`✅ Successfully processed ${domainName}`)

                // Small delay between queue items to prevent overwhelming the API
                await new Promise(resolve => setTimeout(resolve, 1000))

            } catch (error) {
                console.error(`❌ Error processing ${domainName}:`, error.message)

                // Handle quota errors immediately
                if (this.isQuotaError(error)) {
                    const hoursUntilReset = Math.ceil((this.quotaResetTime - Date.now()) / (1000 * 60 * 60))
                    console.log(`🚫 Gemini quota exhausted permanently until reset`)
                    console.log(`⏰ Quota resets in approximately ${hoursUntilReset} hours`)
                    this.dailyQuotaExhausted = true

                    // Use fallback for current request
                    try {
                        const fallbackResult = await this.getFallbackAnalysis(domainName)
                        resolve(fallbackResult)
                    } catch (fallbackError) {
                        reject(fallbackError)
                    }

                    // Process remaining queue items with fallback
                    this.processRemainingQueueWithFallback()
                    break
                }

                // Handle retryable errors
                if (this.shouldRetry(error) && retries < this.maxRetries) {
                    console.log(`🔄 Retrying ${domainName} in ${this.retryDelay}ms (attempt ${retries + 2})`)

                    // Re-add to queue with incremented retry count
                    setTimeout(() => {
                        this.requestQueue.unshift({
                            ...request,
                            retries: retries + 1
                        })
                        this.processQueue()
                    }, this.retryDelay)

                    break // Stop processing current queue to wait for retry
                } else {
                    // Max retries reached or non-retryable error, use fallback
                    console.log(`🔄 Using fallback analysis for ${domainName}`)
                    try {
                        const fallbackResult = await this.getFallbackAnalysis(domainName)
                        resolve(fallbackResult)
                    } catch (fallbackError) {
                        reject(fallbackError)
                    }
                }
            }
        }

        this.processing = false
        console.log(`✅ Queue processing completed`)
    }

    async processRemainingQueueWithFallback() {
        console.log(`🔄 Processing remaining ${this.requestQueue.length} items with fallback`)

        while (this.requestQueue.length > 0) {
            const { domainName, resolve, reject } = this.requestQueue.shift()

            try {
                const fallbackResult = await this.getFallbackAnalysis(domainName)
                resolve(fallbackResult)
                console.log(`✅ Fallback analysis completed for ${domainName}`)
            } catch (error) {
                console.error(`❌ Fallback failed for ${domainName}:`, error.message)
                reject(error)
            }
        }

        this.processing = false
    }

    shouldRetry(error) {
        if (this.isQuotaError(error)) {
            return false // Don't retry quota errors
        }

        const retryableErrors = [
            'temporarily unavailable',
            'service unavailable',
            'timeout',
            'network error',
            'connection',
            'ENOTFOUND',
            'ECONNRESET'
        ]

        const errorMessage = error.message.toLowerCase()
        return retryableErrors.some(retryableError =>
            errorMessage.includes(retryableError)
        )
    }

    async executeAnalysis(domainName) {
        console.log(`🎯 Executing analysis for: ${domainName}`)

        try {
            // Get real Doma on-chain data first
            console.log(`🔍 Fetching Doma data for: ${domainName}`)
            const domaData = await domaIntegrationService.getDomainFullData(domainName)
            console.log(`📊 Doma data received for ${domainName}:`, {
                exists: domaData.exists,
                tokenized: domaData.tokenized,
                onChainData: domaData.onChainData
            })

            console.log(`🎯 Fetching rarity data for: ${domainName}`)
            const rarityData = await domaIntegrationService.getDomainRarityData(domainName)
            console.log(`📈 Rarity data received for ${domainName}`)

            // Check Gemini availability and rate limits
            console.log(`🔧 Gemini availability check:`)
            console.log(`   - hasGemini: ${this.hasGemini}`)
            console.log(`   - rateLimit OK: ${this.checkRateLimit()}`)
            console.log(`   - API key present: ${!!this.apiKey}`)
            console.log(`   - dailyQuotaExhausted: ${this.dailyQuotaExhausted}`)

            if (!this.hasGemini || !this.checkRateLimit() || this.dailyQuotaExhausted) {
                console.log(`⚠️ Using fallback analysis for ${domainName}`)
                console.log(`   Reason: hasGemini=${this.hasGemini}, rateOK=${this.checkRateLimit()}, quotaExhausted=${this.dailyQuotaExhausted}`)
                return this.getAdvancedHeuristicAnalysis(domainName, domaData, rarityData)
            }

            // Make Gemini API call
            this.requestCount++
            console.log(`🔥 CALLING GEMINI API - Request ${this.requestCount}/${this.minutelyLimit} for ${domainName}`)

            const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

            const prompt = `Analyze domain "${domainName}" with real blockchain data:
            
            ON-CHAIN DATA:
            - Tokenized: ${domaData.tokenized}
            - Owner: ${domaData.owner || 'Not tokenized'}
            - Network: ${domaData.networkId || 'None'}
            - Total Events: ${domaData.activity?.totalEvents || 0}
            - Active Listings: ${domaData.marketplace?.hasActiveListings || false}
            
            RARITY ANALYSIS:
            - Length Rarity: ${rarityData.lengthRarity?.rarityScore || 0}/100
            - Total in TLD: ${rarityData.totalInTLD}
            - Tokenization Rate: ${rarityData.tokenizedCount && rarityData.totalInTLD ? ((rarityData.tokenizedCount / rarityData.totalInTLD) * 100).toFixed(1) : 0}%
            - Price Floor: $${rarityData.priceComparables?.floor || 0}
            - Price Ceiling: $${rarityData.priceComparables?.ceiling || 0}
            
            Provide professional analysis in JSON format only:
            {
                "scores": {
                    "brandability": 75,
                    "rarityScore": 60,
                    "marketPotential": 80,
                    "onChainValue": 45,
                    "liquidityScore": 55,
                    "investmentGrade": 65
                },
                "insights": {
                    "strengths": ["High brandability", "Premium TLD"],
                    "marketPosition": "GROWTH",
                    "recommendation": "BUY",
                    "onChainInsight": "Domain shows potential for tokenization"
                },
                "valuation": {
                    "estimatedFloor": 2500,
                    "estimatedCeiling": 8500,
                    "confidenceLevel": 0.8
                }
            }`

            console.log(`📤 Sending prompt to Gemini for ${domainName}`)
            const result = await model.generateContent(prompt)
            const response = await result.response
            const text = response.text()

            console.log(`📥 Received Gemini response for ${domainName}`)
            console.log(`📝 Response preview: ${text.substring(0, 200)}...`)

            return this.parseGeminiResponse(domainName, text, domaData, rarityData)

        } catch (error) {
            // Check if it's a quota/rate limit error
            if (this.isQuotaError(error)) {
                console.error(`⚠️ Gemini quota/rate limit error for ${domainName}:`, error.message)
                this.dailyQuotaExhausted = true
                throw error // Will be caught by processQueue for quota handling
            } else {
                console.error(`❌ Gemini API error for ${domainName}:`, error.message)
                // For non-retryable errors, fall back immediately
                return this.getFallbackAnalysis(domainName)
            }
        }
    }

    async getFallbackAnalysis(domainName) {
        console.log(`🔄 Getting fallback analysis for ${domainName}`)
        try {
            const domaData = await domaIntegrationService.getDomainFullData(domainName).catch(() => ({}))
            const rarityData = await domaIntegrationService.getDomainRarityData(domainName).catch(() => ({}))
            return this.getAdvancedHeuristicAnalysis(domainName, domaData, rarityData)
        } catch (error) {
            console.error(`❌ Fallback analysis failed for ${domainName}:`, error.message)
            // Return minimal analysis if everything fails
            return this.getMinimalAnalysis(domainName)
        }
    }

    getMinimalAnalysis(domainName) {
        const [name, tld] = domainName.split('.')
        return {
            domain: domainName,
            aiPowered: false,
            model: 'minimal-fallback',
            onChainData: false,
            scores: {
                brandability: 50,
                rarityScore: 40,
                marketPotential: 45,
                onChainValue: 30,
                liquidityScore: 35,
                investmentGrade: 40
            },
            insights: {
                strengths: ['Basic domain structure'],
                marketPosition: 'EMERGING',
                recommendation: 'RESEARCH',
                onChainInsight: 'Analysis unavailable - check manually'
            },
            valuation: {
                estimatedFloor: 100,
                estimatedCeiling: 1000,
                confidenceLevel: 0.3
            },
            blockchain: {
                tokenized: false,
                owner: null,
                networkId: null,
                totalEvents: 0
            },
            rarity: {},
            confidence: 0.3,
            timestamp: new Date().toISOString(),
            error: 'Limited analysis due to service unavailability'
        }
    }

    parseGeminiResponse(domainName, text, domaData, rarityData) {
        try {
            console.log(`🔍 Parsing Gemini response for ${domainName}`)

            // Extract JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
                const analysis = JSON.parse(jsonMatch[0])
                console.log(`✅ Successfully parsed Gemini JSON for ${domainName}`)

                return {
                    domain: domainName,
                    aiPowered: true,
                    model: 'gemini-1.5-flash',
                    onChainData: domaData.onChainData || false,
                    scores: analysis.scores || {},
                    insights: analysis.insights || {},
                    valuation: analysis.valuation || {},
                    blockchain: {
                        tokenized: domaData.tokenized || false,
                        owner: domaData.owner || null,
                        networkId: domaData.networkId || null,
                        totalEvents: domaData.activity?.totalEvents || 0
                    },
                    rarity: rarityData,
                    confidence: analysis.valuation?.confidenceLevel || 0.8,
                    timestamp: new Date().toISOString()
                }
            } else {
                console.warn(`⚠️ No JSON found in Gemini response for ${domainName}`)
                throw new Error('No valid JSON in Gemini response')
            }
        } catch (error) {
            console.error(`❌ Gemini parse error for ${domainName}:`, error.message)
            console.log(`🔄 Using fallback analysis for ${domainName}`)
            return this.getAdvancedHeuristicAnalysis(domainName, domaData, rarityData)
        }
    }

    getAdvancedHeuristicAnalysis(domainName, domaData = {}, rarityData = {}) {
        console.log(`🧠 Running heuristic analysis for ${domainName}`)

        const [name, tld] = domainName.split('.')
        const length = name ? name.length : 0

        // Calculate scores
        let scores = this.calculateAdvancedScores(name || '', tld || 'com', length, domaData, rarityData)
        let insights = this.generateAdvancedInsights(name || '', tld || 'com', scores, domaData)
        let valuation = this.calculateRealValuation(name || '', tld || 'com', scores, rarityData)

        console.log(`✅ Heuristic analysis complete for ${domainName}`)

        return {
            domain: domainName,
            aiPowered: false,
            model: 'advanced-heuristic-v2',
            onChainData: domaData.onChainData || false,
            scores,
            insights,
            valuation,
            blockchain: {
                tokenized: domaData.tokenized || false,
                owner: domaData.owner || null,
                networkId: domaData.networkId || null,
                totalEvents: domaData.activity?.totalEvents || 0
            },
            rarity: rarityData,
            confidence: domaData.onChainData ? 0.85 : 0.65,
            timestamp: new Date().toISOString()
        }
    }

    calculateAdvancedScores(name, tld, length, domaData, rarityData) {
        let brandability = this.calculateBrandability(name, tld, length)
        let rarityScore = rarityData.lengthRarity?.rarityScore || this.calculateRarityScore(name, tld, length)
        let marketPotential = this.calculateMarketPotential(name, tld)
        let onChainValue = this.calculateOnChainValue(domaData)
        let liquidityScore = this.calculateLiquidityScore(domaData, rarityData)
        let investmentGrade = this.calculateInvestmentGrade(brandability, rarityScore, onChainValue, liquidityScore)

        return {
            brandability: Math.min(100, Math.max(0, brandability)),
            rarityScore: Math.min(100, Math.max(0, rarityScore)),
            marketPotential: Math.min(100, Math.max(0, marketPotential)),
            onChainValue: Math.min(100, Math.max(0, onChainValue)),
            liquidityScore: Math.min(100, Math.max(0, liquidityScore)),
            investmentGrade: Math.min(100, Math.max(0, investmentGrade))
        }
    }

    calculateOnChainValue(domaData) {
        if (!domaData.onChainData) return 30

        let score = 50
        if (domaData.tokenized) {
            score += 25
            if (domaData.activity?.totalEvents > 0) {
                score += Math.min(15, domaData.activity.totalEvents * 2)
            }
            if (domaData.marketplace?.hasActiveListings) {
                score += 10
            }
        }
        return score
    }

    calculateLiquidityScore(domaData, rarityData) {
        let score = 40

        if (rarityData.marketActivity) {
            const { activeListings, totalTransactions, liquidityScore } = rarityData.marketActivity
            score += Math.min(30, liquidityScore || 0)
            score += Math.min(20, (totalTransactions || 0) / 10)
        }

        if (domaData.marketplace?.hasActiveListings) {
            score += 10
        }
        return score
    }

    calculateInvestmentGrade(brandability, rarity, onChain, liquidity) {
        return Math.round(
            (brandability * 0.25) +
            (rarity * 0.30) +
            (onChain * 0.30) +
            (liquidity * 0.15)
        )
    }

    calculateRealValuation(name, tld, scores, rarityData) {
        const baseValue = scores.investmentGrade * 100
        const rarityMultiplier = 1 + (scores.rarityScore / 200)

        let floor = Math.round(baseValue * 0.5)
        let ceiling = Math.round(baseValue * rarityMultiplier * 2)

        const comparables = rarityData.priceComparables
        if (comparables && comparables.count > 0) {
            floor = Math.max(floor, Math.round(comparables.floor * 0.8))
            ceiling = Math.max(ceiling, Math.round(comparables.ceiling * 1.2))
        }

        return {
            estimatedFloor: Math.max(100, floor),
            estimatedCeiling: Math.max(500, ceiling),
            confidenceLevel: rarityData.priceComparables?.count > 0 ? 0.9 : 0.7
        }
    }

    calculateBrandability(name, tld, length) {
        let score = 60
        if (length <= 4) score += 25
        else if (length <= 6) score += 15
        else if (length <= 8) score += 5
        else if (length > 12) score -= 20

        const vowelRatio = (name.match(/[aeiou]/gi) || []).length / length
        if (vowelRatio >= 0.3 && vowelRatio <= 0.6) score += 10

        if (/^[a-z]+$/i.test(name)) score += 15

        const premiumTlds = {
            '.com': 20, '.io': 15, '.ai': 18, '.co': 12, '.org': 10,
            'com': 20, 'io': 15, 'ai': 18, 'co': 12, 'org': 10
        }
        score += premiumTlds[tld] || 0

        return score
    }

    calculateMarketPotential(name, tld) {
        let score = 50

        const industries = {
            tech: ['ai', 'ml', 'api', 'dev', 'code', 'app', 'software', 'cloud', 'data'],
            crypto: ['crypto', 'bitcoin', 'btc', 'eth', 'defi', 'nft', 'dao', 'web3', 'blockchain'],
            business: ['biz', 'corp', 'inc', 'llc', 'pro', 'consulting', 'services', 'solutions']
        }

        Object.entries(industries).forEach(([sector, keywords]) => {
            const matches = keywords.filter(kw => name.toLowerCase().includes(kw)).length
            if (matches > 0) {
                score += matches * (sector === 'crypto' ? 15 : sector === 'tech' ? 12 : 8)
            }
        })

        const tldMarketBonus = {
            '.com': 25, '.io': 20, '.ai': 22, '.co': 15, '.net': 10, '.org': 8,
            'com': 25, 'io': 20, 'ai': 22, 'co': 15, 'net': 10, 'org': 8
        }
        score += tldMarketBonus[tld] || 0

        return score
    }

    calculateRarityScore(name, tld, length) {
        let score = 40

        const lengthRarity = {
            2: 95, 3: 90, 4: 85, 5: 75, 6: 65, 7: 55, 8: 45, 9: 35, 10: 25
        }
        score = lengthRarity[length] || 15

        const uniqueChars = new Set(name.toLowerCase().split('')).size
        const uniquenessRatio = uniqueChars / length
        score += uniquenessRatio * 20

        return Math.min(95, score)
    }

    generateAdvancedInsights(name, tld, scores, domaData) {
        const overall = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length
        let strengths = []

        if (scores.brandability > 80) strengths.push('Excellent brandability')
        if (scores.rarityScore > 80) strengths.push('High rarity value')
        if (domaData.tokenized) strengths.push('Already tokenized on blockchain')
        if (domaData.activity?.totalEvents > 5) strengths.push('Strong on-chain activity')
        if (name.length <= 6) strengths.push('Premium length')

        let marketPosition = 'STABLE'
        if (overall > 85) marketPosition = 'PREMIUM'
        else if (overall > 70) marketPosition = 'GROWTH'
        else if (overall > 55) marketPosition = 'STABLE'
        else marketPosition = 'EMERGING'

        let recommendation = 'HOLD'
        if (overall > 80 && scores.rarityScore > 75) recommendation = 'STRONG_BUY'
        else if (overall > 70) recommendation = 'BUY'
        else if (overall > 55) recommendation = 'HOLD'
        else recommendation = 'AVOID'

        return {
            strengths: strengths.length ? strengths : ['Standard domain characteristics'],
            marketPosition,
            recommendation,
            onChainInsight: domaData.tokenized
                ? `Domain is already tokenized with ${domaData.activity?.totalEvents || 0} on-chain events`
                : 'Domain not yet tokenized - potential opportunity for blockchain integration'
        }
    }

    // Manual quota reset (for testing or forced reset)
    resetDailyQuota() {
        this.performDailyReset()
        console.log('🔄 Manual daily quota reset performed')
    }

    // Clear queue and reset processing state
    clearQueue() {
        this.requestQueue = []
        this.processing = false
        console.log('🧹 Request queue cleared')
    }

    // Cleanup method for graceful shutdown
    shutdown() {
        if (this.resetInterval) {
            clearInterval(this.resetInterval)
            this.resetInterval = null
        }
        this.clearQueue()
        console.log('🛑 GeminiScoringService shutdown completed')
    }

    // Get comprehensive usage stats including reset information
    getUsageStats() {
        const now = Date.now()
        const hoursUntilReset = Math.ceil((this.quotaResetTime - now) / (1000 * 60 * 60))

        return {
            hasGeminiAPI: this.hasGemini,
            apiKeyPresent: !!this.apiKey,
            requestsUsed: this.requestCount,
            minutelyLimit: this.minutelyLimit,
            remaining: this.minutelyLimit - this.requestCount,
            dailyQuotaExhausted: this.dailyQuotaExhausted,
            hoursUntilReset: Math.max(0, hoursUntilReset),
            nextResetTime: new Date(this.quotaResetTime).toISOString(),
            model: 'gemini-1.5-flash',
            resetTime: new Date(this.lastReset * 60000 + 60000).toISOString(),
            queue: {
                pending: this.requestQueue.length,
                processing: this.processing,
                lastRequestTime: new Date(this.lastRequestTime).toISOString()
            },
            cache: {
                size: this.cache.size,
                expiryTime: this.cacheExpiry
            }
        }
    }
}

module.exports = new GeminiScoringService()