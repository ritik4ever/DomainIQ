const { TwitterApi } = require('twitter-api-v2')

class SocialMediaService {
    constructor() {
        this.twitterClient = null
        this.hasTwitter = false
        this.monthlyLimit = 1500 // Free tier limit
        this.requestCount = 0
        this.lastReset = new Date().getMonth()
        this.domainTrends = new Map()

        if (process.env.TWITTER_API_KEY && process.env.TWITTER_API_SECRET) {
            this.twitterClient = new TwitterApi({
                appKey: process.env.TWITTER_API_KEY,
                appSecret: process.env.TWITTER_API_SECRET,
                // Note: Free tier is app-only auth, no user tokens needed
            }).readOnly

            this.hasTwitter = true
            console.log('✅ Twitter API initialized (Free Tier - 1500/month)')
        } else {
            console.log('⚠️ Twitter API not configured, using mock social data')
        }
    }

    checkMonthlyLimit() {
        const currentMonth = new Date().getMonth()
        if (currentMonth !== this.lastReset) {
            this.requestCount = 0
            this.lastReset = currentMonth
        }

        return this.requestCount < this.monthlyLimit
    }

    async startMonitoring() {
        console.log('📱 Social media monitoring initialized')

        if (this.hasTwitter && this.checkMonthlyLimit()) {
            // Do one initial trend update
            await this.updateTrendsConservatively()

            // Update trends very sparingly - once per day max
            setInterval(() => {
                if (this.checkMonthlyLimit()) {
                    this.updateTrendsConservatively()
                }
            }, 24 * 60 * 60 * 1000) // Once per day
        }

        // Always generate mock trends as backup
        this.generateMockTrends()

        // Update mock trends regularly
        setInterval(() => {
            this.generateMockTrends()
        }, 60 * 60 * 1000) // Every hour
    }

    async updateTrendsConservatively() {
        try {
            console.log(`🔄 Updating social trends (${this.requestCount}/${this.monthlyLimit} requests used)`)

            // Only check 2-3 high-value keywords to save API calls
            const priorityKeywords = ['domain investment', 'crypto domains', '.ai domains']

            for (const keyword of priorityKeywords) {
                if (!this.checkMonthlyLimit()) break

                const tweets = await this.searchTweetsCarefully(keyword, 10) // Small count
                const trend = this.analyzeTrend(keyword, tweets)
                this.domainTrends.set(keyword, trend)

                // Rate limiting
                await this.sleep(3000)
            }

            console.log(`✅ Updated ${priorityKeywords.length} trend categories`)
        } catch (error) {
            console.error('❌ Twitter trends update failed:', error.message)
            this.generateMockTrends() // Fallback to mock
        }
    }

    async searchTweetsCarefully(query, count = 10) {
        if (!this.hasTwitter || !this.checkMonthlyLimit()) {
            return []
        }

        try {
            this.requestCount++
            console.log(`Twitter API call ${this.requestCount}/${this.monthlyLimit}: "${query}"`)

            const tweets = await this.twitterClient.v2.search(query, {
                max_results: count,
                'tweet.fields': ['created_at', 'public_metrics'],
            })

            return tweets.data || []
        } catch (error) {
            console.error(`Twitter search failed for ${query}:`, error.message)
            return []
        }
    }

    async getDomainSocialData(domainName) {
        // For free tier, only check social data for domains that seem important
        const shouldCheckTwitter = this.shouldCheckSocial(domainName)

        if (this.hasTwitter && shouldCheckTwitter && this.checkMonthlyLimit()) {
            try {
                const tweets = await this.searchTweetsCarefully(`"${domainName}"`, 5)
                const mentions = tweets.length
                const sentiment = this.calculateSentiment(tweets)

                return {
                    domain: domainName,
                    mentions: mentions,
                    sentiment: sentiment,
                    socialScore: this.calculateSocialScore(mentions, sentiment),
                    recentTweets: tweets.slice(0, 3).map(t => ({
                        text: t.text?.substring(0, 100),
                        created_at: t.created_at,
                        engagement: (t.public_metrics?.like_count || 0) + (t.public_metrics?.retweet_count || 0)
                    })),
                    source: 'twitter-api',
                    timestamp: new Date().toISOString()
                }
            } catch (error) {
                console.error(`Social data error for ${domainName}:`, error)
            }
        }

        // Return mock data for most domains to save API calls
        return this.getMockSocialData(domainName)
    }

