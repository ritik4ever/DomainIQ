'use client'

import '@rainbow-me/rainbowkit/styles.css'
import {
    getDefaultConfig,
    RainbowKitProvider,
    darkTheme
} from '@rainbow-me/rainbowkit'
import { WagmiProvider } from 'wagmi'
import {
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
} from 'wagmi/chains'
import {
    QueryClientProvider,
    QueryClient,
} from '@tanstack/react-query'

const config = getDefaultConfig({
    appName: 'DomainIQ',
    projectId: 'YOUR_PROJECT_ID', // Get from https://cloud.walletconnect.com
    chains: [mainnet, polygon, optimism, arbitrum, base],
    ssr: true,
})

const queryClient = new QueryClient()

export default function WalletProvider({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider
                    theme={darkTheme({
                        accentColor: '#3b82f6',
                        accentColorForeground: 'white',
                        borderRadius: 'medium',
                    })}
                >
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}