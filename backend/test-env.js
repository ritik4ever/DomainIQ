require('dotenv').config()

console.log('All environment variables:')
console.log('DOMA_PRIVATE_KEY:', process.env.DOMA_PRIVATE_KEY?.substring(0, 10) + '...')
console.log('DOMA_ADDRESS:', process.env.DOMA_ADDRESS)

if (!process.env.DOMA_PRIVATE_KEY) {
    console.log('❌ DOMA_PRIVATE_KEY not found in environment')
    console.log('Current working directory:', process.cwd())
    console.log('Looking for .env file...')
    const fs = require('fs')
    try {
        const envContent = fs.readFileSync('.env', 'utf8')
        console.log('✅ .env file found')
        console.log('Contains DOMA_PRIVATE_KEY:', envContent.includes('DOMA_PRIVATE_KEY'))
    } catch (error) {
        console.log('❌ .env file not found:', error.message)
    }
} else {
    console.log('✅ DOMA_PRIVATE_KEY loaded successfully')
}