    shouldCheckSocial(domainName) {
        const [name] = domainName.split('.')

        // Only use Twitter API for premium domains
        return (
            name.length <= 6 || // Short domains
            /^(crypto|bitcoin|ethereum|nft|dao|defi|web3|meta|ai|blockchain)/.test(name.toLowerCase())
        )
    }

    getMockSocialData(domainName) {
        const mentions = Math.floor(Math.random() * 20)
        const sentiments = ['bullish', 'neutral', 'bearish']
        const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)]

        return {
            domain: domainName,
            mentions: mentions,
            sentiment: sentiment,
            socialScore: this.calculateSocialScore(mentions, sentiment),
            recentTweets: [],
            source: 'mock-data',
            timestamp: new Date().toISOString()
        }
    }

    generateMockTrends() {
        const keywords = [
            'domain investment', 'crypto domains', '.ai domains',
            'web3 domains', 'premium domains', 'domain flipping'
        ]

        keywords.forEach(keyword => {
            this.domainTrends.set(keyword, {
                keyword,
                sentiment: ['bullish', 'neutral', 'bearish'][Math.floor(Math.random() * 3)],
                volume: Math.floor(Math.random() * 100) + 20,
                engagement: Math.floor(Math.random() * 500) + 50,
                influencerMentions: Math.floor(Math.random() * 5),
                trendDirection: ['rising', 'stable', 'falling'][Math.floor(Math.random() * 3)],
                source: 'mock-data',
                lastUpdated: new Date().toISOString()
            })
        })
    }

    analyzeTrend(keyword, tweets) {
        if (!tweets.length) {
            return this.domainTrends.get(keyword) || {
                keyword,
                sentiment: 'neutral',
                volume: 0,
                engagement: 0,
                influencerMentions: 0,
                trendDirection: 'stable',
                source: 'no-data',
                lastUpdated: new Date().toISOString()
            }
        }

        const totalEngagement = tweets.reduce((sum, tweet) => {
            return sum + (tweet.public_metrics?.like_count || 0) +
                (tweet.public_metrics?.retweet_count || 0)
        }, 0)

        return {
            keyword,
            sentiment: this.calculateSentiment(tweets),
            volume: tweets.length,
            engagement: Math.round(totalEngagement / tweets.length),
            influencerMentions: 0, // Simple version
            trendDirection: this.calculateTrendDirection(keyword, tweets.length),
            source: 'twitter-api',
            lastUpdated: new Date().toISOString()
        }
    }

    calculateSentiment(tweets) {
        const positiveWords = ['great', 'amazing', 'bullish', 'buy', 'invest', 'moon', 'gem']
        const negativeWords = ['bad', 'avoid', 'dump', 'crash', 'bearish', 'scam']

        let positiveCount = 0
        let negativeCount = 0

        tweets.forEach(tweet => {
            const text = tweet.text?.toLowerCase() || ''
            positiveWords.forEach(word => {
                if (text.includes(word)) positiveCount++
            })
            negativeWords.forEach(word => {
                if (text.includes(word)) negativeCount++
            })
        })

        if (positiveCount > negativeCount) return 'bullish'
        if (negativeCount > positiveCount) return 'bearish'
        return 'neutral'
    }

    calculateTrendDirection(keyword, currentVolume) {
        const historical = this.domainTrends.get(keyword)
        if (!historical) return 'stable'

        const change = currentVolume - historical.volume
        if (change > 2) return 'rising'
        if (change < -2) return 'falling'
        return 'stable'
    }

    calculateSocialScore(mentions, sentiment) {
        let score = Math.min(mentions * 3, 40)

        if (sentiment === 'bullish') score += 30
        else if (sentiment === 'bearish') score -= 15

        return Math.max(0, Math.min(100, score))
    }

    getTrendingSummary() {
        const trends = Array.from(this.domainTrends.values())

        return {
            totalKeywords: trends.length,
            bullishTrends: trends.filter(t => t.sentiment === 'bullish').length,
            bearishTrends: trends.filter(t => t.sentiment === 'bearish').length,
            risingTrends: trends.filter(t => t.trendDirection === 'rising'),
            topEngagement: trends.sort((a, b) => b.engagement - a.engagement).slice(0, 3),
            apiUsage: this.hasTwitter ? `${this.requestCount}/${this.monthlyLimit}` : 'Mock only',
            lastUpdated: new Date().toISOString()
        }
    }

    getUsageStats() {
        return {
            hasTwitterAPI: this.hasTwitter,
            requestsUsed: this.requestCount,
            monthlyLimit: this.monthlyLimit,
            remaining: this.monthlyLimit - this.requestCount,
            resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString()
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
}

module.exports = new SocialMediaService()