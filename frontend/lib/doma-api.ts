const DOMA_API_BASE = process.env.NEXT_PUBLIC_DOMA_API_BASE || 'https://api-testnet.doma.xyz'
const API_KEY = process.env.NEXT_PUBLIC_DOMA_API_KEY

export interface DomainData {
    name: string
    tokenized: boolean
    onChainData: boolean
    owner?: string
    networkId?: string
    transactions: number
    rarity?: RarityData
}

export interface RarityData {
    lengthRarity: {
        percentage: number
        rank: number
        rarityScore: number
    }
    marketActivity: {
        activeListings: number
        totalTransactions: number
        liquidityScore: number
    }
    priceComparables: {
        floor: number
        median: number
        ceiling: number
        average: number
        count: number
    }
}

class DomaAPI {
    private async request(endpoint: string, options: RequestInit = {}) {
        // Fix: Properly handle potentially undefined API_KEY and type headers correctly
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        }

        // Only add Api-Key header if API_KEY exists
        if (API_KEY) {
            headers['Api-Key'] = API_KEY
        }

        // Merge with any existing headers
        if (options.headers) {
            Object.assign(headers, options.headers)
        }

        const response = await fetch(`${DOMA_API_BASE}${endpoint}`, {
            ...options,
            headers,
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
            query GetDomainComplete($name: String!) {
                name(name: $name) {
                    name
                    tld
                    tokenized
                    registrar {
                        name
                        ianaId
                    }
                    tokens {
                        tokenId
                        ownerAddress
                        networkId
                        type
                        expiresAt
                        activities {
                            type
                            createdAt
                        }
                        listings {
                            id
                            price
                            currency {
                                symbol
                            }
                            offererAddress
                            expiresAt
                        }
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
                    onChainData: false,
                    transactions: 0
                }
            }

            return {
                name: domainData.name,
                tokenized: domainData.tokenized,
                onChainData: true,
                owner: domainData.tokens?.[0]?.ownerAddress,
                networkId: domainData.tokens?.[0]?.networkId,
                transactions: domainData.tokens?.[0]?.activities?.length || 0,
            }
        } catch (error) {
            console.error('Error fetching domain info:', error)
            return {
                name: domainName,
                tokenized: false,
                onChainData: false,
                transactions: 0
            }
        }
    }

    async getMarketplaceListings(filters: { skip?: number; take?: number; tlds?: string[] } = {}) {
        const query = `
            query GetMarketplaceListings($skip: Float, $take: Float, $tlds: [String!]) {
                listings(skip: $skip, take: $take, tlds: $tlds) {
                    id
                    price
                    currency {
                        symbol
                        decimals
                    }
                    offererAddress
                    expiresAt
                    createdAt
                    orderbook
                }
                names(skip: $skip, take: $take, tlds: $tlds) {
                    items {
                        name
                        tld
                        tokenized
                        tokens {
                            listings {
                                price
                                currency {
                                    symbol
                                }
                            }
                        }
                    }
                }
            }
        `

        try {
            const response = await this.querySubgraph(query, filters)
            return {
                listings: response.data?.listings || [],
                domains: response.data?.names?.items || []
            }
        } catch (error) {
            console.error('Error fetching marketplace data:', error)
            return { listings: [], domains: [] }
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
        params.set('finalizedOnly', 'true')

        return this.request(`/v1/poll?${params.toString()}`)
    }

    async acknowledgeEvents(lastEventId: number) {
        return this.request(`/v1/poll/ack/${lastEventId}`, {
            method: 'POST'
        })
    }

    async getDomainRarity(domainName: string) {
        try {
            const response = await fetch(`/api/doma/rarity/${domainName}`)
            return response.json()
        } catch (error) {
            console.error('Error fetching domain rarity:', error)
            return null
        }
    }
}

export const domaAPI = new DomaAPI()