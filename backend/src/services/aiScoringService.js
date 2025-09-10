const OpenAI = require('openai')

class AIScoringService {
    constructor() {
        this.openai = null
        this.hasOpenAI = false
        this.requestCount = 0
        this.dailyLimit = 50 // Conservative limit for free tier
        this.lastReset = new Date().getDate()

        if (process.env.GEMINI_API_KEY) {
            this.openai = new OpenAI({
                apiKey: process.env.GEMINI_API_KEY,
                baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
            })
            this.hasOpenAI = true
            this.model = 'gemini-2.5-flash' // or any Gemini model of your choice
            console.log('✅ Gemini service initialized (Free Tier)')
        } else {
            console.log('⚠️ Gemini API key not found, using fallback scoring')
        }
    }

    checkDailyLimit() {
        const currentDay = new Date().getDate()
        if (currentDay !== this.lastReset) {
            this.requestCount = 0
            this.lastReset = currentDay
        }

        return this.requestCount < this.dailyLimit
    }

    async analyzeDomain(domainName) {
        // Always try fallback first to save API calls, use OpenAI for premium analysis only
        const fallbackAnalysis = this.getFallbackAnalysis(domainName)

        if (!this.hasOpenAI || !this.checkDailyLimit()) {
            console.log(`Using fallback analysis for ${domainName} (API limit: ${this.requestCount}/${this.dailyLimit})`)
            return fallbackAnalysis
        }

        // Only use OpenAI for domains that seem premium (short, good TLD, etc.)
        if (!this.shouldUseAI(domainName)) {
            return fallbackAnalysis
        }

        try {
            this.requestCount++
            console.log(`OpenAI request ${this.requestCount}/${this.dailyLimit} for ${domainName}`)

            // Shorter, more focused prompt to save tokens
            const prompt = `Rate domain "${domainName}" (0-100): Brandability, Market, Linguistic, Investment, Web3. JSON only: {"brandability":X,"market":X,"linguistic":X,"investment":X,"web3":X,"overall":X,"rec":"BUY/HOLD/AVOID","reason":"brief reason"}`

            const response = await this.openai.chat.completions.create({
                model: this.model,
                messages: [
                    { role: 'user', content: prompt }
                ],
                temperature: 0.3,
                max_tokens: 300 // Reduced tokens to save costs
            })

            const analysis = this.parseAIResponse(response.choices[0].message.content)
            return this.formatAnalysis(domainName, analysis, true) // true = AI powered

        } catch (error) {
            console.error('OpenAI error:', error.message)
            // If API fails, return fallback but mark it clearly
            return fallbackAnalysis
        }
    }

    shouldUseAI(domainName) {
        const [name, tld] = domainName.split('.')

        // Use AI for premium domains only
        return (
            name.length <= 8 || // Short domains
            ['com', 'io', 'ai', 'crypto'].includes(tld) || // Premium TLDs
            /^(ai|crypto|defi|nft|web3|dao|meta|blockchain)/.test(name) // Hot keywords
        )
    }

