const express = require('express')
const router = express.Router()
const defiService = require('../services/defiIntegrationService')

// Fractionalize domain
router.post('/fractionalize/:domain', async (req, res) => {
    try {
        const { domain } = req.params
        const { shares = 1000, valuation } = req.body

        console.log(`DeFi: Fractionalizing ${domain}`)

        const result = await defiService.fractionalizeAsset(domain, shares, valuation)

        res.json({
            success: true,
            ...result
        })
    } catch (error) {
        console.error('Fractionalization error:', error)
        res.status(500).json({
            success: false,
            error: error.message
        })
    }
})

// Purchase fractional shares
router.post('/purchase-shares/:domain', async (req, res) => {
    try {
        const { domain } = req.params
        const { shares, buyerAddress } = req.body

        const result = await defiService.purchaseShares(domain, shares, buyerAddress)

        res.json({
            success: true,
            ...result
        })
    } catch (error) {
        console.error('Share purchase error:', error)
        res.status(500).json({
            success: false,
            error: error.message
        })
    }
})

// Stake domain
router.post('/stake/:domain', async (req, res) => {
    try {
        const { domain } = req.params
        const { period = 90, amount = 2500 } = req.body

        console.log(`DeFi: Staking ${domain} for ${period} days`)

        const result = await defiService.stakeDomain(domain, period, amount)

        res.json({
            success: true,
            ...result
        })
    } catch (error) {
        console.error('Staking error:', error)
        res.status(500).json({
            success: false,
            error: error.message
        })
    }
})

// Unstake domain
router.post('/unstake/:domain', async (req, res) => {
    try {
        const { domain } = req.params

        const result = await defiService.unstakeDomain(domain)

        res.json({
            success: true,
            ...result
        })
    } catch (error) {
        console.error('Unstaking error:', error)
        res.status(500).json({
            success: false,
            error: error.message
        })
    }
})

// Create liquidity pool
router.post('/pool/:domain', async (req, res) => {
    try {
        const { domain } = req.params
        const { initialLiquidity, feeRate = 0.3 } = req.body

        const result = await defiService.createLiquidityPool(domain, initialLiquidity, feeRate)

        res.json({
            success: true,
            ...result
        })
    } catch (error) {
        console.error('Pool creation error:', error)
        res.status(500).json({
            success: false,
            error: error.message
        })
    }
})

// Claim yield rewards
router.post('/claim-rewards', async (req, res) => {
    try {
        const { userAddress } = req.body

        const result = await defiService.claimYieldRewards(userAddress)

        res.json({
            success: true,
            ...result
        })
    } catch (error) {
        console.error('Yield claim error:', error)
        res.status(500).json({
            success: false,
            error: error.message
        })
    }
})

// Get DeFi opportunities
router.get('/opportunities', async (req, res) => {
    try {
        const opportunities = defiService.getDeFiOpportunities()

        res.json({
            success: true,
            ...opportunities
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        })
    }
})

// Get DeFi statistics
router.get('/stats', async (req, res) => {
    try {
        const stats = defiService.getDeFiStats()

        res.json({
            success: true,
            stats
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        })
    }
})

// Get fractionalization data for domain
router.get('/fractionalization/:domain', async (req, res) => {
    try {
        const { domain } = req.params
        const data = defiService.getFractionalizationData(domain)

        res.json({
            success: true,
            data
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        })
    }
})

// Get staking data for domain
router.get('/staking/:domain', async (req, res) => {
    try {
        const { domain } = req.params
        const data = defiService.getStakingData(domain)

        res.json({
            success: true,
            data
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        })
    }
})

// Get user's DeFi portfolio
router.get('/portfolio/:userAddress', async (req, res) => {
    try {
        const { userAddress } = req.params
        const portfolio = defiService.getUserDeFiPortfolio(userAddress)

        res.json({
            success: true,
            portfolio
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        })
    }
})

module.exports = router