// TLD categories and scoring
const TLD_CATEGORIES = {
    premium: ['.com', '.org', '.net'],
    tech: ['.io', '.ai', '.tech', '.dev'],
    crypto: ['.crypto', '.defi', '.dao', '.nft'],
    new: ['.xyz', '.app', '.online', '.site'],
    country: ['.co', '.me', '.tv', '.ly']
}

const TLD_SCORES = {
    '.com': 30,
    '.io': 25,
    '.ai': 25,
    '.org': 20,
    '.net': 15,
    '.co': 15,
    '.crypto': 20,
    '.defi': 15,
    '.nft': 12,
    '.dao': 12,
    '.xyz': 10,
    '.app': 18,
    '.tech': 18,
    '.dev': 18,
    '.online': 8,
    '.site': 8
}

// Keyword categories for market analysis
const KEYWORD_CATEGORIES = {
    ai: ['ai', 'artificial', 'intelligence', 'machine', 'learning', 'neural', 'deep'],
    crypto: ['crypto', 'bitcoin', 'ethereum', 'blockchain', 'defi', 'nft', 'dao', 'web3'],
    finance: ['finance', 'bank', 'money', 'pay', 'invest', 'trade', 'wallet', 'loan'],
    tech: ['tech', 'app', 'software', 'code', 'dev', 'data', 'cloud', 'api'],
    business: ['business', 'company', 'corporate', 'enterprise', 'market', 'sales'],
    gaming: ['game', 'gaming', 'play', 'player', 'esports', 'metaverse'],
    health: ['health', 'medical', 'care', 'wellness', 'fitness', 'bio'],
    education: ['edu', 'learn', 'study', 'school', 'course', 'training'],
    ecommerce: ['shop', 'store', 'buy', 'sell', 'cart', 'marketplace', 'retail']
}

// Common dictionary words for memorability scoring
const DICTIONARY_WORDS = new Set([
    'app', 'web', 'tech', 'data', 'code', 'news', 'shop', 'game', 'book', 'food',
    'home', 'care', 'life', 'time', 'work', 'love', 'mind', 'world', 'earth',
    'space', 'future', 'smart', 'quick', 'fast', 'easy', 'simple', 'pure', 'fresh'
])

// Premium keywords that add value
const PREMIUM_KEYWORDS = new Set([
    'crypto', 'defi', 'nft', 'ai', 'blockchain', 'finance', 'trade', 'invest',
    'money', 'bank', 'pay', 'shop', 'buy', 'sell', 'market', 'business', 'tech',
    'app', 'web', 'cloud', 'data', 'smart', 'digital', 'online', 'global'
])

// Words that might reduce commercial appeal
const COMMON_WORDS = new Set([
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her',
    'was', 'one', 'our', 'had', 'day', 'get', 'has', 'him', 'his', 'how'
])

// Network configurations for different chains
const NETWORK_CONFIG = {
    'doma-testnet': {
        name: 'Doma Testnet',
        chainId: '67478',
        rpcUrl: 'https://rpc-testnet.doma.xyz',
        explorerUrl: 'https://explorer-testnet.doma.xyz'
    },
    'sepolia': {
        name: 'Sepolia Testnet',
        chainId: '11155111',
        rpcUrl: 'https://sepolia.infura.io/v3/',
        explorerUrl: 'https://sepolia.etherscan.io'
    },
    'base-sepolia': {
        name: 'Base Sepolia',
        chainId: '84532',
        rpcUrl: 'https://sepolia.base.org',
        explorerUrl: 'https://sepolia-explorer.base.org'
    }
}

// API rate limits and timeouts
const API_CONFIG = {
    RATE_LIMIT_REQUESTS: 100,
    RATE_LIMIT_WINDOW: 60 * 1000, // 1 minute
    REQUEST_TIMEOUT: 30000, // 30 seconds
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000 // 1 second
}

module.exports = {
    TLD_CATEGORIES,
    TLD_SCORES,
    KEYWORD_CATEGORIES,
    DICTIONARY_WORDS,
    PREMIUM_KEYWORDS,
    COMMON_WORDS,
    NETWORK_CONFIG,
    API_CONFIG
}