    parseAIResponse(content) {
        try {
            const jsonMatch = content.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0])
                return {
                    brandability: parsed.brandability || 70,
                    marketPotential: parsed.market || 65,
                    linguistic: parsed.linguistic || 75,
                    investmentValue: parsed.investment || 60,
                    web3Relevance: parsed.web3 || 50,
                    overallScore: parsed.overall || 64,
                    recommendation: parsed.rec || 'HOLD',
                    reasoning: parsed.reason || 'AI analysis completed'
                }
            }
        } catch (error) {
            console.error('Parse error:', error)
        }
        return this.getDefaultResponse()
    }

    formatAnalysis(domainName, analysis, isAIPowered = false) {
        return {
            domain: domainName,
            timestamp: new Date().toISOString(),
            scores: {
                brandability: analysis.brandability || 70,
                marketPotential: analysis.marketPotential || 65,
                linguistic: analysis.linguistic || 75,
                investmentValue: analysis.investmentValue || 60,
                web3Relevance: analysis.web3Relevance || 50,
                overall: analysis.overallScore || 64
            },
            insights: {
                strengths: analysis.strengths || [isAIPowered ? 'AI-powered analysis' : 'Heuristic analysis'],
                weaknesses: analysis.weaknesses || ['Limited by free tier'],
                recommendation: analysis.recommendation || 'HOLD',
                reasoning: analysis.reasoning || 'Analysis based on available data'
            },
            market: {
                comparables: analysis.comparableDomains || [],
                priceRange: analysis.priceEstimate || this.estimatePrice(analysis.overallScore || 64)
            },
            aiModel: isAIPowered ? 'gpt-3.5-turbo' : 'heuristic',
            confidence: isAIPowered ? 0.85 : 0.65,
            apiUsage: `${this.requestCount}/${this.dailyLimit}`
        }
    }

    estimatePrice(score) {
        const basePrice = score * 50
        return {
            low: Math.max(500, basePrice - 1000),
            high: basePrice + 2000,
            currency: 'USD'
        }
    }

    getFallbackAnalysis(domainName) {
        const [name, tld] = domainName.split('.')
        const length = name.length

        let brandability = 70
        let marketPotential = 65
        let linguistic = 75
        let investmentValue = 60
        let web3Relevance = 50

        // Length scoring
        if (length <= 4) brandability += 20
        else if (length <= 6) brandability += 10
        else if (length <= 8) brandability += 5
        else if (length > 12) brandability -= 15

        // TLD scoring
        const tldScores = {
            'com': 25, 'io': 20, 'ai': 22, 'crypto': 15, 'defi': 12,
            'xyz': 8, 'org': 10, 'net': 8, 'co': 12
        }
        const tldBonus = tldScores[tld] || 0
        investmentValue += tldBonus
        marketPotential += Math.floor(tldBonus * 0.8)

        // Keyword analysis
        const web3Keywords = ['crypto', 'defi', 'nft', 'dao', 'web3', 'blockchain', 'token', 'meta', 'ai', 'btc', 'eth']
        const techKeywords = ['app', 'tech', 'digital', 'cloud', 'data', 'api', 'dev']

        const nameUpper = name.toLowerCase()

        web3Keywords.forEach(keyword => {
            if (nameUpper.includes(keyword)) {
                web3Relevance += 20
                marketPotential += 10
                investmentValue += 10
            }
        })

        techKeywords.forEach(keyword => {
            if (nameUpper.includes(keyword)) {
                marketPotential += 8
            }
        })

        // Vowel/consonant balance for linguistic appeal
        const vowels = (name.match(/[aeiou]/gi) || []).length
        const consonants = name.length - vowels
        const ratio = vowels / consonants
        if (ratio >= 0.4 && ratio <= 0.8) linguistic += 10

        // Cap scores at 100
        brandability = Math.min(100, brandability)
        marketPotential = Math.min(100, marketPotential)
        linguistic = Math.min(100, linguistic)
        investmentValue = Math.min(100, investmentValue)
        web3Relevance = Math.min(100, web3Relevance)

        const overall = Math.round((brandability + marketPotential + linguistic + investmentValue + web3Relevance) / 5)

        return {
            brandability,
            marketPotential,
            linguistic,
            investmentValue,
            web3Relevance,
            overallScore: overall,
            strengths: this.generateStrengths(name, tld, overall),
            weaknesses: this.generateWeaknesses(name, tld, overall),
            recommendation: overall > 80 ? 'BUY' : overall > 65 ? 'HOLD' : 'AVOID',
            reasoning: `${domainName} scores ${overall}/100 based on length (${length}), TLD (.${tld}), and keyword analysis.`,
            comparableDomains: [],
            priceEstimate: this.estimatePrice(overall)
        }
    }

    generateStrengths(name, tld, score) {
        const strengths = []
        if (name.length <= 6) strengths.push('Short, memorable length')
        if (['com', 'io', 'ai'].includes(tld)) strengths.push('Premium TLD')
        if (score > 75) strengths.push('Above-average scoring')
        if (/^[a-z]+$/.test(name)) strengths.push('Clean, professional format')
        return strengths.length ? strengths : ['Standard domain format']
    }

    generateWeaknesses(name, tld, score) {
        const weaknesses = []
        if (name.length > 12) weaknesses.push('Long domain name')
        if (score < 60) weaknesses.push('Below-average potential')
        if (['tk', 'ml', 'ga'].includes(tld)) weaknesses.push('Low-value TLD')
        if (name.includes('-') || name.includes('_')) weaknesses.push('Special characters')
        return weaknesses.length ? weaknesses : ['Average characteristics']
    }

    getDefaultResponse() {
        return {
            brandability: 70, marketPotential: 65, linguistic: 75,
            investmentValue: 60, web3Relevance: 50, overallScore: 64,
            recommendation: 'HOLD', reasoning: 'Standard analysis'
        }
    }

    async analyzeMultipleDomains(domains) {
        const results = []

        // Limit batch analysis for free tier
        const limitedDomains = domains.slice(0, 3)

        for (const domain of limitedDomains) {
            try {
                const analysis = await this.analyzeDomain(domain)
                results.push(analysis)

                // Only add delay if using OpenAI
                if (this.hasOpenAI && this.checkDailyLimit()) {
                    await new Promise(resolve => setTimeout(resolve, 2000))
                }
            } catch (error) {
                console.error(`Failed to analyze ${domain}:`, error)
                results.push(this.getFallbackAnalysis(domain))
            }
        }

        return results
    }

    getUsageStats() {
        return {
            requestsUsed: this.requestCount,
            dailyLimit: this.dailyLimit,
            remaining: this.dailyLimit - this.requestCount,
            resetDate: new Date(new Date().setHours(24, 0, 0, 0)).toISOString()
        }
    }
}

module.exports = new AIScoringService()