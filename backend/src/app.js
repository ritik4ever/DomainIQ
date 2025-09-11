require('dotenv').config()

const express = require('express')
const cors = require('cors')
const http = require('http')

const app = express()
const server = http.createServer(app)

// Environment check with better logging
console.log('🔍 Environment Check:')
console.log('   NODE_ENV:', process.env.NODE_ENV)
console.log('   OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Found' : '❌ Missing')
console.log('   GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ Found' : '❌ Missing')
console.log('   TWITTER_API_KEY:', process.env.TWITTER_API_KEY ? '✅ Found' : '❌ Missing')
console.log('   DOMA_API_KEY:', process.env.DOMA_API_KEY ? '✅ Found' : '❌ Missing')
console.log('   DOMA_PRIVATE_KEY:', process.env.DOMA_PRIVATE_KEY ? '✅ Found' : '❌ Missing')



// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Request logging
app.use((req, res, next) => {
    if (!req.path.includes('health')) {
        console.log(`${req.method} ${req.path}`)
    }
    next()
})

// Health check with service status
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: {
            node: process.env.NODE_ENV || 'development',
            gemini: !!process.env.GEMINI_API_KEY,
            openai: !!process.env.OPENAI_API_KEY,
            twitter: !!process.env.TWITTER_API_KEY,
            doma: !!process.env.DOMA_API_KEY
        },
        services: {
            server: 'running',
            port: process.env.PORT || 3001
        }
    })
})

// Load routes with better error handling
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

// 1. ADD DEFI ROUTES TO BACKEND
// backend/src/app.js - Add this after your existing routes
const defiRoutes = require('./routes/defi')
app.use('/api/defi', defiRoutes)
console.log('✅ /api/defi routes loaded')

// Also add DeFi service initialization
const defiIntegrationService = require('./services/defiIntegrationService')
console.log('✅ DeFi integration service initialized')

// 2. UPDATE PROXY ROUTES FOR FRONTEND
// Add to your existing proxy configuration
app.use('/api/proxy/defi', (req, res) => {
    const targetUrl = `http://localhost:3001/api/defi${req.path}`
    // Your existing proxy logic
})

// Service initialization with comprehensive error handling
async function initializeServices() {
    console.log('🚀 Initializing services...')

    // Initialize and test Gemini service
    try {
        console.log('🤖 Initializing Gemini AI service...')
        const geminiService = require('./services/geminiScoringService')
        const geminiStats = geminiService.getUsageStats()

        console.log('🤖 Gemini Service Status:')
        console.log('   - API Available:', geminiStats.hasGeminiAPI)
        console.log('   - API Key Present:', geminiStats.apiKeyPresent)
        console.log('   - Requests Remaining:', geminiStats.remaining)
        console.log('   - Model:', geminiStats.model)

        if (geminiStats.hasGeminiAPI) {
            console.log('✅ Gemini AI service ready')
        } else {
            console.log('⚠️ Gemini AI service using fallback mode')
        }
    } catch (error) {
        console.error('❌ Gemini service initialization error:', error.message)
    }

    // Initialize Doma service
    try {
        console.log('🔗 Initializing Doma integration...')
        const domaService = require('./services/domaIntegrationService')
        const connected = await domaService.testConnection()

        if (connected) {
            console.log('✅ Doma API integration ready')
            console.log('✅ Doma API integration ready')
        } else {
            console.log('⚠️ Doma API connection failed, using fallback data')
        }
    } catch (error) {
        console.error('❌ Doma service initialization error:', error.message)
    }

    // Initialize social media service
    try {
        console.log('📱 Initializing social media service...')
        const socialService = require('./services/socialMediaService')

        // Check if startMonitoring method exists
        if (typeof socialService.startMonitoring === 'function') {
            await socialService.startMonitoring()
            console.log('✅ Social media monitoring initialized')
        } else {
            console.log('⚠️ Social service startMonitoring method not available')

            // Try alternative initialization
            if (typeof socialService.updateTrends === 'function') {
                await socialService.updateTrends()
                console.log('✅ Social media service initialized (basic mode)')
            } else {
                console.log('⚠️ Social media service not fully functional')
            }
        }
    } catch (error) {
        console.error('❌ Social media service error:', error.message)
    }

    // Initialize real-time service
    try {
        console.log('🔴 Initializing real-time service...')
        const realTimeService = require('./services/realTimeService')
        if (realTimeService && typeof realTimeService.initialize === 'function') {
            realTimeService.initialize(server)
            console.log('✅ Real-time WebSocket service initialized')
        }
    } catch (error) {
        console.error('❌ Real-time service error:', error.message)
    }

    console.log('✅ Service initialization complete')
    console.log('📊 Server ready for requests')
}

// Global error handler
app.use((error, req, res, next) => {
    console.error('Server error:', error.message)
    console.error('Stack:', error.stack)
    res.status(500).json({
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
    })
})

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
    })
})

const PORT = process.env.PORT || 3001

// Start server
server.listen(PORT, async () => {
    console.log('🚀 DomainIQ Backend with Enhanced Integration')
    console.log(`📡 Server running on port ${PORT}`)
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(`🌐 CORS origin: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`)

    // Initialize services after server starts
    setTimeout(() => {
        initializeServices().catch(error => {
            console.error('❌ Service initialization failed:', error.message)
        })
    }, 2000)
})

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully')
    server.close(() => {
        console.log('📴 Server closed')
        process.exit(0)
    })
})

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully')
    server.close(() => {
        console.log('📴 Server closed')
        process.exit(0)
    })
})

module.exports = app