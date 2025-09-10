import React, { useState, useEffect } from 'react'

export const LiveOpportunities: React.FC = () => {
    const [notifications, setNotifications] = useState<any[]>([])
    const [showNotifications, setShowNotifications] = useState(false)

    useEffect(() => {
        // Simulate live opportunities for demo
        const interval = setInterval(() => {
            const mockOpportunities = [
                { domain: 'crypto.ai', type: 'ARBITRAGE', message: 'AI valuation 25% above market', volume: 15000 },
                { domain: 'defi.io', type: 'LISTING', message: 'High-value domain ready for listing', volume: 8500 },
                { domain: 'web3.com', type: 'BUY', message: 'Undervalued purchase opportunity', volume: 25000 },
                { domain: 'nft.xyz', type: 'TOKENIZE', message: 'Premium domain tokenization opportunity', volume: 12000 }
            ]

            const randomOp = mockOpportunities[Math.floor(Math.random() * mockOpportunities.length)]
            const notification = {
                id: Date.now(),
                ...randomOp,
                timestamp: new Date().toISOString()
            }

            setNotifications(prev => [notification, ...prev.slice(0, 9)])
        }, 30000) // Every 30 seconds

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="fixed top-4 right-4 z-50">
            <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow border border-gray-200"
            >
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>

                {notifications.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                        {notifications.length}
                    </span>
                )}
            </button>

            {showNotifications && (
                <div className="absolute top-14 right-0 w-80 max-h-96 overflow-auto bg-white rounded-lg shadow-xl border border-gray-200">
                    <div className="p-4 border-b border-gray-200">
                        <h4 className="font-semibold text-gray-800">Live Opportunities</h4>
                    </div>

                    <div className="p-4 space-y-3">
                        {notifications.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No new opportunities</p>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-semibold text-blue-900">{notification.domain}</span>
                                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                            {notification.type}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                                    <div className="flex justify-between text-xs text-gray-600">
                                        <span>Volume: <strong>${notification.volume?.toLocaleString()}</strong></span>
                                        <span>{new Date(notification.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}