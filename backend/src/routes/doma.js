const express = require('express')
const router = express.Router()
const domaService = require('../services/domaIntegrationService')

// Get domain from Doma Protocol
router.get('/domain/:name', async (req, res) => {
    try {
        const { name } = req.params
        const domainData = await domaService.getDomainFullData(name)
        res.json(domainData)
    } catch (error) {
        console.error('Doma domain error:', error)
        res.status(500).json({ error: 'Failed to fetch from Doma Protocol' })
    }
})

// Get network statistics
router.get('/stats', async (req, res) => {
    try {
        const stats = await domaService.getNetworkStats()
        res.json(stats)
    } catch (error) {
        console.error('Doma stats error:', error)
        res.status(500).json({ error: 'Failed to fetch network stats' })
    }
})

// Get orderbook data
router.get('/orderbook/:domain', async (req, res) => {
    try {
        const { domain } = req.params
        const orderbook = await domaService.getOrderbook(domain)
        res.json(orderbook)
    } catch (error) {
        console.error('Orderbook error:', error)
        res.status(500).json({ error: 'Failed to fetch orderbook data' })
    }
})

// Connection status
router.get('/status', (req, res) => {
    const status = domaService.getConnectionStatus()
    res.json(status)
})

module.exports = router