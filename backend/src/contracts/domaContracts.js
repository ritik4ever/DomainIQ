const DOMA_CONTRACTS = {
    // Doma Testnet
    DOMA_TESTNET: {
        network: 'doma',
        chainId: 94830,
        rpc: 'https://rpc.doma.xyz',
        contracts: {
            DomaRecord: '0xF6A92E0f8bEa4174297B0219d9d47fEe335f84f8',
            OwnershipToken: '0x424bDf2E8a6F52Bd2c1C81D9437b0DC0309DF90f',
            CrossChainGateway: '0xCE1476C791ff195e462632bf9Eb22f3d3cA07388'
        }
    },
    // Sepolia Testnet (easier to test with)
    SEPOLIA: {
        network: 'sepolia',
        chainId: 11155111,
        rpc: 'https://rpc.ankr.com/eth_sepolia',
        contracts: {
            DomaRecord: '0xD9A0E86AACf2B01013728fcCa9F00093B9b4F3Ff',
            OwnershipToken: '0x9A374915648f1352827fFbf0A7bB5752b6995eB7',
            CrossChainGateway: '0xEC67EfB227218CCc3c032a6507339E7B4D623Ad'
        }
    }
}

// Simplified ABI for key functions
const DOMA_RECORD_ABI = [
    {
        "inputs": [{ "name": "name", "type": "string" }],
        "name": "claim",
        "outputs": [{ "name": "", "type": "uint256" }],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [{ "name": "tokenId", "type": "uint256" }],
        "name": "ownerOf",
        "outputs": [{ "name": "", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
    }
]

module.exports = { DOMA_CONTRACTS, DOMA_RECORD_ABI }