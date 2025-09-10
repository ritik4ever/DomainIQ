'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'

export interface WatchlistItem {
    domain: string
    addedAt: string
    score?: number
    price?: string
}

export function useWatchlist() {
    const { address } = useAccount()
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (address) {
            fetchWatchlist()
        } else {
            setWatchlist([])
            setLoading(false)
        }
    }, [address])

    const fetchWatchlist = async () => {
        if (!address) return

        try {
            setLoading(true)
            const response = await fetch(`/api/proxy/watchlist/${address}`)
            const data = await response.json()
            setWatchlist(data.watchlist || [])
        } catch (error) {
            console.error('Error fetching watchlist:', error)
            setWatchlist([])
        } finally {
            setLoading(false)
        }
    }

    const addToWatchlist = async (domain: string, score?: number, price?: string) => {
        if (!address) return false

        try {
            const response = await fetch(`/api/proxy/watchlist/${address}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ domain, score, price }),
            })

            if (response.ok) {
                const data = await response.json()
                setWatchlist(data.watchlist || [])
                return true
            } else {
                const error = await response.json()
                console.error('Add to watchlist error:', error.error)
                return false
            }
        } catch (error) {
            console.error('Error adding to watchlist:', error)
            return false
        }
    }

    const removeFromWatchlist = async (domain: string) => {
        if (!address) return false

        try {
            const response = await fetch(`/api/proxy/watchlist/${address}/${encodeURIComponent(domain)}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                const data = await response.json()
                setWatchlist(data.watchlist || [])
                return true
            } else {
                console.error('Remove from watchlist error')
                return false
            }
        } catch (error) {
            console.error('Error removing from watchlist:', error)
            return false
        }
    }

    const isInWatchlist = (domain: string) => {
        return watchlist.some(item => item.domain === domain)
    }

    return {
        watchlist,
        loading,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
        count: watchlist.length,
        refetch: fetchWatchlist
    }
}