export interface ScoringMetrics {
    overall: number
    brandability: number
    memorability: number
    linguistic: number
    market: number
}

export interface DomainAnalysis {
    domain: string
    scoring: ScoringMetrics
    trend: 'up' | 'down' | 'stable'
    estimatedPrice: string
    recommendations: Recommendation[]
}

export interface Recommendation {
    type: 'buy' | 'sell' | 'hold' | 'caution'
    message: string
    confidence: number
}

export function calculateLocalScore(domainName: string, tld: string = '.com'): ScoringMetrics {
    const name = domainName.split('.')[0].toLowerCase()

    // Brandability Score
    let brandability = 50
    if (name.length >= 4 && name.length <= 8) brandability += 20
    if (!/[-0-9]/.test(name)) brandability += 15
    if (hasVowelBalance(name)) brandability += 15

    // Memorability Score  
    let memorability = 50
    if (name.length <= 6) memorability += 25
    if (isDictionaryWord(name)) memorability += 20
    if (hasPattern(name)) memorability += 15

    // Linguistic Score
    let linguistic = 50
    if (hasGoodFlow(name)) linguistic += 20
    if (!/[il10o]/.test(name)) linguistic += 15
    if (/^[bcdfg]/.test(name)) linguistic += 15

    // Market Score
    let market = 50
    const tldBonus = getTLDBonus(tld)
    market += tldBonus
    if (hasTrendingKeywords(name)) market += 20
    if (hasCommercialValue(name)) market += 15

    // Calculate overall score
    const overall = Math.round(
        (brandability * 0.3) + (memorability * 0.25) + (linguistic * 0.25) + (market * 0.2)
    )

    return {
        overall: Math.min(100, Math.max(0, overall)),
        brandability: Math.min(100, Math.max(0, brandability)),
        memorability: Math.min(100, Math.max(0, memorability)),
        linguistic: Math.min(100, Math.max(0, linguistic)),
        market: Math.min(100, Math.max(0, market))
    }
}

function hasVowelBalance(name: string): boolean {
    const vowels = (name.match(/[aeiou]/g) || []).length
    const ratio = vowels / name.length
    return ratio >= 0.2 && ratio <= 0.5
}

function isDictionaryWord(name: string): boolean {
    const common = ['app', 'web', 'tech', 'data', 'code', 'news', 'shop', 'game', 'book', 'food', 'home', 'care', 'life', 'time', 'work']
    return common.includes(name)
}

function hasPattern(name: string): boolean {
    return /(.)\1/.test(name) || name.length > 2 && name[0] === name[name.length - 1]
}

function hasGoodFlow(name: string): boolean {
    let alternations = 0
    for (let i = 1; i < name.length; i++) {
        const isVowel = 'aeiou'.includes(name[i])
        const prevIsVowel = 'aeiou'.includes(name[i - 1])
        if (isVowel !== prevIsVowel) alternations++
    }
    return alternations >= name.length * 0.4
}

function getTLDBonus(tld: string): number {
    const bonuses: Record<string, number> = {
        '.com': 30, '.io': 25, '.ai': 25, '.org': 20, '.net': 15,
        '.co': 15, '.crypto': 20, '.defi': 15, '.xyz': 10
    }
    return bonuses[tld] || 5
}

function hasTrendingKeywords(name: string): boolean {
    const trending = ['ai', 'crypto', 'defi', 'nft', 'meta', 'web3', 'dao', 'dapp', 'blockchain']
    return trending.some(keyword => name.includes(keyword))
}

function hasCommercialValue(name: string): boolean {
    const commercial = ['shop', 'store', 'market', 'trade', 'buy', 'sell', 'pay', 'bank', 'finance', 'invest']
    return commercial.some(keyword => name.includes(keyword))
}

export function generateRecommendations(scoring: ScoringMetrics, domainName: string): Recommendation[] {
    const recommendations: Recommendation[] = []

    if (scoring.overall >= 85) {
        recommendations.push({
            type: 'buy',
            message: 'Excellent domain with strong investment potential',
            confidence: 0.9
        })
    } else if (scoring.overall >= 70) {
        recommendations.push({
            type: 'buy',
            message: 'Good domain suitable for branding or development',
            confidence: 0.7
        })
    } else if (scoring.overall >= 50) {
        recommendations.push({
            type: 'hold',
            message: 'Average domain with moderate potential',
            confidence: 0.5
        })
    } else {
        recommendations.push({
            type: 'caution',
            message: 'Below average metrics, consider alternatives',
            confidence: 0.8
        })
    }

    if (scoring.brandability < 60) {
        recommendations.push({
            type: 'caution',
            message: 'Low brandability may limit commercial appeal',
            confidence: 0.7
        })
    }

    if (scoring.market > 80) {
        recommendations.push({
            type: 'buy',
            message: 'Strong market position in trending category',
            confidence: 0.8
        })
    }

    return recommendations
}