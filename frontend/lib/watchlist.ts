const WATCHLIST_KEY = 'domain-watchlist'

export interface WatchlistItem {
    domain: string
    addedAt: string
    score?: number
    price?: string
}

export class WatchlistManager {
    static getWatchlist(): WatchlistItem[] {
        if (typeof window === 'undefined') return []

        try {
            const stored = localStorage.getItem(WATCHLIST_KEY)
            return stored ? JSON.parse(stored) : []
        } catch (error) {
            console.error('Error reading watchlist:', error)
            return []
        }
    }

    static addToWatchlist(domain: string, score?: number, price?: string): boolean {
        try {
            const watchlist = this.getWatchlist()

            // Check if already exists
            if (watchlist.some(item => item.domain === domain)) {
                return false
            }

            const newItem: WatchlistItem = {
                domain,
                addedAt: new Date().toISOString(),
                score,
                price
            }

            watchlist.push(newItem)
            localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist))
            return true
        } catch (error) {
            console.error('Error adding to watchlist:', error)
            return false
        }
    }

    static removeFromWatchlist(domain: string): boolean {
        try {
            const watchlist = this.getWatchlist()
            const filtered = watchlist.filter(item => item.domain !== domain)

            localStorage.setItem(WATCHLIST_KEY, JSON.stringify(filtered))
            return true
        } catch (error) {
            console.error('Error removing from watchlist:', error)
            return false
        }
    }

    static isInWatchlist(domain: string): boolean {
        const watchlist = this.getWatchlist()
        return watchlist.some(item => item.domain === domain)
    }

    static getWatchlistCount(): number {
        return this.getWatchlist().length
    }
}