const express = require('express')
const router = express.Router()
const analyticsService = require('../services/analyticsService')
const gtldAnalysisService = require('../services/gtldAnalysisService')
const predictiveService = require('../services/predictiveService')

router.get('/portfolio', async (req, res) => {
    try {
        const { wallet } = req.query
        const analytics = await analyticsService.getPortfolioAnalytics(wallet)
        res.json(analytics)
    } catch (error) {
        console.error('Portfolio analytics error:', error)
        res.status(500).json({ error: 'Failed to get portfolio analytics' })
    }
})

router.get('/market', async (req, res) => {
    try {
        const overview = await analyticsService.getMarketOverview()
        res.json(overview)
    } catch (error) {
        console.error('Market overview error:', error)
        res.status(500).json({ error: 'Failed to get market overview' })
    }
})

router.post('/predict', async (req, res) => {
    try {
        const { domainData } = req.body

        if (!domainData) {
            return res.status(400).json({ error: 'Domain data required' })
        }

        const prediction = await predictiveService.predictDomainValue(domainData)
        res.json(prediction)
    } catch (error) {
        console.error('Prediction error:', error)
        res.status(500).json({ error: 'Failed to generate prediction' })
    }
})

// Market trends with real AI analysis
router.get('/trends', async (req, res) => {
    try {
        const trends = await predictiveService.getMarketTrends()
        res.json(trends)
    } catch (error) {
        console.error('Trends error:', error)
        res.status(500).json({ error: 'Failed to get market trends' })
    }
})

// API Usage Statistics
router.get('/usage', async (req, res) => {
    try {
        const stats = {
            openai: aiScoringService.getUsageStats(),
            twitter: socialMediaService.getUsageStats(),
            timestamp: new Date().toISOString()
        }
        res.json(stats)
    } catch (error) {
        console.error('Usage stats error:', error)
        res.status(500).json({ error: 'Failed to get usage stats' })
    }
})

module.exports = router