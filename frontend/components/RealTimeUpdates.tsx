'use client'

import { useState, useEffect } from 'react'
import { wsClient } from '@/lib/websocket'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, TrendingUp, Users, Zap } from 'lucide-react'

interface RealTimeEvent {
    type: string
    event: string
    data: any
    timestamp: string
}

export default function RealTimeUpdates() {
    const [events, setEvents] = useState<RealTimeEvent[]>([])
    const [connectionStatus, setConnectionStatus] = useState('connecting')
    const [liveMetrics, setLiveMetrics] = useState({
        activeDomains: 0,
        recentTransactions: 0,
        avgScore: 0,
        totalValue: 0
    })

    useEffect(() => {
        // Initialize WebSocket connection
        wsClient.connect()

        // Subscribe to events
        wsClient.subscribe('connected', () => {
            setConnectionStatus('connected')
        })

        wsClient.subscribe('disconnected', () => {
            setConnectionStatus('disconnected')
        })

        wsClient.subscribe('domain_event', (data: RealTimeEvent) => {
            setEvents(prev => [data, ...prev.slice(0, 9)]) // Keep last 10 events
            updateLiveMetrics(data)
        })

        wsClient.subscribe('analysis_result', (data: any) => {
            console.log('Real-time analysis:', data)
        })

        return () => {
            wsClient.disconnect()
        }
    }, [])

    const updateLiveMetrics = (event: RealTimeEvent) => {
        setLiveMetrics(prev => ({
            ...prev,
            recentTransactions: prev.recentTransactions + 1,
            avgScore: event.data.aiScore || prev.avgScore,
            totalValue: prev.totalValue + (event.data.estimatedValue || 0)
        }))
    }

    const getEventIcon = (eventType: string) => {
        switch (eventType) {
            case 'NAME_TOKEN_MINTED': return <Zap className="w-4 h-4 text-green-500" />
            case 'NAME_TOKEN_TRANSFERRED': return <Users className="w-4 h-4 text-blue-500" />
            default: return <Activity className="w-4 h-4 text-gray-500" />
        }
    }

    const getEventColor = (eventType: string) => {
        switch (eventType) {
            case 'NAME_TOKEN_MINTED': return 'success'
            case 'NAME_TOKEN_TRANSFERRED': return 'default'
            default: return 'secondary'
        }
    }

    return (
        <div className="space-y-6">
            {/* Connection Status */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Live Market Updates</h3>
                <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                    <span className="text-sm text-gray-600 capitalize">{connectionStatus}</span>
                </div>
            </div>

            {/* Live Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Activity className="w-4 h-4 text-primary-600" />
                            <div>
                                <p className="text-sm text-gray-600">Live Txns</p>
                                <p className="text-lg font-semibold">{liveMetrics.recentTransactions}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <div>
                                <p className="text-sm text-gray-600">Avg Score</p>
                                <p className="text-lg font-semibold">{liveMetrics.avgScore}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-blue-600" />
                            <div>
                                <p className="text-sm text-gray-600">Active</p>
                                <p className="text-lg font-semibold">{liveMetrics.activeDomains}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <Zap className="w-4 h-4 text-yellow-600" />
                            <div>
                                <p className="text-sm text-gray-600">Volume</p>
                                <p className="text-lg font-semibold">${liveMetrics.totalValue.toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Event Feed */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Activity className="w-5 h-5 mr-2" />
                        Real-time Events
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {events.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">Waiting for live events...</p>
                    ) : (
                        <div className="space-y-3">
                            {events.map((event, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        {getEventIcon(event.event)}
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {event.data.action === 'minted' ? 'Domain Minted' : 'Domain Transferred'}
                                            </p>
                                            <p className="text-sm text-gray-600">{event.data.domain}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant={getEventColor(event.event) as any}>
                                            Score: {event.data.aiScore || 'N/A'}
                                        </Badge>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(event.timestamp).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}