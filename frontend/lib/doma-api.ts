const DOMA_API_BASE = process.env.NEXT_PUBLIC_DOMA_API_BASE || 'https://api-testnet.doma.xyz'
const API_KEY = process.env.NEXT_PUBLIC_DOMA_API_KEY || 'demo-key'

export interface DomainData {
    name: string
    tokenized: boolean
    owner?: string
    networkId?: string
    transactions: number
}

export interface TokenData {
    tokenId: string
    ownerAddress: string
    type: string
    networkId: string
    createdAt: string
}

class DomaAPI {
    private async request(endpoint: string, options: RequestInit = {}) {
        const response = await fetch(`${DOMA_API_BASE}${endpoint}`, {
            headers: {
                'Api-Key': API_KEY,
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        })

        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`)
        }

        return response.json()
    }

    async querySubgraph(query: string, variables?: Record<string, any>) {
        return this.request('/graphql', {
            method: 'POST',
            body: JSON.stringify({ query, variables }),
        })
    }

    async getDomainInfo(domainName: string): Promise<DomainData> {
        const query = `
      query GetDomain($name: String!) {
        name(name: $name) {
          name
          tokens {
            tokenId
            ownerAddress
            type
            networkId
            createdAt
          }
          activities {
            type
            createdAt
          }
        }
      }
    `

        try {
            const response = await this.querySubgraph(query, { name: domainName })
            const domainData = response.data?.name

            if (!domainData) {
                return {
                    name: domainName,
                    tokenized: false,
                    transactions: 0
                }
            }

            return {
                name: domainData.name,
                tokenized: domainData.tokens.length > 0,
                owner: domainData.tokens[0]?.ownerAddress,
                networkId: domainData.tokens[0]?.networkId,
                transactions: domainData.activities.length
            }
        } catch (error) {
            console.error('Error fetching domain info:', error)
            return {
                name: domainName,
                tokenized: false,
                transactions: 0
            }
        }
    }

    async getListings(filters: { skip?: number; take?: number } = {}) {
        const query = `
      query GetListings($skip: Float, $take: Float) {
        listings(skip: $skip, take: $take) {
          id
          price
          currency {
            symbol
          }
          createdAt
          expiresAt
        }
      }
    `

        try {
            const response = await this.querySubgraph(query, filters)
            return response.data?.listings || []
        } catch (error) {
            console.error('Error fetching listings:', error)
            return []
        }
    }

    async pollEvents(eventTypes?: string[], limit?: number) {
        const params = new URLSearchParams()
        if (eventTypes) {
            eventTypes.forEach(type => params.append('eventTypes', type))
        }
        if (limit) {
            params.set('limit', limit.toString())
        }

        return this.request(`/v1/poll?${params.toString()}`)
    }
}

export const domaAPI = new DomaAPI()