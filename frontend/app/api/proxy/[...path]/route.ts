import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001'

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
    try {
        const path = params.path.join('/')
        const searchParams = request.nextUrl.searchParams
        const url = `${BACKEND_URL}/api/${path}?${searchParams}`

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Proxy GET error:', error)
        return NextResponse.json({ error: 'Proxy request failed' }, { status: 500 })
    }
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
    try {
        const path = params.path.join('/')
        const body = await request.json()

        const response = await fetch(`${BACKEND_URL}/api/${path}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        })

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Proxy POST error:', error)
        return NextResponse.json({ error: 'Proxy request failed' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
    try {
        const path = params.path.join('/')

        const response = await fetch(`${BACKEND_URL}/api/${path}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Proxy DELETE error:', error)
        return NextResponse.json({ error: 'Proxy request failed' }, { status: 500 })
    }
}