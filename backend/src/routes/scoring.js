const express = require('express')
const router = express.Router()
const scoringService = require('../services/scoringService')

router.post('/analyze', async (req, res) => {
    try {
        const { domain } = req.body

        if (!domain) {
            return res.status(400).json({ error: 'Domain required' })
        }

        const analysis = await scoringService.getDetailedAnalysis(domain)
        res.json(analysis)
    } catch (error) {
        console.error('Scoring error:', error)
        res.status(500).json({ error: 'Analysis failed' })
    }
})

router.get('/trends', async (req, res) => {
    try {
        const trends = await scoringService.getMarketTrends()
        res.json(trends)
    } catch (error) {
        console.error('Trends error:', error)
        res.status(500).json({ error: 'Failed to get trends' })
    }
})

module.exports = router