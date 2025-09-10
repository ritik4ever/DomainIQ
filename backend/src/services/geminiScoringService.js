const { GoogleGenerativeAI } = require('@google/generative-ai')

class GeminiScoringService {
    constructor() {
        this.genAI = null
        this.hasGemini = false
        this.requestCount = 0
        this.minutelyLimit = 15 // Gemini free tier: 15 RPM
        this.lastReset = Math.floor(Date.now() / 60000)

        if (process.env.GEMINI_API_KEY) {
            this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
            this.hasGemini = true
            console.log('✅ Gemini AI service initialized (Free Tier - 15 RPM)')
        } else {
            console.log('⚠️ Gemini API key not found, using advanced heuristics')
        }
    }

    checkRateLimit() {
        const currentMinute = Math.floor(Date.now() / 60000)
        if (currentMinute !== this.lastReset) {
            this.requestCount = 0
            this.lastReset = currentMinute
        }
        return this.requestCount < this.minutelyLimit
    }

    async analyzeWithAdvancedAI(domainName) {
        if (!this.hasGemini || !this.checkRateLimit()) {
            return this.getAdvancedHeuristicAnalysis(domainName)
        }

        try {
            this.requestCount++
            console.log(`Gemini AI request ${this.requestCount}/${this.minutelyLimit} for ${domainName}`)

            const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' })

            const prompt = `Analyze domain "${domainName}" as a professional domain investment expert. Provide JSON analysis:
      
      Consider: brandability, market trends, Web3 relevance, linguistic appeal, investment potential, rarity factors.
      
      Return JSON:
      {
        "scores": {
          "brandability": 0-100,
          "marketPotential": 0-100, 
          "linguistic": 0-100,
          "web3Relevance": 0-100,
          "investmentValue": 0-100,
          "rarityScore": 0-100
        },
        "insights": {
          "strengths": ["strength1", "strength2"],
          "weaknesses": ["weakness1", "weakness2"], 
          "marketPosition": "PREMIUM|GROWTH|STABLE|EMERGING",
          "recommendation": "STRONG_BUY|BUY|HOLD|AVOID"
        },
        "advanced": {
          "comparableFloor": priceInUSD,
          "comparableCeiling": priceInUSD,
          "liquidityScore": 0-100,
          "trendMomentum": "RISING|STABLE|FALLING",
          "competitiveAdvantage": "description"
        }
      }`

            const result = await model.generateContent(prompt)
            const response = await result.response
            const text = response.text()

            return this.parseGeminiResponse(domainName, text)

        } catch (error) {
            console.error('Gemini AI error:', error.message)
            return this.getAdvancedHeuristicAnalysis(domainName)
        }
    }

