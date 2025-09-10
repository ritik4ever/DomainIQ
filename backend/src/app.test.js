const request = require('supertest')
const app = require('./app')

describe('API Health Check', () => {
    test('GET /health should return OK status', async () => {
        const response = await request(app)
            .get('/health')
            .expect(200)

        expect(response.body.status).toBe('OK')
        expect(response.body.timestamp).toBeDefined()
    })
})

describe('Domain API', () => {
    test('GET /api/domains/search should require query parameter', async () => {
        const response = await request(app)
            .get('/api/domains/search')
            .expect(400)

        expect(response.body.error).toBe('Query parameter required')
    })

    test('GET /api/domains/search should return domain results', async () => {
        const response = await request(app)
            .get('/api/domains/search?q=test')
            .expect(200)

        expect(response.body.domains).toBeDefined()
        expect(Array.isArray(response.body.domains)).toBe(true)
    })
})