'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
    { name: 'Jan', value: 82 },
    { name: 'Feb', value: 84 },
    { name: 'Mar', value: 83 },
    { name: 'Apr', value: 87 },
    { name: 'May', value: 89 },
    { name: 'Jun', value: 85 },
]

export default function ScoreChart() {
    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[75, 95]} />
                    <Tooltip />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#2563eb"
                        strokeWidth={2}
                        dot={{ fill: '#2563eb', r: 4 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}