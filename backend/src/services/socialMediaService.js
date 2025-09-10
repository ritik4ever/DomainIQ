// src/services/socialMediaService.js
const axios = require('axios')

class SocialMediaService {
    constructor() {
        this.twitterBearerToken = process.env.TWITTER_BEARER_TOKEN
        this.requestsUsed = 0
        this.monthlyLimit = 1500
        this.trends = new Map()

        if (this.twitterBearerToken) {
            console.log('Twitter API initialized (Free Tier - 1500/month)')
        } else {
            console.log('Twitter API not configured, using mock data')
        }
    }

    async startMonitoring() {
        console.log('Social media monitoring initialized')

        // Start initial trend update
        await this.updateTrends()

        // Set interval for regular updates (every 5 minutes)
        this.monitoringInterval = setInterval(() => {
            this.updateTrends().catch(console.error)
        }, 300000)

        return true
    }


    async searchTweets(query, maxResults = 10) {
        if (!this.twitterBearerToken) {
            return this.getMockTweetData(query)
        }

        try {
            this.requestsUsed++
            console.log(`Twitter API call ${this.requestsUsed}/${this.monthlyLimit}: "${query}"`)

            // FIXED: Use Twitter API v2 with Bearer token
            const response = await axios.get('https://api.twitter.com/2/tweets/search/recent', {
                headers: {
                    'Authorization': `Bearer ${this.twitterBearerToken}`
                },
                params: {
                    'query': query,
                    'max_results': maxResults,
                    'tweet.fields': 'created_at,public_metrics,context_annotations'
                }
            })

            const tweets = response.data.data || []
            return this.analyzeTweetSentiment(tweets, query)

        } catch (error) {
            console.error(`Twitter search failed for ${query}:`, error.response?.data || error.message)
            return this.getMockTweetData(query)
        }
    }

    analyzeTweetSentiment(tweets, query) {
        if (!tweets.length) {
            return {
                query,
                mentions: 0,
                sentiment: 0.5,
                engagement: 0,
                trends: 'neutral',
                lastUpdated: new Date().toISOString()
            }
        }

        // Simple sentiment analysis
        let positiveCount = 0
        let totalEngagement = 0

        tweets.forEach(tweet => {
            const text = tweet.text.toLowerCase()
            const positiveWords = ['great', 'good', 'excellent', 'amazing', 'bullish', 'buy', 'invest']
            const negativeWords = ['bad', 'terrible', 'awful', 'bearish', 'sell', 'avoid', 'scam']

            const positive = positiveWords.some(word => text.includes(word))
            const negative = negativeWords.some(word => text.includes(word))

            if (positive && !negative) positiveCount++

            totalEngagement += tweet.public_metrics?.like_count || 0
            totalEngagement += tweet.public_metrics?.retweet_count || 0
        })

        const sentiment = tweets.length > 0 ? (positiveCount / tweets.length) : 0.5
        const avgEngagement = totalEngagement / tweets.length

        return {
            query,
            mentions: tweets.length,
            sentiment: Math.max(0.1, Math.min(0.9, sentiment)),
            engagement: avgEngagement,
            trends: sentiment > 0.6 ? 'positive' : sentiment < 0.4 ? 'negative' : 'neutral',
            lastUpdated: new Date().toISOString()
        }
    }

    getMockTweetData(query) {
        // Mock data for when Twitter API is unavailable
        const mockData = {
            'domain investment': { mentions: 1250, sentiment: 0.72, engagement: 45 },
            'crypto domains': { mentions: 890, sentiment: 0.81, engagement: 67 },
            '.ai domains': { mentions: 2100, sentiment: 0.89, engagement: 123 },
            'nft domains': { mentions: 567, sentiment: 0.65, engagement: 34 },
            'web3 domains': { mentions: 1456, sentiment: 0.78, engagement: 89 }
        }

        const baseData = mockData[query] || { mentions: 100, sentiment: 0.6, engagement: 25 }

        return {
            query,
            mentions: baseData.mentions + Math.floor(Math.random() * 100),
            sentiment: Math.max(0.1, Math.min(0.9, baseData.sentiment + (Math.random() - 0.5) * 0.2)),
            engagement: baseData.engagement + Math.floor(Math.random() * 20),
            trends: baseData.sentiment > 0.6 ? 'positive' : 'neutral',
            lastUpdated: new Date().toISOString(),
            mock: true
        }
    }

    async updateTrends() {
        const queries = [
            'domain investment',
            'crypto domains',
            '.ai domains',
            'nft domains',
            'web3 domains'
        ]

        console.log(`Updating social trends (${this.requestsUsed}/${this.monthlyLimit} requests used)`)

        const trendPromises = queries.map(async query => {
            try {
                const data = await this.searchTweets(query, 10)
                this.trends.set(query, data)
                return data
            } catch (error) {
                console.error(`Trend update failed for ${query}:`, error.message)
                return this.getMockTweetData(query)
            }
        })

        const results = await Promise.all(trendPromises)
        console.log(`Updated ${results.length} trend categories`)

        return results
    }

    getTrends() {
        const trendsArray = Array.from(this.trends.entries()).map(([query, data]) => ({
            query,
            ...data
        }))

        return {
            trends: trendsArray,
            lastUpdated: new Date().toISOString(),
            requestsRemaining: this.monthlyLimit - this.requestsUsed
        }
    }

    getUsageStats() {
        return {
            hasTwitterAPI: !!this.twitterBearerToken,
            requestsUsed: this.requestsUsed,
            monthlyLimit: this.monthlyLimit,
            remaining: this.monthlyLimit - this.requestsUsed
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
}

module.exports = new SocialMediaService()