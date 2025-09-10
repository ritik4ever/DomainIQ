import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001'

export async function GET(request: NextRequest) {
    const { searchParams, pathname } = new URL(request.url)
    const path = pathname.replace('/api/proxy', '')

    try {
        const backendUrl = `${BACKEND_URL}${path}?${searchParams.toString()}`
        const response = await fetch(backendUrl)
        const data = await response.json()

        return NextResponse.json(data)
    } catch (error) {
        console.error('Proxy error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch data' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    const { pathname } = new URL(request.url)
    const path = pathname.replace('/api/proxy', '')
    const body = await request.json()

    try {
        const response = await fetch(`${BACKEND_URL}${path}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        })

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Proxy error:', error)
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        )
    }
}