class Domain {
    constructor({
        name,
        tld,
        length,
        tokenized = false,
        owner = null,
        networkId = null,
        transactionCount = 0,
        score = null,
        brandability = null,
        memorability = null,
        linguistic = null,
        market = null,
        trend = 'stable',
        price = null,
        createdAt = new Date(),
        updatedAt = new Date()
    }) {
        this.name = name
        this.tld = tld
        this.length = length
        this.tokenized = tokenized
        this.owner = owner
        this.networkId = networkId
        this.transactionCount = transactionCount
        this.score = score
        this.brandability = brandability
        this.memorability = memorability
        this.linguistic = linguistic
        this.market = market
        this.trend = trend
        this.price = price
        this.createdAt = createdAt
        this.updatedAt = updatedAt
    }

    static fromDomaData(domaResponse) {
        const domainData = domaResponse.data?.name

        if (!domainData) {
            return null
        }

        return new Domain({
            name: domainData.name,
            tld: domainData.name.split('.').slice(1).join('.'),
            length: domainData.name.split('.')[0].length,
            tokenized: domainData.tokens.length > 0,
            owner: domainData.tokens[0]?.ownerAddress,
            networkId: domainData.tokens[0]?.networkId,
            transactionCount: domainData.activities.length,
            createdAt: domainData.tokens[0]?.createdAt
        })
    }

    toJSON() {
        return {
            name: this.name,
            tld: this.tld,
            length: this.length,
            tokenized: this.tokenized,
            owner: this.owner,
            networkId: this.networkId,
            transactionCount: this.transactionCount,
            score: this.score,
            brandability: this.brandability,
            memorability: this.memorability,
            linguistic: this.linguistic,
            market: this.market,
            trend: this.trend,
            price: this.price,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        }
    }
}

module.exports = Domain