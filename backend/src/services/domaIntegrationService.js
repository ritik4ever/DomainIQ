const axios = require('axios')

class DomaIntegrationService {
    constructor() {
        this.apiKey = process.env.DOMA_API_KEY
        this.graphqlEndpoint = 'https://api-testnet.doma.xyz/graphql'
        this.connectionStatus = 'disconnected'

        this.axiosInstance = axios.create({
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'User-Agent': 'DomainIQ/1.0'
            },
            timeout: 10000
        })

        console.log('🔧 Doma service configured with API key:', this.apiKey ? 'Present' : 'Missing')
    }

    async testConnection() {
        try {
            console.log('🔍 Testing Doma API connection...')
            console.log('📡 Endpoint:', this.graphqlEndpoint)
            console.log('🔑 API Key:', this.apiKey ? `${this.apiKey.substring(0, 10)}...` : 'MISSING')

            if (!this.apiKey) {
                console.error('❌ Doma API key is missing')
                this.connectionStatus = 'missing-key'
                return false
            }

            // Simple introspection query to test connection
            const testQuery = `
        query {
          __schema {
            queryType {
              name
            }
          }
        }
      `

            const response = await this.axiosInstance.post(this.graphqlEndpoint, {
                query: testQuery
            })

            console.log('📊 Doma API Response Status:', response.status)
            console.log('📊 Doma API Response Data:', JSON.stringify(response.data, null, 2))

            if (response.data.errors) {
                console.log('⚠️ GraphQL errors:', response.data.errors)
                this.connectionStatus = 'graphql-errors'
                return false
            }

            if (response.data.data && response.data.data.__schema) {
                console.log('✅ Doma API connection successful')
                this.connectionStatus = 'connected'
                return true
            } else {
                console.log('⚠️ Unexpected response structure')
                this.connectionStatus = 'unexpected-response'
                return false
            }

        } catch (error) {
            console.error('❌ Doma API connection failed:')
            console.error(`   Status: ${error.response?.status}`)
            console.error(`   Data: ${JSON.stringify(error.response?.data)}`)
            console.error(`   Message: ${error.message}`)
            console.error(`   URL: ${error.config?.url}`)

            this.connectionStatus = 'connection-failed'
            return false
        }
    }

    async initializeWebSocket() {
        console.log('🔗 WebSocket initialization skipped (focusing on GraphQL first)')
        return true
    }

    async getDomainFullData(domainName) {
        try {
            console.log(`🔍 Fetching domain data for: ${domainName}`)

            if (this.connectionStatus !== 'connected') {
                console.log('⚠️ Doma not connected, using mock data')
                return this.getMockDomainData(domainName)
            }

            // Try a simple query first
            const query = `
        query {
          __typename
        }
      `

            const response = await this.axiosInstance.post(this.graphqlEndpoint, { query })

            if (response.data.errors) {
                console.log('GraphQL query errors:', response.data.errors)
                return this.getMockDomainData(domainName)
            }

            // For now, return mock data until we figure out the exact schema
            return this.getMockDomainData(domainName)

        } catch (error) {
            console.error(`Domain data fetch error for ${domainName}:`, error.message)
            return this.getMockDomainData(domainName)
        }
    }

    getMockDomainData(domainName) {
        const isTokenized = Math.random() > 0.6

        return {
            name: domainName,
            exists: isTokenized,
            owner: isTokenized ? `0x${Math.random().toString(16).substr(2, 40)}` : null,
            tokenized: isTokenized,

            activity: {
                totalEvents: Math.floor(Math.random() * 20),
                transferCount: Math.floor(Math.random() * 5)
            },

            network: {
                chain: 'ethereum-testnet',
                supported: true
            },

            lastUpdated: new Date().toISOString()
        }
    }

    getConnectionStatus() {
        return {
            status: this.connectionStatus,
            endpoint: this.graphqlEndpoint,
            hasApiKey: !!this.apiKey,
            keyPreview: this.apiKey ? `${this.apiKey.substring(0, 10)}...` : 'Missing',
            lastChecked: new Date().toISOString()
        }
    }
}

module.exports = new DomaIntegrationService()