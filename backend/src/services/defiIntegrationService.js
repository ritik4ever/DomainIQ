const domaBlockchainService = require('./domaBlockchainService')

class DeFiIntegrationService {
    constructor() {
        this.fractionalizedDomains = new Map()
        this.stakingPools = new Map()
        this.yieldRates = {
            'com': 0.05, // 5% APY
            'io': 0.08,  // 8% APY
            'ai': 0.12,  // 12% APY
            'crypto': 0.15, // 15% APY
            'defi': 0.18    // 18% APY
        }
        this.liquidityPools = new Map()
        this.totalValueLocked = 0
    }

    // Fractionalize domain into tradeable tokens
    async fractionalizeAsset(domain, shares = 1000, valuation) {
        try {
            console.log(`🔄 Fractionalizing ${domain} into ${shares} shares`)

            // Create real transaction for fractionalization
            const tokenPrice = valuation / shares
            const tx = await domaBlockchainService.tokenizeDomain(`fractionalized-${domain}`)

            const fractionData = {
                domain,
                totalShares: shares,
                availableShares: shares,
                sharePrice: tokenPrice,
                totalValuation: valuation,
                holders: [],
                createdAt: new Date().toISOString(),
                contractAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
                txHash: tx.txHash,
                explorerUrl: tx.explorerUrl,
                status: 'active'
            }

            this.fractionalizedDomains.set(domain, fractionData)
            this.totalValueLocked += valuation

            console.log(`✅ Successfully fractionalized ${domain}`)

            return {
                success: true,
                domain,
                shares,
                sharePrice: tokenPrice,
                contractAddress: fractionData.contractAddress,
                txHash: tx.txHash,
                explorerUrl: tx.explorerUrl,
                message: `Successfully fractionalized ${domain} into ${shares} shares at $${tokenPrice.toFixed(2)} each`,
                volume: valuation,
                timestamp: new Date().toISOString()
            }

        } catch (error) {
            console.error('❌ Fractionalization error:', error)
            throw new Error(`Fractionalization failed: ${error.message}`)
        }
    }

    // Purchase fractional shares
    async purchaseShares(domain, sharesToBuy, buyerAddress) {
        try {
            const fractionData = this.fractionalizedDomains.get(domain)
            if (!fractionData) {
                throw new Error('Domain not fractionalized')
            }

            if (sharesToBuy > fractionData.availableShares) {
                throw new Error('Insufficient shares available')
            }

            const totalCost = sharesToBuy * fractionData.sharePrice

            // Create purchase transaction
            const tx = await domaBlockchainService.createMarketplaceListing(
                `${domain}-shares`,
                totalCost / 1000000 // Convert to ETH
            )

            // Update share ownership
            fractionData.availableShares -= sharesToBuy
            const existingHolder = fractionData.holders.find(h => h.address === buyerAddress)

            if (existingHolder) {
                existingHolder.shares += sharesToBuy
            } else {
                fractionData.holders.push({
                    address: buyerAddress,
                    shares: sharesToBuy,
                    purchasePrice: fractionData.sharePrice,
                    purchaseDate: new Date().toISOString()
                })
            }

            return {
                success: true,
                domain,
                sharesToBuy,
                totalCost,
                txHash: tx.txHash,
                explorerUrl: tx.explorerUrl,
                message: `Purchased ${sharesToBuy} shares of ${domain} for $${totalCost.toFixed(2)}`,
                volume: totalCost
            }

        } catch (error) {
            console.error('❌ Share purchase error:', error)
            throw new Error(`Share purchase failed: ${error.message}`)
        }
    }

    // Stake domain for yield generation
    async stakeDomain(domain, stakingPeriod = 90, principal = 2500) {
        try {
            console.log(`🥩 Staking ${domain} for ${stakingPeriod} days`)

            const extension = domain.split('.')[1]?.toLowerCase()
            const apy = this.yieldRates[extension] || 0.05

            // Create staking transaction
            const tx = await domaBlockchainService.tokenizeDomain(`staked-${domain}`)

            const stakingData = {
                domain,
                principal,
                stakingPeriod,
                apy,
                stakedAt: new Date().toISOString(),
                maturityDate: new Date(Date.now() + stakingPeriod * 24 * 60 * 60 * 1000).toISOString(),
                txHash: tx.txHash,
                explorerUrl: tx.explorerUrl,
                status: 'active',
                accruedYield: 0
            }

            this.stakingPools.set(domain, stakingData)
            this.totalValueLocked += principal

            const estimatedYield = this.calculateYield(principal, apy, stakingPeriod)

            console.log(`✅ Successfully staked ${domain}`)

            return {
                success: true,
                domain,
                principal,
                stakingPeriod,
                apy: `${(apy * 100).toFixed(1)}%`,
                estimatedYield: estimatedYield.toFixed(2),
                txHash: tx.txHash,
                explorerUrl: tx.explorerUrl,
                message: `Successfully staked ${domain} for ${stakingPeriod} days at ${(apy * 100).toFixed(1)}% APY`,
                volume: principal
            }

        } catch (error) {
            console.error('❌ Staking error:', error)
            throw new Error(`Staking failed: ${error.message}`)
        }
    }

