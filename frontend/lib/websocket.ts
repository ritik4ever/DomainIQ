class WebSocketClient {
    private ws: WebSocket | null = null
    private reconnectAttempts = 0
    private maxReconnectAttempts = 5
    private reconnectDelay = 1000
    private listeners = new Map<string, Function[]>()
    private isConnecting = false

    connect() {
        if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
            return
        }

        this.isConnecting = true

        try {
            const wsUrl = process.env.NEXT_PUBLIC_WS_URL ||
                (typeof window !== 'undefined' ?
                    `ws://${window.location.hostname}:3001` :
                    'ws://localhost:3001')

            this.ws = new WebSocket(wsUrl)

            this.ws.onopen = () => {
                console.log('WebSocket connected')
                this.reconnectAttempts = 0
                this.isConnecting = false
                this.emit('connected', { status: 'connected' })
            }

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data)
                    this.emit(data.type, data)
                } catch (error) {
                    console.error('WebSocket message parse error:', error)
                }
            }

            this.ws.onclose = () => {
                console.log('WebSocket disconnected')
                this.isConnecting = false
                this.emit('disconnected', {})
                this.handleReconnect()
            }

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error)
                this.isConnecting = false
                this.emit('error', error)
            }
        } catch (error) {
            console.error('WebSocket connection failed:', error)
            this.isConnecting = false
            this.handleReconnect()
        }
    }

    private handleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++
            setTimeout(() => {
                console.log(`Reconnecting WebSocket... Attempt ${this.reconnectAttempts}`)
                this.connect()
            }, this.reconnectDelay * this.reconnectAttempts)
        }
    }

    send(message: any) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message))
        } else {
            console.warn('WebSocket not connected, attempting to connect...')
            this.connect()
        }
    }

    subscribe(eventType: string, callback: Function) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, [])
        }
        this.listeners.get(eventType)!.push(callback)
    }

    unsubscribe(eventType: string, callback: Function) {
        const callbacks = this.listeners.get(eventType)
        if (callbacks) {
            const index = callbacks.indexOf(callback)
            if (index > -1) {
                callbacks.splice(index, 1)
            }
        }
    }

    private emit(eventType: string, data: any) {
        const callbacks = this.listeners.get(eventType) || []
        callbacks.forEach(callback => {
            try {
                callback(data)
            } catch (error) {
                console.error('WebSocket event callback error:', error)
            }
        })
    }

    subscribeToDomain(domainName: string) {
        this.send({
            type: 'subscribe_domain',
            domain: domainName
        })
    }

    requestAnalysis(domainName: string) {
        this.send({
            type: 'request_analysis',
            domain: domainName
        })
    }

    disconnect() {
        if (this.ws) {
            this.ws.close()
            this.ws = null
        }
        this.isConnecting = false
        this.listeners.clear()
    }
}

export const wsClient = new WebSocketClient()

// Auto-connect when in browser environment
if (typeof window !== 'undefined') {
    wsClient.connect()
}