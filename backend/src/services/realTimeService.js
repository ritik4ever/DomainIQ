const WebSocket = require('ws')
const domaService = require('./domaService')
const aiScoringService = require('./aiScoringService')
const marketIntelligenceService = require('./marketIntelligenceService')

class RealTimeService {
    constructor() {
        this.wss = null
        this.clients = new Set()
        this.eventStream = null
        this.isPolling = false
        this.lastEventId = 0
        this.marketAnalysisInterval = null
    }

    initialize(server) {
        this.wss = new WebSocket.Server({ server })

        this.wss.on('connection', (ws, req) => {
            console.log('New WebSocket client connected')
            this.clients.add(ws)

            this.sendMarketUpdate(ws)

            ws.on('message', async (message) => {
                try {
                    const data = JSON.parse(message)
                    await this.handleClientMessage(ws, data)
                } catch (error) {
                    console.error('WebSocket message error:', error)
                }
            })

            ws.on('close', () => {
                this.clients.delete(ws)
                console.log('WebSocket client disconnected')
            })
        })

        this.startEventPolling()
        this.startMarketAnalysis()
        console.log('🔴 Enhanced Real-time service initialized')
    }

    async startMarketAnalysis() {
        this.marketAnalysisInterval = setInterval(async () => {
            try {
                const trends = await marketIntelligenceService.analyzeTrends()
                this.broadcastToClients({
                    type: 'market_trends',
                    data: trends,
                    timestamp: new Date()
                })
            } catch (error) {
                console.error('Market analysis error:', error)
            }
        }, 30000)

        setTimeout(async () => {
            const trends = await marketIntelligenceService.analyzeTrends()
            this.broadcastToClients({
                type: 'market_trends',
                data: trends,
                timestamp: new Date()
            })
        }, 2000)
    }

    async sendMarketUpdate(ws) {
        try {
            const trends = await marketIntelligenceService.analyzeTrends()
            this.sendToClient(ws, {
                type: 'market_update',
                data: trends,
                timestamp: new Date()
            })
        } catch (error) {
            console.error('Market update error:', error)
        }
    }

    async startEventPolling() {
        if (this.isPolling) return
        this.isPolling = true

        const pollEvents = async () => {
            try {
                const events = await domaService.pollEvents(['NAME_TOKEN_MINTED', 'NAME_TOKEN_TRANSFERRED'], 10)

                if (events && events.events && events.events.length > 0) {
                    for (const event of events.events) {
                        await this.processEvent(event)
                    }

                    if (events.lastId > this.lastEventId) {
                        await domaService.acknowledgeEvents(events.lastId)
                        this.lastEventId = events.lastId
                    }
                }
            } catch (error) {
                console.error('Event polling error:', error)
            }

            setTimeout(pollEvents, 30000)
        }

        pollEvents()
    }

    async processEvent(event) {
        try {
            let processedData = null

            switch (event.type) {
                case 'NAME_TOKEN_MINTED':
                    processedData = await this.processTokenMinted(event)
                    break
                case 'NAME_TOKEN_TRANSFERRED':
                    processedData = await this.processTokenTransferred(event)
                    break
                default:
                    return
            }

            if (processedData) {
                this.broadcastToClients({
                    type: 'domain_event',
                    event: event.type,
                    data: processedData,
                    timestamp: new Date()
                })
            }
        } catch (error) {
            console.error('Event processing error:', error)
        }
    }

    async processTokenMinted(event) {
        try {
            const { name, owner, networkId } = event.eventData || {}

            if (!name) {
                console.warn('Missing name in token minted event')
                return null
            }

            // FIXED: Pass domain name as string
            const aiScore = await aiScoringService.predictScore(name)
            const domainInfo = await domaService.getDomainInfo(name)

            return {
                action: 'minted',
                domain: name,
                owner,
                networkId,
                aiScore,
                estimatedValue: this.estimateValue(aiScore),
                recommendation: this.getRecommendation(aiScore),
                tokenized: true,
                transactionCount: domainInfo.transactionCount
            }
        } catch (error) {
            console.error('Process token minted error:', error)
            return null
        }
    }

    async processTokenTransferred(event) {
        try {
            const { name, transferredTo, transferredFrom } = event.eventData || {}

            if (!name) {
                console.warn('Missing name in token transferred event')
                return null
            }

            // FIXED: Pass domain name as string
            const aiScore = await aiScoringService.predictScore(name)

            return {
                action: 'transferred',
                domain: name,
                from: transferredFrom,
                to: transferredTo,
                aiScore,
                newOwner: transferredTo,
                timestamp: event.eventData?.createdAt
            }
        } catch (error) {
            console.error('Process token transferred error:', error)
            return null
        }
    }

    async handleClientMessage(ws, data) {
        switch (data.type) {
            case 'subscribe_domain':
                // Handle domain subscription
                break
            case 'get_market_update':
                await this.sendMarketUpdate(ws)
                break
        }
    }

    estimateValue(score) {
        const baseValue = 1000
        const multiplier = Math.pow(score / 50, 2)
        return Math.round(baseValue * multiplier)
    }

    getRecommendation(score) {
        if (score >= 85) return 'STRONG_BUY'
        if (score >= 70) return 'BUY'
        if (score >= 50) return 'HOLD'
        return 'PASS'
    }

    broadcastToClients(data) {
        this.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                this.sendToClient(client, data)
            }
        })
    }

    sendToClient(client, data) {
        try {
            client.send(JSON.stringify(data))
        } catch (error) {
            console.error('Send to client error:', error)
        }
    }

    shutdown() {
        if (this.marketAnalysisInterval) {
            clearInterval(this.marketAnalysisInterval)
        }
        this.isPolling = false
    }
}

module.exports = new RealTimeService()