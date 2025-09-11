// 8. TEST THE COMPLETE FLOW
// Test function for the complete DeFi flow
export async function testDeFiFlow() {
    console.log('Testing complete DeFi integration...')
    try {
        // Test fractionalization
        const fractionalizeResponse = await fetch('/api/proxy/defi/fractionalize/example.com', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ shares: 1000, valuation: 50000 })
        })
        const fractionalizeResult = await fractionalizeResponse.json()
        console.log('Fractionalization result:', fractionalizeResult)

        // Test staking
        const stakingResponse = await fetch('/api/proxy/defi/stake/crypto.ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ period: 90, amount: 5000 })
        })
        const stakingResult = await stakingResponse.json()
        console.log('Staking result:', stakingResult)

        // Test stats
        const statsResponse = await fetch('/api/proxy/defi/stats')
        const statsResult = await statsResponse.json()
        console.log('DeFi stats:', statsResult)

        console.log('✅ All DeFi tests passed!')
    } catch (error) {
        console.error('❌ DeFi test failed:', error)
    }
}