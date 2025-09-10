// Advanced domain scoring algorithms

const COMMON_WORDS = new Set([
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'had', 'day'
])

const PREMIUM_KEYWORDS = new Set([
    'crypto', 'defi', 'nft', 'ai', 'blockchain', 'finance', 'trade', 'invest', 'money', 'bank', 'pay', 'shop', 'buy', 'sell'
])

function calculateBrandabilityScore(domainName) {
    const name = extractDomainName(domainName)
    let score = 50 // Base score

    // Length impact (sweet spot is 4-8 characters)
    if (name.length >= 4 && name.length <= 8) {
        score += 20
    } else if (name.length >= 3 && name.length <= 12) {
        score += 10
    } else if (name.length > 15) {
        score -= 20
    }

    // Pronounceability (simplified vowel/consonant ratio)
    const vowelRatio = (name.match(/[aeiou]/g) || []).length / name.length
    if (vowelRatio >= 0.2 && vowelRatio <= 0.5) {
        score += 15
    }

    // No hyphens or numbers (better for branding)
    if (!/[-0-9]/.test(name)) {
        score += 15
    } else {
        score -= 10
    }

    // Premium keywords
    for (const keyword of PREMIUM_KEYWORDS) {
        if (name.toLowerCase().includes(keyword)) {
            score += 20
            break
        }
    }

    // Avoid common words
    if (COMMON_WORDS.has(name.toLowerCase())) {
        score -= 15
    }

    return Math.min(100, Math.max(0, score))
}

function calculateMemorabilityScore(domainName) {
    const name = extractDomainName(domainName)
    let score = 50

    // Shorter names are more memorable
    if (name.length <= 6) {
        score += 25
    } else if (name.length <= 10) {
        score += 10
    } else {
        score -= 15
    }

    // Repetitive patterns (like 'papa', 'bobo')
    const hasPattern = /(.)\1/.test(name) || hasRhymePattern(name)
    if (hasPattern) {
        score += 15
    }

    // Dictionary words score higher
    if (isDictionaryWord(name)) {
        score += 20
    }

    // Avoid complex spellings
    if (/[qxz]/.test(name.toLowerCase())) {
        score -= 5
    }

    return Math.min(100, Math.max(0, score))
}

function calculateLinguisticScore(domainName) {
    const name = extractDomainName(domainName)
    let score = 50

    // Phonetic appeal
    const hasGoodFlow = checkPhoneticsFlow(name)
    if (hasGoodFlow) {
        score += 20
    }

    // Avoid ambiguous characters
    if (!/[il10o]/.test(name.toLowerCase())) {
        score += 10
    }

    // Start with consonant (often sounds stronger)
    if (/^[bcdfghjklmnpqrstvwxyz]/.test(name.toLowerCase())) {
        score += 10
    }

    // Word formation potential
    if (canFormCompoundWord(name)) {
        score += 15
    }

    return Math.min(100, Math.max(0, score))
}

function calculateMarketScore(domainName, tld) {
    const name = extractDomainName(domainName)
    let score = 50

    // TLD premium scoring
    const tldScores = {
        '.com': 30,
        '.io': 25,
        '.ai': 25,
        '.org': 20,
        '.net': 15,
        '.co': 15,
        '.crypto': 20,
        '.defi': 15,
        '.xyz': 10
    }

    score += tldScores[tld] || 5

    // Industry relevance
    if (isInTrendingCategory(name)) {
        score += 20
    }

    // Commercial potential
    if (hasCommercialAppeal(name)) {
        score += 15
    }

    return Math.min(100, Math.max(0, score))
}

// Helper functions
function extractDomainName(fullDomain) {
    return fullDomain.split('.')[0]
}

function hasRhymePattern(name) {
    // Simplified rhyme detection
    const syllables = name.match(/[aeiou]+/g) || []
    return syllables.length >= 2 && syllables[0] === syllables[syllables.length - 1]
}

function isDictionaryWord(name) {
    // Simplified dictionary check with common words
    const commonWords = ['app', 'web', 'tech', 'data', 'code', 'news', 'shop', 'game', 'book', 'food']
    return commonWords.includes(name.toLowerCase())
}

function checkPhoneticsFlow(name) {
    // Check for good consonant-vowel alternation
    const pattern = name.toLowerCase().replace(/[^a-z]/g, '')
    let alternation = 0
    for (let i = 1; i < pattern.length; i++) {
        const isCurrentVowel = 'aeiou'.includes(pattern[i])
        const isPrevVowel = 'aeiou'.includes(pattern[i - 1])
        if (isCurrentVowel !== isPrevVowel) alternation++
    }
    return alternation >= pattern.length * 0.4
}

function canFormCompoundWord(name) {
    // Check if name could be part of compound words
    const prefixes = ['auto', 'bio', 'eco', 'geo', 'micro', 'multi']
    const suffixes = ['hub', 'lab', 'net', 'pro', 'tech', 'zone']

    return prefixes.some(prefix => name.toLowerCase().startsWith(prefix)) ||
        suffixes.some(suffix => name.toLowerCase().endsWith(suffix))
}

function isInTrendingCategory(name) {
    const trendingTerms = ['ai', 'crypto', 'defi', 'nft', 'meta', 'web3', 'dao', 'dapp']
    return trendingTerms.some(term => name.toLowerCase().includes(term))
}

function hasCommercialAppeal(name) {
    const commercialTerms = ['shop', 'store', 'market', 'trade', 'buy', 'sell', 'pay', 'bank', 'finance']
    return commercialTerms.some(term => name.toLowerCase().includes(term))
}

module.exports = {
    calculateBrandabilityScore,
    calculateMemorabilityScore,
    calculateLinguisticScore,
    calculateMarketScore
}