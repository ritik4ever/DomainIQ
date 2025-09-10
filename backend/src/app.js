require('dotenv').config()

const express = require('express')
const cors = require('cors')
const http = require('http')

const app = express()
const server = http.createServer(app)

// Debug: Check if environment variables are loaded
console.log('🔍 Environment Check:')
console.log('   NODE_ENV:', process.env.NODE_ENV)
console.log('   OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Found' : '❌ Missing')
console.log('   TWITTER_API_KEY:', process.env.TWITTER_API_KEY ? '✅ Found' : '❌ Missing')
console.log('   DOMA_API_KEY:', process.env.DOMA_API_KEY ? '✅ Found' : '❌ Missing')

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Request logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`)
    next()
})

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: {
            openai: !!process.env.OPENAI_API_KEY,
            twitter: !!process.env.TWITTER_API_KEY,
            doma: !!process.env.DOMA_API_KEY
        }
    })
})

// Load routes with error handling
const routes = [
    { path: '/api/domains', file: './routes/domains' },
    { path: '/api/scoring', file: './routes/scoring' },
    { path: '/api/analytics', file: './routes/analytics' },
    { path: '/api/trading', file: './routes/trading' },
    { path: '/api/watchlist', file: './routes/watchlist' },
    { path: '/api/doma', file: './routes/doma' }
]

routes.forEach(({ path, file }) => {
    try {
        const route = require(file)
        app.use(path, route)
        console.log(`✅ ${path} routes loaded`)
    } catch (error) {
        console.error(`❌ Failed to load ${path}:`, error.message)
    }
})

// Initialize services after environment is confirmed
setTimeout(async () => {
    try {
        console.log('🚀 Initializing services...')

        // Initialize Doma service
        const domaService = require('./services/domaIntegrationService')
        const connected = await domaService.testConnection()

        if (connected) {
            console.log('✅ Doma API integration ready')
            // Initialize WebSocket
            try {
                await domaService.initializeWebSocket()
                console.log('✅ Doma WebSocket initialized')
            } catch (wsError) {
                console.log('⚠️ Doma WebSocket failed, continuing without real-time updates')
            }
        } else {
            console.log('⚠️ Doma API using fallback data')
        }

        // Initialize social media service
        const socialService = require('./services/socialMediaService')
        await socialService.startMonitoring()

    } catch (error) {
        console.error('❌ Service initialization error:', error.message)
    }
}, 2000)

// Error handling
app.use((error, req, res, next) => {
    console.error('Server error:', error)
    res.status(500).json({ error: 'Internal server error' })
})

app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' })
})

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
    console.log('🚀 DomainIQ Backend with Enhanced Integration')
    console.log(`📡 Server running on port ${PORT}`)
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
})

module.exports = app