    // Create liquidity pool for domain trading
    async createLiquidityPool(domain, initialLiquidity, feeRate = 0.3) {
        try {
            console.log(`💧 Creating liquidity pool for ${domain}`)

            const tx = await domaBlockchainService.tokenizeDomain(`pool-${domain}`)

            const poolData = {
                domain,
                initialLiquidity,
                currentLiquidity: initialLiquidity,
                feeRate, // 0.3% fee
                volume24h: 0,
                trades: [],
                createdAt: new Date().toISOString(),
                txHash: tx.txHash,
                explorerUrl: tx.explorerUrl,
                apr: this.calculatePoolAPR(domain, initialLiquidity)
            }

            this.liquidityPools.set(domain, poolData)
            this.totalValueLocked += initialLiquidity

            return {
                success: true,
                domain,
                initialLiquidity,
                feeRate: `${feeRate}%`,
                apr: `${poolData.apr.toFixed(2)}%`,
                txHash: tx.txHash,
                explorerUrl: tx.explorerUrl,
                message: `Created liquidity pool for ${domain} with $${initialLiquidity.toLocaleString()} initial liquidity`,
                volume: initialLiquidity
            }

        } catch (error) {
            console.error('❌ Liquidity pool creation error:', error)
            throw new Error(`Pool creation failed: ${error.message}`)
        }
    }

    // Unstake domain and claim rewards
    async unstakeDomain(domain) {
        try {
            const stakingData = this.stakingPools.get(domain)
            if (!stakingData) {
                throw new Error('Domain not staked')
            }

            const now = new Date()
            const stakedAt = new Date(stakingData.stakedAt)
            const daysStaked = Math.floor((now - stakedAt) / (1000 * 60 * 60 * 24))

            const earnedYield = this.calculateYield(stakingData.principal, stakingData.apy, daysStaked)
            const totalReturn = stakingData.principal + earnedYield

            // Create unstaking transaction
            const tx = await domaBlockchainService.createMarketplaceListing(
                `unstake-${domain}`,
                totalReturn / 1000000
            )

            // Update staking data
            stakingData.status = 'completed'
            stakingData.completedAt = now.toISOString()
            stakingData.finalYield = earnedYield

            this.totalValueLocked -= stakingData.principal

            return {
                success: true,
                domain,
                principal: stakingData.principal,
                daysStaked,
                earnedYield: earnedYield.toFixed(2),
                totalReturn: totalReturn.toFixed(2),
                txHash: tx.txHash,
                explorerUrl: tx.explorerUrl,
                message: `Unstaked ${domain}, earned $${earnedYield.toFixed(2)} yield over ${daysStaked} days`,
                volume: totalReturn
            }

        } catch (error) {
            console.error('❌ Unstaking error:', error)
            throw new Error(`Unstaking failed: ${error.message}`)
        }
    }

    // Calculate yield for staking
    calculateYield(principal, apy, days) {
        return principal * apy * (days / 365)
    }

    // Calculate APR for liquidity pools
    calculatePoolAPR(domain, liquidity) {
        const extension = domain.split('.')[1]?.toLowerCase()
        const baseAPR = this.yieldRates[extension] || 0.05

        // Higher liquidity = lower APR (more stable)
        const liquidityMultiplier = Math.max(0.5, 1 - (liquidity / 100000))

        return (baseAPR * liquidityMultiplier + 0.03) * 100 // Add 3% base pool reward
    }

    // Get fractionalization data
    getFractionalizationData(domain) {
        return this.fractionalizedDomains.get(domain) || null
    }

    // Get staking data
    getStakingData(domain) {
        const stakingData = this.stakingPools.get(domain)
        if (!stakingData) return null

        // Calculate current accrued yield
        const now = new Date()
        const stakedAt = new Date(stakingData.stakedAt)
        const daysStaked = Math.floor((now - stakedAt) / (1000 * 60 * 60 * 24))

        stakingData.currentYield = this.calculateYield(stakingData.principal, stakingData.apy, daysStaked)
        stakingData.daysStaked = daysStaked

        return stakingData
    }

    // Get all DeFi opportunities
    getDeFiOpportunities() {
        const fractionalOpportunities = Array.from(this.fractionalizedDomains.values())
            .filter(f => f.availableShares > 0 && f.status === 'active')
            .map(f => ({
                type: 'fractionalization',
                domain: f.domain,
                opportunity: `${f.availableShares} shares available at $${f.sharePrice.toFixed(2)} each`,
                potential: `Total value: $${f.totalValuation.toLocaleString()}`,
                action: 'purchase_shares',
                priority: f.availableShares < f.totalShares * 0.1 ? 'high' : 'medium'
            }))

        const stakingOpportunities = Object.entries(this.yieldRates)
            .map(([extension, apy]) => ({
                type: 'staking',
                extension: `.${extension}`,
                opportunity: `Stake .${extension} domains for ${(apy * 100).toFixed(1)}% APY`,
                potential: `Estimated yearly yield: $${(2500 * apy).toFixed(0)}`,
                action: 'stake_domain',
                priority: apy > 0.1 ? 'high' : 'medium'
            }))

        const poolOpportunities = Array.from(this.liquidityPools.values())
            .map(p => ({
                type: 'liquidity_pool',
                domain: p.domain,
                opportunity: `Provide liquidity for ${p.apr.toFixed(1)}% APR`,
                potential: `Current pool size: $${p.currentLiquidity.toLocaleString()}`,
                action: 'add_liquidity',
                priority: p.apr > 15 ? 'high' : 'medium'
            }))

        return {
            fractional: fractionalOpportunities,
            staking: stakingOpportunities,
            liquidity: poolOpportunities,
            totalOpportunities: fractionalOpportunities.length + stakingOpportunities.length + poolOpportunities.length
        }
    }

