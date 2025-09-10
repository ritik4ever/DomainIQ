const { ethers } = require('ethers')

class ContractService {
    constructor() {
        this.contractAddress = process.env.CONTRACT_ADDRESS
        this.provider = new ethers.JsonRpcProvider(`https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`)
        this.contract = null
        this.initializeContract()
    }

    async initializeContract() {
        try {
            const abi = require('../contracts/DomainIntelligence.json')
            this.contract = new ethers.Contract(this.contractAddress, abi, this.provider)
            console.log('Smart contract initialized:', this.contractAddress)
        } catch (error) {
            console.error('Contract initialization failed:', error.message)
        }
    }

    async getDomainScore(domain) {
        try {
            const score = await this.contract.getDomainScore(domain)
            return {
                domain: score.domain,
                aiScore: Number(score.aiScore),
                marketScore: Number(score.marketScore),
                timestamp: Number(score.timestamp),
                scorer: score.scorer,
                verified: score.verified
            }
        } catch (error) {
            console.error('Get domain score error:', error)
            return null
        }
    }

    async getCommunityRatingsCount(domain) {
        try {
            const count = await this.contract.getCommunityRatingsCount(domain)
            return Number(count)
        } catch (error) {
            console.error('Get ratings count error:', error)
            return 0
        }
    }
}

module.exports = new ContractService()