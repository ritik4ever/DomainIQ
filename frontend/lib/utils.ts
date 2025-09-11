import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount)
}

export function formatNumber(num: number): string {
    return new Intl.NumberFormat().format(num)
}

export function truncateAddress(address: string, chars = 4): string {
    return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

export function getRelativeTime(date: string): string {
    const now = new Date()
    const past = new Date(date)
    const diffTime = Math.abs(now.getTime() - past.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return '1 day ago'
    if (diffDays < 30) return `${diffDays} days ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
}

// DeFi-specific utility functions
export function formatAPY(apy: number): string {
    return `${(apy * 100).toFixed(2)}%`
}

export function formatPercentage(value: number, decimals = 2): string {
    return `${value.toFixed(decimals)}%`
}

export function formatVolume(volume: number): string {
    if (volume >= 1000000) {
        return `$${(volume / 1000000).toFixed(1)}M`
    }
    if (volume >= 1000) {
        return `$${(volume / 1000).toFixed(1)}K`
    }
    return formatCurrency(volume)
}

export function formatTxHash(hash: string, chars = 6): string {
    if (!hash) return ''
    return `${hash.slice(0, chars)}...${hash.slice(-chars)}`
}

export function isValidDomain(domain: string): boolean {
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/
    return domainRegex.test(domain)
}

export function isValidEthAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address)
}

export function calculateYield(principal: number, apy: number, days: number): number {
    return principal * (apy / 365) * days
}

export function calculateMaturityProgress(daysStaked: number, totalPeriod: number): number {
    return Math.min((daysStaked / totalPeriod) * 100, 100)
}

export function formatDuration(days: number): string {
    if (days >= 365) {
        const years = Math.floor(days / 365)
        const remainingDays = days % 365
        if (remainingDays === 0) return `${years} year${years > 1 ? 's' : ''}`
        return `${years} year${years > 1 ? 's' : ''} ${remainingDays} day${remainingDays > 1 ? 's' : ''}`
    }
    if (days >= 30) {
        const months = Math.floor(days / 30)
        const remainingDays = days % 30
        if (remainingDays === 0) return `${months} month${months > 1 ? 's' : ''}`
        return `${months} month${months > 1 ? 's' : ''} ${remainingDays} day${remainingDays > 1 ? 's' : ''}`
    }
    return `${days} day${days > 1 ? 's' : ''}`
}

export function formatGasPrice(gasPrice: number): string {
    return `${gasPrice.toFixed(6)} ETH`
}

export function getPriorityBadgeColor(priority: string): string {
    switch (priority.toLowerCase()) {
        case 'high':
            return 'text-red-600 border-red-600'
        case 'medium':
            return 'text-yellow-600 border-yellow-600'
        case 'low':
            return 'text-green-600 border-green-600'
        default:
            return 'text-gray-600 border-gray-600'
    }
}

export function formatSharePrice(price: number): string {
    if (price < 1) {
        return `$${price.toFixed(4)}`
    }
    return `$${price.toFixed(2)}`
}

export function calculateROI(initialValue: number, currentValue: number): number {
    return ((currentValue - initialValue) / initialValue) * 100
}

export function formatROI(roi: number): { value: string; color: string } {
    const sign = roi >= 0 ? '+' : ''
    const color = roi >= 0 ? 'text-green-600' : 'text-red-600'
    return { value: `${sign}${roi.toFixed(2)}%`, color }
}

export function formatLargeNumber(num: number): string {
    if (num >= 1000000000) {
        return `${(num / 1000000000).toFixed(1)}B`
    }
    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
}

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export function debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout
    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => func(...args), delay)
    }
}