    // Get DeFi statistics
    getDeFiStats() {
        const activeStaking = Array.from(this.stakingPools.values())
            .filter(s => s.status === 'active')

        const activeFractionalization = Array.from(this.fractionalizedDomains.values())
            .filter(f => f.status === 'active')

        const activePools = Array.from(this.liquidityPools.values())

        const totalYieldGenerated = activeStaking
            .reduce((sum, s) => {
                const daysStaked = Math.floor((Date.now() - new Date(s.stakedAt)) / (1000 * 60 * 60 * 24))
                return sum + this.calculateYield(s.principal, s.apy, daysStaked)
            }, 0)

        return {
            totalValueLocked: this.totalValueLocked,
            activeStaking: activeStaking.length,
            stakedValue: activeStaking.reduce((sum, s) => sum + s.principal, 0),
            activeFractionalization: activeFractionalization.length,
            fractionalizedValue: activeFractionalization.reduce((sum, f) => sum + f.totalValuation, 0),
            liquidityPools: activePools.length,
            poolLiquidity: activePools.reduce((sum, p) => sum + p.currentLiquidity, 0),
            totalYieldGenerated: totalYieldGenerated.toFixed(2),
            averageAPY: Object.values(this.yieldRates).reduce((a, b) => a + b, 0) / Object.values(this.yieldRates).length * 100
        }
    }

    // Simulate yield farming rewards
    async claimYieldRewards(userAddress) {
        try {
            const userStaking = Array.from(this.stakingPools.values())
                .filter(s => s.status === 'active') // In real implementation, filter by user

            let totalRewards = 0
            const claimedRewards = []

            for (const stake of userStaking) {
                const daysStaked = Math.floor((Date.now() - new Date(stake.stakedAt)) / (1000 * 60 * 60 * 24))
                const accruedYield = this.calculateYield(stake.principal, stake.apy, daysStaked)

                if (accruedYield > 0) {
                    totalRewards += accruedYield
                    claimedRewards.push({
                        domain: stake.domain,
                        yield: accruedYield.toFixed(2),
                        apy: `${(stake.apy * 100).toFixed(1)}%`,
                        daysStaked
                    })

                    // Reset accrued yield (claimed)
                    stake.stakedAt = new Date().toISOString()
                }
            }

            if (totalRewards > 0) {
                // Create claim transaction
                const tx = await domaBlockchainService.createMarketplaceListing(
                    'yield-claim',
                    totalRewards / 1000000
                )

                return {
                    success: true,
                    totalRewards: totalRewards.toFixed(2),
                    claimedRewards,
                    txHash: tx.txHash,
                    explorerUrl: tx.explorerUrl,
                    message: `Claimed $${totalRewards.toFixed(2)} in yield rewards`,
                    volume: totalRewards
                }
            } else {
                return {
                    success: false,
                    message: 'No rewards available to claim',
                    totalRewards: '0.00'
                }
            }

        } catch (error) {
            console.error('❌ Yield claim error:', error)
            throw new Error(`Yield claim failed: ${error.message}`)
        }
    }

    // Get user's DeFi portfolio
    getUserDeFiPortfolio(userAddress) {
        const userStaking = Array.from(this.stakingPools.values())
            .filter(s => s.status === 'active')
            .map(s => {
                const daysStaked = Math.floor((Date.now() - new Date(s.stakedAt)) / (1000 * 60 * 60 * 24))
                const currentYield = this.calculateYield(s.principal, s.apy, daysStaked)

                return {
                    ...s,
                    currentYield: currentYield.toFixed(2),
                    daysStaked,
                    maturityProgress: Math.min(100, (daysStaked / s.stakingPeriod) * 100).toFixed(1)
                }
            })

        const userFractions = Array.from(this.fractionalizedDomains.values())
            .map(f => ({
                domain: f.domain,
                totalShares: f.totalShares,
                availableShares: f.availableShares,
                sharePrice: f.sharePrice,
                totalValuation: f.totalValuation,
                holders: f.holders.length
            }))

        return {
            staking: userStaking,
            fractionalized: userFractions,
            totalStaked: userStaking.reduce((sum, s) => sum + s.principal, 0),
            totalYield: userStaking.reduce((sum, s) => sum + parseFloat(s.currentYield), 0),
            portfolioValue: userStaking.reduce((sum, s) => sum + s.principal + parseFloat(s.currentYield), 0)
        }
    }
}

module.exports = new DeFiIntegrationService()