    parseGeminiResponse(domainName, text) {
        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
                const analysis = JSON.parse(jsonMatch[0])
                return {
                    domain: domainName,
                    aiPowered: true,
                    model: 'gemini-pro',
                    ...analysis,
                    confidence: 0.92,
                    timestamp: new Date().toISOString()
                }
            }
        } catch (error) {
            console.error('Gemini parse error:', error)
        }
        return this.getAdvancedHeuristicAnalysis(domainName)
    }

    getAdvancedHeuristicAnalysis(domainName) {
        const [name, tld] = domainName.split('.')
        const length = name.length

        // Advanced multi-factor scoring
        let scores = this.calculateAdvancedScores(name, tld, length)
        let insights = this.generateAdvancedInsights(name, tld, scores)
        let advanced = this.calculateAdvancedMetrics(name, tld, scores)

        return {
            domain: domainName,
            aiPowered: false,
            model: 'advanced-heuristic',
            scores,
            insights,
            advanced,
            confidence: 0.78,
            timestamp: new Date().toISOString()
        }
    }

    calculateAdvancedScores(name, tld, length) {
        // Base scoring with advanced factors
        let brandability = this.calculateBrandability(name, tld, length)
        let marketPotential = this.calculateMarketPotential(name, tld)
        let linguistic = this.calculateLinguisticScore(name)
        let web3Relevance = this.calculateWeb3Relevance(name, tld)
        let investmentValue = this.calculateInvestmentValue(name, tld, brandability, marketPotential)
        let rarityScore = this.calculateRarityScore(name, tld, length)

        return {
            brandability: Math.min(100, brandability),
            marketPotential: Math.min(100, marketPotential),
            linguistic: Math.min(100, linguistic),
            web3Relevance: Math.min(100, web3Relevance),
            investmentValue: Math.min(100, investmentValue),
            rarityScore: Math.min(100, rarityScore)
        }
    }

    calculateBrandability(name, tld, length) {
        let score = 60 // Base score

        // Length optimization
        if (length <= 4) score += 25
        else if (length <= 6) score += 15
        else if (length <= 8) score += 5
        else if (length > 12) score -= 20

        // Pronounceability
        const vowelRatio = (name.match(/[aeiou]/g) || []).length / length
        if (vowelRatio >= 0.3 && vowelRatio <= 0.6) score += 10

        // No numbers/hyphens bonus
        if (/^[a-z]+$/.test(name)) score += 15

        // Dictionary words
        const commonWords = ['app', 'web', 'net', 'digital', 'smart', 'pro', 'tech', 'cloud']
        if (commonWords.some(word => name.includes(word))) score += 8

        // TLD premium
        const premiumTlds = { com: 20, io: 15, ai: 18, co: 12, org: 10 }
        score += premiumTlds[tld] || 0

        return score
    }

    calculateMarketPotential(name, tld) {
        let score = 50

        // Industry keywords
        const industries = {
            tech: ['ai', 'ml', 'api', 'dev', 'code', 'app', 'software', 'cloud', 'data'],
            crypto: ['crypto', 'bitcoin', 'btc', 'eth', 'defi', 'nft', 'dao', 'web3', 'blockchain'],
            business: ['biz', 'corp', 'inc', 'llc', 'pro', 'consulting', 'services', 'solutions'],
            ecommerce: ['shop', 'store', 'market', 'buy', 'sell', 'pay', 'cart', 'deals']
        }

        Object.entries(industries).forEach(([sector, keywords]) => {
            const matches = keywords.filter(kw => name.includes(kw)).length
            if (matches > 0) {
                score += matches * (sector === 'crypto' ? 15 : sector === 'tech' ? 12 : 8)
            }
        })

        // Geographic indicators
        const geoKeywords = ['global', 'world', 'international', 'usa', 'america', 'europe', 'asia']
        if (geoKeywords.some(geo => name.includes(geo))) score += 10

        // TLD market value
        const tldMarketBonus = { com: 25, io: 20, ai: 22, co: 15, net: 10, org: 8 }
        score += tldMarketBonus[tld] || 0

        return score
    }

    calculateLinguisticScore(name) {
        let score = 60

        // Phonetic analysis
        const consonantClusters = name.match(/[bcdfgjklmnpqrstvwxz]{3,}/g)
        if (!consonantClusters) score += 15

        // Double letters (often easier to remember)
        if (/(.)\1/.test(name)) score += 8

        // Alliteration potential
        const firstLetter = name[0]
        if (name.split('').filter(char => char === firstLetter).length > 1) score += 5

        // Avoid difficult combinations
        const difficultPatterns = ['xz', 'qw', 'pf', 'kg']
        if (difficultPatterns.some(pattern => name.includes(pattern))) score -= 10

        // Rhythmic patterns
        if (name.length % 2 === 0) score += 3 // Even syllable count

        return score
    }

    calculateWeb3Relevance(name, tld) {
        let score = 30 // Base score

        // Direct crypto terms
        const cryptoTerms = {
            high: ['crypto', 'bitcoin', 'ethereum', 'defi', 'nft', 'dao', 'web3', 'blockchain', 'metaverse'],
            medium: ['digital', 'virtual', 'token', 'coin', 'chain', 'protocol', 'dapp', 'smart'],
            low: ['tech', 'future', 'innovation', 'network', 'platform', 'ecosystem']
        }

        cryptoTerms.high.forEach(term => {
            if (name.includes(term)) score += 25
        })
        cryptoTerms.medium.forEach(term => {
            if (name.includes(term)) score += 15
        })
        cryptoTerms.low.forEach(term => {
            if (name.includes(term)) score += 8
        })

        // Web3-friendly TLDs
        const web3Tlds = { crypto: 30, dao: 25, nft: 20, ai: 15, io: 12 }
        score += web3Tlds[tld] || 0

        return score
    }

    calculateInvestmentValue(name, tld, brandability, marketPotential) {
        let score = (brandability + marketPotential) / 2

        // Scarcity factors
        if (name.length <= 4) score += 20 // Ultra rare
        else if (name.length <= 6) score += 10 // Rare

        // Premium TLD multiplier
        const tldMultiplier = { com: 1.2, io: 1.15, ai: 1.18, co: 1.1 }
        score *= tldMultiplier[tld] || 1.0

        // Market timing (AI/crypto trend bonus)
        const trendingTerms = ['ai', 'crypto', 'defi', 'nft', 'metaverse', 'blockchain']
        if (trendingTerms.some(term => name.includes(term))) score *= 1.15

        return Math.round(score)
    }

    calculateRarityScore(name, tld, length) {
        let score = 40

        // Length rarity
        const lengthRarity = {
            2: 95, 3: 90, 4: 85, 5: 75, 6: 65, 7: 55, 8: 45, 9: 35, 10: 25
        }
        score = lengthRarity[length] || 15

        // Character uniqueness
        const uniqueChars = new Set(name.split('')).size
        const uniquenessRatio = uniqueChars / length
        score += uniquenessRatio * 20

        // Pattern rarity
        if (/^(.)\1+$/.test(name)) score += 30 // All same letter
        if (/^(.)(.)\1\2/.test(name)) score += 20 // Repeating pattern
        if (/^[aeiou]+$/.test(name)) score += 25 // All vowels
        if (/^[bcdfgjklmnpqrstvwxz]+$/.test(name)) score += 25 // All consonants

        // TLD rarity
        const tldRarity = { com: -10, io: 5, ai: 15, crypto: 25, dao: 30 }
        score += tldRarity[tld] || 10

        return Math.min(95, score)
    }

    generateAdvancedInsights(name, tld, scores) {
        const overall = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length

        let strengths = []
        let weaknesses = []

        // Dynamic strengths
        if (scores.brandability > 80) strengths.push('Excellent brandability')
        if (scores.rarityScore > 80) strengths.push('High rarity value')
        if (scores.web3Relevance > 70) strengths.push('Strong Web3 positioning')
        if (name.length <= 6) strengths.push('Premium length')
        if (['com', 'io', 'ai'].includes(tld)) strengths.push('Premium TLD')

        // Dynamic weaknesses  
        if (scores.linguistic < 50) weaknesses.push('Complex pronunciation')
        if (scores.marketPotential < 60) weaknesses.push('Limited market appeal')
        if (name.length > 12) weaknesses.push('Long domain name')
        if (scores.web3Relevance < 40) weaknesses.push('Low crypto relevance')

        // Market positioning
        let marketPosition = 'STABLE'
        if (overall > 85) marketPosition = 'PREMIUM'
        else if (overall > 70) marketPosition = 'GROWTH'
        else if (overall > 55) marketPosition = 'STABLE'
        else marketPosition = 'EMERGING'

        // AI-powered recommendation
        let recommendation = 'HOLD'
        if (overall > 80 && scores.rarityScore > 75) recommendation = 'STRONG_BUY'
        else if (overall > 70) recommendation = 'BUY'
        else if (overall > 55) recommendation = 'HOLD'
        else recommendation = 'AVOID'

        return {
            strengths: strengths.length ? strengths : ['Standard domain characteristics'],
            weaknesses: weaknesses.length ? weaknesses : ['No major weaknesses identified'],
            marketPosition,
            recommendation
        }
    }

    calculateAdvancedMetrics(name, tld, scores) {
        const baseValue = scores.investmentValue * 50
        const rarityMultiplier = 1 + (scores.rarityScore / 100)

        return {
            comparableFloor: Math.round(baseValue * 0.7),
            comparableCeiling: Math.round(baseValue * rarityMultiplier * 1.8),
            liquidityScore: Math.min(100, scores.marketPotential + (scores.brandability * 0.3)),
            trendMomentum: scores.web3Relevance > 70 ? 'RISING' :
                scores.marketPotential > 70 ? 'STABLE' : 'FALLING',
            competitiveAdvantage: this.getCompetitiveAdvantage(name, tld, scores)
        }
    }

    getCompetitiveAdvantage(name, tld, scores) {
        if (scores.rarityScore > 85) return 'Ultra-rare domain with high scarcity value'
        if (scores.web3Relevance > 80) return 'Strong positioning in growing Web3 market'
        if (scores.brandability > 85) return 'Premium brandability suitable for major corporations'
        if (name.length <= 4) return 'Short domain with universal appeal'
        return 'Solid fundamentals with growth potential'
    }

    getUsageStats() {
        return {
            hasGeminiAPI: this.hasGemini,
            requestsUsed: this.requestCount,
            minutelyLimit: this.minutelyLimit,
            remaining: this.minutelyLimit - this.requestCount,
            model: 'gemini-pro',
            resetTime: new Date(this.lastReset * 60000 + 60000).toISOString()
        }
    }
}

module.exports = new GeminiScoringService()