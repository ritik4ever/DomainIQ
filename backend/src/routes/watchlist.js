const express = require('express')
const router = express.Router()

// In-memory storage (in production, use database)
const watchlists = new Map()

// Get user's watchlist
router.get('/:address', async (req, res) => {
    try {
        const { address } = req.params
        const userWatchlist = watchlists.get(address.toLowerCase()) || []
        res.json({ watchlist: userWatchlist })
    } catch (error) {
        console.error('Get watchlist error:', error)
        res.status(500).json({ error: 'Failed to get watchlist' })
    }
})

// Add domain to watchlist
router.post('/:address', async (req, res) => {
    try {
        const { address } = req.params
        const { domain, score, price } = req.body

        if (!domain) {
            return res.status(400).json({ error: 'Domain is required' })
        }

        const userAddress = address.toLowerCase()
        const userWatchlist = watchlists.get(userAddress) || []

        // Check if already exists
        if (userWatchlist.some(item => item.domain === domain)) {
            return res.status(409).json({ error: 'Domain already in watchlist' })
        }

        // Add to watchlist
        const newItem = {
            domain,
            score,
            price,
            addedAt: new Date().toISOString()
        }

        userWatchlist.push(newItem)
        watchlists.set(userAddress, userWatchlist)

        res.json({ success: true, watchlist: userWatchlist })
    } catch (error) {
        console.error('Add to watchlist error:', error)
        res.status(500).json({ error: 'Failed to add to watchlist' })
    }
})

// Remove domain from watchlist
router.delete('/:address/:domain', async (req, res) => {
    try {
        const { address, domain } = req.params
        const userAddress = address.toLowerCase()
        const userWatchlist = watchlists.get(userAddress) || []

        const filtered = userWatchlist.filter(item => item.domain !== domain)
        watchlists.set(userAddress, filtered)

        res.json({ success: true, watchlist: filtered })
    } catch (error) {
        console.error('Remove from watchlist error:', error)
        res.status(500).json({ error: 'Failed to remove from watchlist' })
    }
})

module.exports = router