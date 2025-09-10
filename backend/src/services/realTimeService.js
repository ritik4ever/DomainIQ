const domaIntegrationService = require('./domaIntegrationService')
const geminiScoringService = require('./geminiScoringService') // Fix this line
const { Server } = require('socket.io')

class RealTimeService {
    constructor() {
        this.io = null
        this.eventProcessor = null
        this.lastEventId = null
        this.isPolling = false
        this.connectedClients = new Set()
    }

    initialize(server) {
        this.io = new Server(server, {
            cors: {
                origin: process.env.FRONTEND_URL || "http://localhost:3000",
                methods: ["GET", "POST"]
            }
        })

        this.setupSocketHandlers()
        this.startEventPolling()
        console.log('Real-time service initialized with Doma integration')
    }

    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            console.log('Client connected:', socket.id)
            this.connectedClients.add(socket.id)

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id)
                this.connectedClients.delete(socket.id)
            })

            socket.on('subscribe-domain', (domain) => {
                socket.join(`domain-${domain}`)
                console.log(`Client ${socket.id} subscribed to ${domain}`)
            })
        })
    }

    async startEventPolling() {
        if (this.isPolling) return
        this.isPolling = true

        const pollEvents = async () => {
            try {
                const events = await domaIntegrationService.pollEvents(10)

                if (events.events && events.events.length > 0) {
                    console.log(`Received ${events.events.length} new events`)

                    for (const event of events.events) {
                        await this.processRealEvent(event)
                    }

                    if (events.lastId) {
                        await domaIntegrationService.acknowledgeEvents(events.lastId)
                        console.log(`Acknowledged events up to ID: ${events.lastId}`)
                        this.lastEventId = events.lastId
                    }
                }
            } catch (error) {
                console.error('Event polling error:', error.message)
            }
        }

        // Poll every 10 seconds
        setInterval(pollEvents, 10000)

        // Initial poll
        await pollEvents()
    }

    async processRealEvent(event) {
        try {
            console.log(`Processing event: ${event.type} for ${event.eventData?.name || 'unknown domain'}`)

            switch (event.type) {
                case 'NAME_TOKEN_MINTED':
                    await this.processTokenMinted(event)
                    break
                case 'NAME_TOKEN_TRANSFERRED':
                    await this.processTokenTransferred(event)
                    break
                case 'NAME_LISTED':
                    await this.processListing(event)
                    break
                default:
                    console.log(`Unhandled event type: ${event.type}`)
            }
        } catch (error) {
            console.error('Event processing error:', error.message)
        }
    }

    async processTokenMinted(event) {
        try {
            const domain = event.eventData?.name || event.name
            if (!domain) return

            // Fix: Use correct service reference
            const analysis = await geminiScoringService.analyzeWithAdvancedAI(domain)

            const notification = {
                type: 'TOKENIZATION_OPPORTUNITY',
                domain,
                message: `${domain} was tokenized - AI analysis shows ${analysis.scores?.investmentGrade || 75}/100 score`,
                estimatedVolume: analysis.valuation?.estimatedCeiling || 5000,
                timestamp: new Date().toISOString(),
                onChain: true,
                txHash: event.eventData?.txHash || event.txHash
            }

            this.broadcastOpportunity(notification)
        } catch (error) {
            console.error('Process minted error:', error)
        }
    }

    async processTokenTransferred(event) {
        const domain = event.eventData?.name || event.name
        if (!domain) return

        const notification = {
            type: 'TRANSFER_DETECTED',
            domain,
            message: `${domain} ownership transferred - potential trading activity`,
            timestamp: new Date().toISOString(),
            onChain: true
        }

        this.broadcastOpportunity(notification)
    }

    async processListing(event) {
        const domain = event.eventData?.name || event.name
        const price = event.eventData?.price || 'Unknown'

        const notification = {
            type: 'NEW_LISTING',
            domain,
            message: `${domain} listed for ${price} - analyze for arbitrage opportunities`,
            estimatedVolume: parseFloat(price) || 1000,
            timestamp: new Date().toISOString(),
            onChain: true
        }

        this.broadcastOpportunity(notification)
    }

    broadcastOpportunity(notification) {
        if (this.connectedClients.size > 0) {
            this.io.emit('live-opportunity', notification)
            console.log(`Broadcasted opportunity: ${notification.type} for ${notification.domain}`)
        }
    }
}

module.exports = new RealTimeService()