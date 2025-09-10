'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Star, MessageSquare, ThumbsUp } from 'lucide-react'

interface CommunityScore {
    userId: string
    score: number
    comment: string
    timestamp: string
    votes: number
}

interface CommunityScoringProps {
    domain: string
}

export default function CommunityScoring({ domain }: CommunityScoringProps) {
    const [communityScores, setCommunityScores] = useState<CommunityScore[]>([
        {
            userId: '0x742d...f44e',
            score: 85,
            comment: 'Great brandability for AI market. Strong investment potential.',
            timestamp: '2024-09-08T10:30:00Z',
            votes: 12
        },
        {
            userId: '0x1a2b...c3d4',
            score: 78,
            comment: 'Solid domain but .xyz extension limits premium value.',
            timestamp: '2024-09-08T09:15:00Z',
            votes: 8
        }
    ])

    const [userScore, setUserScore] = useState(0)
    const [userComment, setUserComment] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const averageScore = communityScores.length > 0
        ? Math.round(communityScores.reduce((sum, score) => sum + score.score, 0) / communityScores.length)
        : 0

    const submitScore = async () => {
        if (userScore === 0) return

        setSubmitting(true)
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))

            const newScore: CommunityScore = {
                userId: '0x' + Math.random().toString(16).substr(2, 8) + '...' + Math.random().toString(16).substr(2, 4),
                score: userScore,
                comment: userComment || 'No comment provided',
                timestamp: new Date().toISOString(),
                votes: 0
            }

            setCommunityScores(prev => [newScore, ...prev])
            setUserScore(0)
            setUserComment('')
        } catch (error) {
            console.error('Submit score error:', error)
        } finally {
            setSubmitting(false)
        }
    }

    const voteOnScore = (index: number) => {
        setCommunityScores(prev =>
            prev.map((score, i) =>
                i === index ? { ...score, votes: score.votes + 1 } : score
            )
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Users className="w-5 h-5 mr-2" />
                        Community Scoring
                    </div>
                    <Badge variant="outline">
                        Avg: {averageScore}/100
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Submit Score */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Rate this domain</h4>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm text-gray-600 mb-2">Your Score (1-100)</label>
                            <div className="flex items-center space-x-2">
                                {[20, 40, 60, 80, 100].map(score => (
                                    <button
                                        key={score}
                                        onClick={() => setUserScore(score)}
                                        className={`px-3 py-2 rounded text-sm font-medium transition-colors ${userScore === score
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        {score}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-2">Comment (optional)</label>
                            <textarea
                                value={userComment}
                                onChange={(e) => setUserComment(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                rows={2}
                                placeholder="Share your thoughts on this domain..."
                            />
                        </div>

                        <Button
                            onClick={submitScore}
                            disabled={userScore === 0 || submitting}
                            size="sm"
                        >
                            {submitting ? 'Submitting...' : 'Submit Rating'}
                        </Button>
                    </div>
                </div>

                {/* Community Scores */}
                <div className="space-y-4">
                    <h4 className="font-semibold">Community Feedback</h4>
                    {communityScores.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">
                            Be the first to rate this domain!
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {communityScores.map((score, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                                <Users className="w-4 h-4 text-gray-600" />
                                            </div>
                                            <span className="text-sm font-medium">{score.userId}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Badge variant={score.score >= 80 ? 'success' : score.score >= 60 ? 'default' : 'secondary'}>
                                                {score.score}/100
                                            </Badge>
                                        </div>
                                    </div>

                                    <p className="text-gray-700 text-sm mb-3">{score.comment}</p>

                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span>{new Date(score.timestamp).toLocaleDateString()}</span>
                                        <button
                                            onClick={() => voteOnScore(index)}
                                            className="flex items-center space-x-1 hover:text-primary-600 transition-colors"
                                        >
                                            <ThumbsUp className="w-3 h-3" />
                                            <span>{score.votes}</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}