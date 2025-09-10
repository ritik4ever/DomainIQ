require('dotenv').config()

async function testWalletSetup() {
    try {
        console.log('Testing wallet setup...')

        // Import after fixing the Web3 issue
        const domaBlockchainService = require('./src/services/domaBlockchainService')

        // Check network info
        const networkInfo = await domaBlockchainService.getNetworkInfo()
        console.log('Network Info:', networkInfo)

        // Check balance
        const balance = await domaBlockchainService.getBalance()
        console.log('Wallet Balance:', balance)

        if (parseFloat(balance.balance) > 0) {
            console.log('✅ Wallet has ETH - ready for transactions!')
        } else {
            console.log('❌ Wallet has no ETH - need to get testnet ETH')
            console.log('Your wallet address:', balance.address)
            console.log('Use this address to get testnet ETH from faucets')
        }

        // Test domain availability
        const testDomain = 'mytest123.com'
        const availability = await domaBlockchainService.isDomainAvailable(testDomain)
        console.log('Domain availability test:', availability)

    } catch (error) {
        console.error('Setup test failed:', error.message)
        console.log('Make sure to fix the Web3 import in domaBlockchainService.js')
    }
}

testWalletSetup()