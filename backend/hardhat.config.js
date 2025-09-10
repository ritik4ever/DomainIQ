require('dotenv').config()

module.exports = {
    solidity: '0.8.19',
    networks: {
        hardhat: {
            chainId: 31337
        },
        sepolia: {
            url: `https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
        }
    }
}